from django.db import models


class Society(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India', blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    radius_meters = models.IntegerField(default=1000, null=True, blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    contact_email = models.EmailField(blank=True)
    total_flats = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'societies'
        verbose_name = 'Society'
        verbose_name_plural = 'Societies'

    def __str__(self):
        return f'{self.name}, {self.city}'


class Block(models.Model):
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=100, help_text='Block A / Tower 1 / Wing B')
    total_floors = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blocks'
        unique_together = ['society', 'name']

    def __str__(self):
        return f'{self.name} - {self.society.name}'


class Flat(models.Model):
    class OccupancyStatus(models.TextChoices):
        OCCUPIED = 'OCCUPIED', 'Occupied'
        VACANT = 'VACANT', 'Vacant'
        OWNER = 'OWNER', 'Owner Occupied'
        RENTED = 'RENTED', 'Rented'

    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='flats')
    flat_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField(default=0)
    occupancy_status = models.CharField(
        max_length=20,
        choices=OccupancyStatus.choices,
        default=OccupancyStatus.VACANT
    )
    owner_name = models.CharField(max_length=150, blank=True)
    owner_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'flats'
        unique_together = ['block', 'flat_number']
        ordering = ['block', 'flat_number']

    def __str__(self):
        return f'{self.block.society.name} / {self.block.name} / {self.flat_number}'

    @property
    def full_address(self):
        return f'Flat {self.flat_number}, {self.block.name}, {self.block.society.name}'
