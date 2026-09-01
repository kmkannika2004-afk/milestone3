from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import ResidentProfile, GuardianProfile, VolunteerProfile, SecurityProfile, EmergencyContact, SystemSetting

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.CharField(required=False)
        self.fields['phone_number'] = serializers.CharField(required=False)
        if 'username' in self.fields:
            self.fields['username'].required = False

    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username')
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        user = None
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass

        if not user and phone_number:
            try:
                user = User.objects.get(phone_number=phone_number)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials.'})

        if not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid credentials.'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'User account is disabled.'})

        refresh = self.get_token(user)

        society_id = None
        if hasattr(user, 'resident_profile') and user.resident_profile and user.resident_profile.flat:
            society_id = user.resident_profile.flat.block.society_id

        return {
            'success': True,
            'message': 'Login successful.',
            'data': {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'expires_in': 86400,
                'user': {
                    'id': user.id,
                    'name': user.full_name,
                    'email': user.email or '',
                    'role': user.role.lower(),
                    'society_id': society_id
                }
            }
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['role'] = user.role
        token['email'] = user.email or ''
        token['phone_number'] = user.phone_number or ''
        return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.CharField(default='resident')
    society_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    flat_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'phone_number', 'email', 'full_name', 'role', 'password', 'society_id', 'flat_id']
        extra_kwargs = {
            'full_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_null': True, 'allow_blank': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        role_str = attrs.get('role', 'resident').upper()
        if role_str not in User.Role.values:
            attrs['role'] = User.Role.RESIDENT
        else:
            attrs['role'] = role_str
        return attrs

    def create(self, validated_data):
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        society_id = validated_data.pop('society_id', None)
        flat_id = validated_data.pop('flat_id', None)

        if not validated_data.get('full_name'):
            validated_data['full_name'] = f"{first_name} {last_name}".strip() or validated_data.get('email', 'User')

        if not validated_data.get('phone_number'):
            # Fallback random identifier if not provided
            import random
            validated_data['phone_number'] = f"99{random.randint(10000000, 99999999)}"

        user = User.objects.create_user(**validated_data)

        # Auto-create role profiles
        if user.role == User.Role.RESIDENT:
            ResidentProfile.objects.create(user=user, flat_id=flat_id)
        elif user.role == User.Role.GUARDIAN:
            GuardianProfile.objects.create(user=user)
        elif user.role == User.Role.VOLUNTEER:
            VolunteerProfile.objects.create(user=user, society_id=society_id)
        elif user.role == User.Role.SECURITY:
            SecurityProfile.objects.create(user=user, society_id=society_id)
        return user


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    purpose = serializers.CharField(default='registration')


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, min_length=4, required=True)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, min_length=4, required=True)
    new_password = serializers.CharField(min_length=8, required=True)


class CurrentUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)
    role = serializers.SerializerMethodField()
    society = serializers.SerializerMethodField()
    flat = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'society', 'flat']

    def get_role(self, obj):
        return obj.role.lower()

    def get_society(self, obj):
        if hasattr(obj, 'resident_profile') and obj.resident_profile and obj.resident_profile.flat:
            soc = obj.resident_profile.flat.block.society
            return {'id': soc.id, 'name': soc.name}
        if hasattr(obj, 'security_profile') and obj.security_profile and obj.security_profile.society:
            soc = obj.security_profile.society
            return {'id': soc.id, 'name': soc.name}
        if hasattr(obj, 'volunteer_profile') and obj.volunteer_profile and obj.volunteer_profile.society:
            soc = obj.volunteer_profile.society
            return {'id': soc.id, 'name': soc.name}
        return None

    def get_flat(self, obj):
        if hasattr(obj, 'resident_profile') and obj.resident_profile and obj.resident_profile.flat:
            flat = obj.resident_profile.flat
            return {'id': flat.id, 'number': flat.flat_number}
        return None




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'email', 'full_name', 'role', 'profile_picture',
                  'is_active', 'is_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'full_name', 'profile_picture', 'fcm_token']


class ResidentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    flat_number = serializers.CharField(source='flat.flat_number', read_only=True)
    block_name = serializers.CharField(source='flat.block.name', read_only=True)
    society_name = serializers.CharField(source='flat.block.society.name', read_only=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'


class ResidentProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentProfile
        fields = ['flat', 'date_of_birth', 'blood_group', 'medical_conditions', 'is_dependent']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = '__all__'


class VolunteerAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = ['availability_status', 'is_on_duty']


class SecurityProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SecurityProfile
        fields = '__all__'


class GuardianProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = GuardianProfile
        fields = '__all__'


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = '__all__'
        read_only_fields = ['resident']

    def validate_contact_phone(self, value):
        import re
        if not re.match(r'^\+?[0-9]{10,15}$', value):
            raise serializers.ValidationError('Enter a valid phone number.')
        return value


class FCMTokenUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['fcm_token']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'Passwords do not match.'})
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)
    status = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'status']

    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'

    def get_role(self, obj):
        return obj.role.lower()


class UserDetailSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'status']

    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'

    def get_role(self, obj):
        return obj.role.lower()


class UserUpdatePatchSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)


class UserStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['active', 'inactive'], required=True)


class PlatformAdminUserCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    role = serializers.CharField(required=True)
    society_id = serializers.IntegerField(required=False, allow_null=True)


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = [
            'default_response_timeout_seconds',
            'default_search_radius_meters',
            'max_search_radius_meters',
            'sms_enabled',
            'email_enabled',
            'community_broadcast_enabled'
        ]


