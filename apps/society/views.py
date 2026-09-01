from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Society, Block, Flat
from .serializers import SocietySerializer, BlockSerializer, FlatSerializer, FlatListSerializer
from apps.users.permissions import IsAdminOrReadOnly


class SocietyViewSet(viewsets.ModelViewSet):
    """CRUD for Societies"""
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'city', 'pincode']
    filterset_fields = ['city', 'state', 'is_active']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        society = serializer.save()
        return Response({
            'success': True,
            'message': 'Society created successfully.',
            'data': {
                'id': society.id,
                'name': society.name,
                'status': 'active' if society.is_active else 'inactive'
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='blocks')
    def get_blocks(self, request, pk=None):
        society = self.get_object()
        blocks = Block.objects.filter(society=society)
        return Response(BlockSerializer(blocks, many=True).data)

    @action(detail=True, methods=['get'], url_path='volunteers')
    def get_volunteers(self, request, pk=None):
        from apps.users.models import VolunteerProfile
        from apps.users.serializers import VolunteerProfileSerializer
        society = self.get_object()
        volunteers = VolunteerProfile.objects.filter(
            society=society,
            availability_status='AVAILABLE',
            is_on_duty=True
        ).select_related('user')
        return Response(VolunteerProfileSerializer(volunteers, many=True).data)

    @action(detail=True, methods=['get'], url_path='security-staff')
    def get_security(self, request, pk=None):
        from apps.users.models import SecurityProfile
        from apps.users.serializers import SecurityProfileSerializer
        society = self.get_object()
        staff = SecurityProfile.objects.filter(society=society, is_on_duty=True).select_related('user')
        return Response(SecurityProfileSerializer(staff, many=True).data)


class BlockViewSet(viewsets.ModelViewSet):
    """CRUD for Blocks/Towers within a Society"""
    queryset = Block.objects.select_related('society').all()
    serializer_class = BlockSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['society']
    search_fields = ['name', 'society__name']

    @action(detail=True, methods=['get'], url_path='flats')
    def get_flats(self, request, pk=None):
        block = self.get_object()
        flats = Flat.objects.filter(block=block)
        return Response(FlatListSerializer(flats, many=True).data)


class FlatViewSet(viewsets.ModelViewSet):
    """CRUD for Flats"""
    queryset = Flat.objects.select_related('block__society').all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['block', 'block__society', 'occupancy_status', 'floor']
    search_fields = ['flat_number', 'owner_name', 'block__name']

    def get_serializer_class(self):
        if self.action == 'list':
            return FlatListSerializer
        return FlatSerializer
