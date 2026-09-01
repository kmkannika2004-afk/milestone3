from rest_framework import serializers
from .models import Society, Block, Flat


class SocietySerializer(serializers.ModelSerializer):
    total_blocks = serializers.SerializerMethodField()

    class Meta:
        model = Society
        fields = '__all__'

    def get_total_blocks(self, obj):
        return obj.blocks.count()


class BlockSerializer(serializers.ModelSerializer):
    society_name = serializers.CharField(source='society.name', read_only=True)
    total_flats = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = '__all__'

    def get_total_flats(self, obj):
        return obj.flats.count()


class FlatSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    society_name = serializers.CharField(source='block.society.name', read_only=True)
    society_id = serializers.IntegerField(source='block.society.id', read_only=True)
    full_address = serializers.CharField(read_only=True)
    residents = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = '__all__'

    def get_residents(self, obj):
        from apps.users.serializers import UserSerializer
        return UserSerializer(
            [r.user for r in obj.residents.select_related('user').all()],
            many=True
        ).data


class FlatListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for flat listings"""
    block_name = serializers.CharField(source='block.name', read_only=True)
    society_name = serializers.CharField(source='block.society.name', read_only=True)

    class Meta:
        model = Flat
        fields = ['id', 'flat_number', 'floor', 'block', 'block_name', 'society_name', 'occupancy_status']
