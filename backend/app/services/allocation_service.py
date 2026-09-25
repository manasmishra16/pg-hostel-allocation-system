import threading
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import Bed, Room, Allocation, User
from app.schemas.domain import AllocationCreate
from app.services.notification_service import NotificationService

_allocation_lock = threading.Lock()


class AllocationService:
    @staticmethod
    def allocate_bed(db: Session, data: AllocationCreate) -> Allocation:
        with _allocation_lock:
            # 1. Acquire row-level lock on the bed (PostgreSQL)
            query = db.query(Bed).filter(Bed.id == data.bed_id)
            if db.bind and db.bind.dialect.name == "postgresql":
                query = query.with_for_update()
            bed = query.first()

            if not bed:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bed not found")

            # 2. Prevent double allocation: Bed must be AVAILABLE and free of active tenant
            if bed.status == "OCCUPIED" or bed.current_tenant_id is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bed '{bed.bed_code}' is already occupied. Double-allocation is prohibited."
                )

            # 2b. Database-level relational check: ensure no existing ACTIVE allocation for this bed
            existing_bed_active = db.query(Allocation).filter(
                Allocation.bed_id == data.bed_id,
                Allocation.status == "ACTIVE"
            ).first()
            if existing_bed_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bed '{bed.bed_code}' already has an active allocation. Double-allocation is prohibited."
                )

            # 3. Verify Tenant exists
            tenant = db.query(User).filter(User.id == data.tenant_id).first()
            if not tenant:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

            # 4. Check if tenant already has an active allocation
            existing_active = db.query(Allocation).filter(
                Allocation.tenant_id == data.tenant_id,
                Allocation.status == "ACTIVE"
            ).first()
            if existing_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tenant '{tenant.full_name}' already has an active allocation in another room/bed."
                )

            # 5. Create Allocation
            check_in = data.check_in_date or date.today()
            rent = data.monthly_rent if data.monthly_rent is not None else bed.monthly_rent
            
            allocation = Allocation(
                bed_id=bed.id,
                tenant_id=tenant.id,
                check_in_date=check_in,
                status="ACTIVE",
                monthly_rent=rent,
                deposit_amount=data.deposit_amount or (rent * 2),
                notes=data.notes
            )
            db.add(allocation)

            # 6. Update Bed state
            bed.status = "OCCUPIED"
            bed.current_tenant_id = tenant.id

            db.commit()
            db.refresh(allocation)

            # 7. Dispatch Allocation Confirmation Notification to Tenant
            room_num = bed.room.room_number if bed.room else "Assigned Room"
            try:
                NotificationService.notify_bed_allocated(db, tenant.id, bed.bed_code, room_num)
            except Exception:
                pass

            return allocation

    @staticmethod
    def release_bed(db: Session, allocation_id: str) -> Allocation:
        allocation = db.query(Allocation).filter(Allocation.id == allocation_id).first()
        if not allocation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation not found")

        if allocation.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Allocation is not currently active")

        # Complete allocation
        allocation.status = "COMPLETED"
        allocation.check_out_date = date.today()

        # Free bed
        bed = db.query(Bed).filter(Bed.id == allocation.bed_id).first()
        if bed:
            bed.status = "AVAILABLE"
            bed.current_tenant_id = None

        db.commit()
        db.refresh(allocation)
        return allocation
