from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        RESIDENT = 'RESIDENT', 'Resident'
        GUARDIAN = 'GUARDIAN', 'Guardian'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        SECURITY = 'SECURITY', 'Security Personnel'

    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    email = models.EmailField(blank=True, null=True, unique=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.RESIDENT)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    fcm_token = models.TextField(blank=True, null=True, help_text='Firebase Cloud Messaging token for push notifications')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    @property
    def first_name(self):
        parts = self.full_name.strip().split(' ', 1)
        return parts[0] if parts else ''

    @property
    def last_name(self):
        parts = self.full_name.strip().split(' ', 1)
        return parts[1] if len(parts) > 1 else ''

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.full_name} ({self.phone_number})'

    @property
    def is_resident(self):
        return self.role == self.Role.RESIDENT

    @property
    def is_guardian(self):
        return self.role == self.Role.GUARDIAN

    @property
    def is_volunteer(self):
        return self.role == self.Role.VOLUNTEER

    @property
    def is_security(self):
        return self.role == self.Role.SECURITY


class ResidentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resident_profile')
    flat = models.ForeignKey('society.Flat', on_delete=models.SET_NULL, null=True, blank=True, related_name='residents')
    date_of_birth = models.DateField(blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True)
    medical_conditions = models.TextField(blank=True, help_text='Known medical conditions or allergies')
    is_dependent = models.BooleanField(default=False, help_text='Is this resident a dependent (senior/child)?')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'resident_profiles'

    def __str__(self):
        return f'Profile: {self.user.full_name}'


class GuardianProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='guardian_profile')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guardian_profiles'

    def __str__(self):
        return f'Guardian: {self.user.full_name}'


class VolunteerProfile(models.Model):
    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BUSY = 'BUSY', 'Busy'
        OFFLINE = 'OFFLINE', 'Offline'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    society = models.ForeignKey('society.Society', on_delete=models.SET_NULL, null=True, blank=True, related_name='volunteers')
    skills = models.TextField(blank=True, help_text='First aid, firefighting, etc.')
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE
    )
    is_on_duty = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'volunteer_profiles'

    def __str__(self):
        return f'Volunteer: {self.user.full_name}'


class SecurityProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_profile')
    society = models.ForeignKey('society.Society', on_delete=models.SET_NULL, null=True, blank=True, related_name='security_staff')
    badge_number = models.CharField(max_length=50, blank=True)
    shift = models.CharField(max_length=50, blank=True, help_text='Morning / Evening / Night')
    is_on_duty = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'security_profiles'

    def __str__(self):
        return f'Security: {self.user.full_name}'


class EmergencyContact(models.Model):
    class ContactType(models.TextChoices):
        PRIMARY_GUARDIAN = 'PRIMARY', 'Primary Guardian'
        SECONDARY_GUARDIAN = 'SECONDARY', 'Secondary Guardian'
        EMERGENCY = 'EMERGENCY', 'Emergency Contact'

    resident = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='emergency_contacts')
    contact_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='guardian_for')
    contact_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=15)
    contact_email = models.EmailField(blank=True)
    contact_type = models.CharField(max_length=20, choices=ContactType.choices)
    relationship = models.CharField(max_length=100, blank=True, help_text='Spouse, Son, Daughter, etc.')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emergency_contacts'
        ordering = ['contact_type', 'created_at']

    def __str__(self):
        return f'{self.contact_name} ({self.contact_type}) for {self.resident.user.full_name}'


class OTPToken(models.Model):
    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50, default='registration')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'otp_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f'OTP {self.otp} for {self.email} [{self.purpose}]'


class SystemSetting(models.Model):
    default_response_timeout_seconds = models.PositiveIntegerField(default=60)
    default_search_radius_meters = models.PositiveIntegerField(default=2000)
    max_search_radius_meters = models.PositiveIntegerField(default=5000)
    sms_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)
    community_broadcast_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f'SystemSettings #{self.id}'

    @classmethod
    def get_settings(cls):
        settings_obj, _ = cls.objects.get_or_create(id=1)
        return settings_obj


