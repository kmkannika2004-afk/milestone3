from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.society.models import Society, Block, Flat
from apps.users.models import (
    ResidentProfile, GuardianProfile, VolunteerProfile, SecurityProfile, EmergencyContact
)
from apps.sos.models import SOSAlert, AlertResponse
from apps.communication.models import Announcement, ContactDirectory, ChatRoom, ChatMessage

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds realistic demo data for the Community Emergency Response Platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting demo data seeding...'))

        # 1. Create Society
        society, created = Society.objects.get_or_create(
            name='Greenfield Heights Community',
            defaults={
                'address': '42 Evergreen Boulevard, Sector 5',
                'city': 'Metropolis',
                'state': 'State Region',
                'pincode': '560001',
                'contact_phone': '080-9999-0000',
                'contact_email': 'security@greenfieldheights.org',
                'total_flats': 120,
                'is_active': True,
            }
        )
        self.stdout.write(f'Society: {society.name}')

        # 2. Create Blocks & Flats
        block_a, _ = Block.objects.get_or_create(society=society, name='Block A', defaults={'total_floors': 5})
        block_b, _ = Block.objects.get_or_create(society=society, name='Block B', defaults={'total_floors': 5})

        flat_a101, _ = Flat.objects.get_or_create(
            block=block_a, flat_number='A-101',
            defaults={'floor': 1, 'occupancy_status': Flat.OccupancyStatus.OWNER, 'owner_name': 'Elena Rostova'}
        )
        flat_a102, _ = Flat.objects.get_or_create(
            block=block_a, flat_number='A-102',
            defaults={'floor': 1, 'occupancy_status': Flat.OccupancyStatus.OWNER, 'owner_name': 'David Chen'}
        )
        flat_b201, _ = Flat.objects.get_or_create(
            block=block_b, flat_number='B-201',
            defaults={'floor': 2, 'occupancy_status': Flat.OccupancyStatus.RENTED, 'owner_name': 'Rajesh Sharma'}
        )

        # 3. Create Admin User
        admin_user, _ = User.objects.get_or_create(
            phone_number='9900939609',
            defaults={
                'full_name': 'System Administrator',
                'email': 'admin@cerp.com',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        admin_user.set_password('Admin@1234')
        admin_user.save()

        # 4. Create Security Officer
        security_user, _ = User.objects.get_or_create(
            phone_number='9876543220',
            defaults={
                'full_name': 'Officer Marcus Vance',
                'email': 'security@cerp.com',
                'role': User.Role.SECURITY,
                'is_verified': True,
            }
        )
        security_user.set_password('Password123')
        security_user.save()

        SecurityProfile.objects.get_or_create(
            user=security_user,
            defaults={'society': society, 'badge_number': 'SEC-8891', 'shift': 'Day/Night', 'is_on_duty': True}
        )

        # 5. Create Guardian
        guardian_user, _ = User.objects.get_or_create(
            phone_number='9876543230',
            defaults={
                'full_name': 'Sarah Rostova',
                'email': 'sarah@cerp.com',
                'role': User.Role.GUARDIAN,
                'is_verified': True,
            }
        )
        guardian_user.set_password('Password123')
        guardian_user.save()

        GuardianProfile.objects.get_or_create(user=guardian_user)

        # 6. Create Volunteer
        volunteer_user, _ = User.objects.get_or_create(
            phone_number='9876543240',
            defaults={
                'full_name': 'Dr. Anita Roy',
                'email': 'anita@cerp.com',
                'role': User.Role.VOLUNTEER,
                'is_verified': True,
            }
        )
        volunteer_user.set_password('Password123')
        volunteer_user.save()

        VolunteerProfile.objects.get_or_create(
            user=volunteer_user,
            defaults={
                'society': society,
                'skills': 'Certified First Aid, CPR Specialist, Emergency Medical Triage',
                'availability_status': VolunteerProfile.AvailabilityStatus.AVAILABLE,
                'is_on_duty': True
            }
        )

        # 7. Create Resident Users
        resident_user1, _ = User.objects.get_or_create(
            phone_number='9876543210',
            defaults={
                'full_name': 'Elena Rostova',
                'email': 'resident@cerp.com',
                'role': User.Role.RESIDENT,
                'is_verified': True,
            }
        )
        resident_user1.set_password('Password123')
        resident_user1.save()

        res_profile1, _ = ResidentProfile.objects.get_or_create(
            user=resident_user1,
            defaults={
                'flat': flat_a101,
                'blood_group': 'O+',
                'medical_conditions': 'Asthma, Penicillin Allergy',
                'is_dependent': False
            }
        )

        resident_user2, _ = User.objects.get_or_create(
            phone_number='9876543211',
            defaults={
                'full_name': 'David Chen',
                'email': 'david@cerp.com',
                'role': User.Role.RESIDENT,
                'is_verified': True,
            }
        )
        resident_user2.set_password('Password123')
        resident_user2.save()

        res_profile2, _ = ResidentProfile.objects.get_or_create(
            user=resident_user2,
            defaults={
                'flat': flat_a102,
                'blood_group': 'A+',
                'medical_conditions': 'Hypertension',
                'is_dependent': False
            }
        )

        # 8. Create Emergency Contacts
        EmergencyContact.objects.get_or_create(
            resident=res_profile1,
            contact_user=guardian_user,
            defaults={
                'contact_name': 'Sarah Rostova',
                'contact_phone': '9876543230',
                'contact_email': 'sarah@cerp.com',
                'contact_type': EmergencyContact.ContactType.PRIMARY_GUARDIAN,
                'relationship': 'Sister',
                'is_verified': True,
                'is_active': True
            }
        )

        # 9. Create SOS Alerts
        alert1, _ = SOSAlert.objects.get_or_create(
            resident=res_profile1,
            category=SOSAlert.EmergencyCategory.MEDICAL,
            status=SOSAlert.AlertStatus.ACTIVE,
            defaults={
                'message': 'CRITICAL: Severe shortness of breath and sudden chest pressure. Need medical volunteer immediately.',
                'escalation_level': SOSAlert.EscalationLevel.PRIMARY_GUARDIAN,
                'latitude': 12.971600,
                'longitude': 77.594600,
                'location_address': 'Flat A-101, 1st Floor, Block A, Greenfield Heights',
                'assigned_responder': security_user
            }
        )

        AlertResponse.objects.get_or_create(
            alert=alert1,
            responder=security_user,
            defaults={
                'action': AlertResponse.ResponseAction.EN_ROUTE,
                'notes': 'Officer Vance dispatched to Block A with first aid oxygen kit.'
            }
        )

        AlertResponse.objects.get_or_create(
            alert=alert1,
            responder=volunteer_user,
            defaults={
                'action': AlertResponse.ResponseAction.ACKNOWLEDGED,
                'notes': 'Dr. Anita Roy notified. Bringing emergency pulse oximeter.'
            }
        )

        alert2, _ = SOSAlert.objects.get_or_create(
            resident=res_profile2,
            category=SOSAlert.EmergencyCategory.SECURITY,
            status=SOSAlert.AlertStatus.OPEN,
            defaults={
                'message': 'Unidentified person tampering with lock on Block A 1st floor corridor.',
                'escalation_level': SOSAlert.EscalationLevel.COMMUNITY,
                'latitude': 12.971800,
                'longitude': 77.594800,
                'location_address': 'Corridor near Flat A-102, Block A',
            }
        )

        # Historic Resolved Alert
        alert3, _ = SOSAlert.objects.get_or_create(
            resident=res_profile1,
            category=SOSAlert.EmergencyCategory.FIRE,
            status=SOSAlert.AlertStatus.RESOLVED,
            defaults={
                'message': 'Electrical smoke detected in balcony power outlet.',
                'escalation_level': SOSAlert.EscalationLevel.COMMUNITY,
                'location_address': 'Flat A-101 Balcony',
                'resolution_notes': 'Main circuit breaker tripped. Security checked outlet with fire extinguisher. Safe.',
                'resolved_by': security_user
            }
        )

        # 10. Contact Directory
        ContactDirectory.objects.get_or_create(
            society=society,
            service_name='Metro Emergency Helpline / Police',
            defaults={'service_type': 'POLICE', 'phone_number': '112', 'alternate_phone': '080-2222-1111'}
        )
        ContactDirectory.objects.get_or_create(
            society=society,
            service_name='City Ambulance Dispatch Center',
            defaults={'service_type': 'AMBULANCE', 'phone_number': '108', 'alternate_phone': '080-4444-2222'}
        )
        ContactDirectory.objects.get_or_create(
            society=society,
            service_name='Central Fire Station',
            defaults={'service_type': 'FIRE', 'phone_number': '101', 'alternate_phone': '080-3333-5555'}
        )
        ContactDirectory.objects.get_or_create(
            society=society,
            service_name='Greenfield Security Main Gate Desk',
            defaults={'service_type': 'OTHER', 'phone_number': '080-9999-0000', 'alternate_phone': '9876543220'}
        )

        # 11. Announcements
        Announcement.objects.get_or_create(
            society=society,
            title='URGENT: Emergency Siren & Drill Test on Sunday',
            defaults={
                'content': 'The society emergency response team will conduct a 2-minute siren test at 10:00 AM this Sunday. No resident evacuation required.',
                'priority': 'URGENT',
                'created_by': admin_user,
                'is_active': True
            }
        )
        Announcement.objects.get_or_create(
            society=society,
            title='New Rapid First Aid & Defibrillator Station Installed',
            defaults={
                'content': 'AED and emergency medical trauma kit have been installed at Block A Security Gate 1 for community access.',
                'priority': 'HIGH',
                'created_by': admin_user,
                'is_active': True
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all demo data!'))
