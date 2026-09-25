from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import Allocation, Bed, Room, Building, Property, User
from app.schemas.domain import AllocationCreate, AllocationResponse
from app.services.allocation_service import AllocationService

router = APIRouter(prefix="/allocations", tags=["Room & Bed Allocations"])


@router.get("/my-room")
def get_my_room(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # Find active allocation for current tenant
    allocation = db.query(Allocation).filter(
        Allocation.tenant_id == current_user.id,
        Allocation.status == "ACTIVE"
    ).first()

    if not allocation or not allocation.bed:
        return {
            "is_allocated": False,
            "message": "No active bed allocation found. Please contact administration or book a stay."
        }

    bed = allocation.bed
    room = bed.room
    floor = room.floor if room else None
    building = floor.building if floor else None
    prop = building.property if building else None

    # Get all beds in this room and occupants
    room_beds = []
    roommates = []
    if room:
        for b in room.beds:
            is_me = (b.id == bed.id)
            tenant_info = None
            if b.current_tenant:
                tenant_info = {
                    "id": b.current_tenant.id,
                    "name": b.current_tenant.full_name,
                    "email": b.current_tenant.email,
                    "phone": b.current_tenant.phone,
                    "avatar_url": b.current_tenant.avatar_url,
                    "is_me": is_me
                }
                if not is_me:
                    roommates.append(tenant_info)

            room_beds.append({
                "bed_id": b.id,
                "bed_code": b.bed_code,
                "status": b.status,
                "monthly_rent": b.monthly_rent,
                "is_current_user": is_me,
                "occupant": tenant_info
            })

    return {
        "is_allocated": True,
        "allocation_id": allocation.id,
        "check_in_date": str(allocation.check_in_date),
        "monthly_rent": allocation.monthly_rent,
        "deposit_amount": allocation.deposit_amount,
        "my_bed": {
            "id": bed.id,
            "code": bed.bed_code,
            "rent": bed.monthly_rent,
            "status": bed.status
        },
        "room": {
            "id": room.id if room else None,
            "number": room.room_number if room else "A-101",
            "type": room.room_type if room else "DOUBLE",
            "capacity": room.capacity if room else 2,
            "image_url": room.image_url if room else None,
            "beds": room_beds
        },
        "building": building.name if building else "Block A",
        "floor": floor.floor_name if floor else "First Floor",
        "property": {
            "id": prop.id if prop else None,
            "name": prop.name if prop else "Sunrise PG",
            "locality": prop.locality if prop else "Koramangala",
            "city": prop.city if prop else "Bengaluru",
            "contact_phone": prop.contact_phone if prop else "+91 98765 43210"
        },
        "roommates": roommates
    }


@router.get("", response_model=List[AllocationResponse])
def get_allocations(
    property_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    q = db.query(Allocation).join(Bed).join(Room).join(Floor).join(Building)
    if property_id:
        q = q.filter(Building.property_id == property_id)
    if status and status != "ALL":
        q = q.filter(Allocation.status == status.upper())
    allocs = q.order_by(Allocation.created_at.desc()).all()
    res = []
    for alloc in allocs:
        res.append(AllocationResponse(
            id=alloc.id,
            bed_id=alloc.bed_id,
            tenant_id=alloc.tenant_id,
            check_in_date=alloc.check_in_date,
            check_out_date=alloc.check_out_date,
            status=alloc.status,
            monthly_rent=alloc.monthly_rent,
            deposit_amount=alloc.deposit_amount,
            notes=alloc.notes,
            created_at=alloc.created_at,
            bed_code=alloc.bed.bed_code if alloc.bed else None,
            room_number=alloc.bed.room.room_number if alloc.bed and alloc.bed.room else None,
            tenant_name=alloc.tenant.full_name if alloc.tenant else None
        ))
    return res


@router.post("", response_model=AllocationResponse)
def create_allocation(
    data: AllocationCreate,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    alloc = AllocationService.allocate_bed(db, data)
    return AllocationResponse(
        id=alloc.id,
        bed_id=alloc.bed_id,
        tenant_id=alloc.tenant_id,
        check_in_date=alloc.check_in_date,
        check_out_date=alloc.check_out_date,
        status=alloc.status,
        monthly_rent=alloc.monthly_rent,
        deposit_amount=alloc.deposit_amount,
        notes=alloc.notes,
        created_at=alloc.created_at,
        bed_code=alloc.bed.bed_code if alloc.bed else None,
        room_number=alloc.bed.room.room_number if alloc.bed and alloc.bed.room else None,
        tenant_name=alloc.tenant.full_name if alloc.tenant else None
    )


@router.post("/{id}/release", response_model=AllocationResponse)
def release_allocation(
    id: str,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    alloc = AllocationService.release_bed(db, id)
    return AllocationResponse(
        id=alloc.id,
        bed_id=alloc.bed_id,
        tenant_id=alloc.tenant_id,
        check_in_date=alloc.check_in_date,
        check_out_date=alloc.check_out_date,
        status=alloc.status,
        monthly_rent=alloc.monthly_rent,
        deposit_amount=alloc.deposit_amount,
        notes=alloc.notes,
        created_at=alloc.created_at,
        bed_code=alloc.bed.bed_code if alloc.bed else None,
        room_number=alloc.bed.room.room_number if alloc.bed and alloc.bed.room else None,
        tenant_name=alloc.tenant.full_name if alloc.tenant else None
    )
