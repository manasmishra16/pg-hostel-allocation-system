from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Room, Bed, Building, Floor
from app.schemas.domain import (
    RoomResponse,
    BedResponse,
    BuildingCreate,
    BuildingResponse,
    FloorCreate,
    FloorResponse,
    RoomCreate,
    BedCreate,
    BedStatusUpdate
)

router = APIRouter(prefix="/rooms", tags=["Rooms & Beds"])


@router.get("", response_model=List[RoomResponse])
def get_rooms(property_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Room)
    if property_id:
        q = q.join(Floor).join(Building).filter(Building.property_id == property_id)
    rooms = q.all()

    res = []
    for r in rooms:
        beds_res = []
        occupied = 0
        available = 0
        for bed in r.beds:
            if bed.status == "OCCUPIED":
                occupied += 1
            else:
                available += 1
            beds_res.append(BedResponse(
                id=bed.id,
                room_id=bed.room_id,
                bed_code=bed.bed_code,
                monthly_rent=bed.monthly_rent,
                status=bed.status,
                current_tenant_id=bed.current_tenant_id,
                current_tenant_name=bed.current_tenant.full_name if bed.current_tenant else None
            ))
        res.append(RoomResponse(
            id=r.id,
            floor_id=r.floor_id,
            room_number=r.room_number,
            room_type=r.room_type,
            capacity=r.capacity,
            base_rent=r.base_rent,
            is_active=r.is_active,
            image_url=r.image_url,
            beds=beds_res,
            occupied_count=occupied,
            available_count=available
        ))
    return res


@router.get("/beds", response_model=List[BedResponse])
def get_beds(room_id: Optional[str] = None, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Bed)
    if room_id:
        q = q.filter(Bed.room_id == room_id)
    if status_filter:
        q = q.filter(Bed.status == status_filter.upper())
    beds = q.all()
    return [
        BedResponse(
            id=b.id,
            room_id=b.room_id,
            bed_code=b.bed_code,
            monthly_rent=b.monthly_rent,
            status=b.status,
            current_tenant_id=b.current_tenant_id,
            current_tenant_name=b.current_tenant.full_name if b.current_tenant else None
        )
        for b in beds
    ]


@router.post("/buildings", response_model=BuildingResponse)
def create_building(
    data: BuildingCreate,
    db: Session = Depends(get_db)
):
    b = Building(
        property_id=data.property_id,
        name=data.name,
        total_floors=data.total_floors
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BuildingResponse(
        id=b.id,
        property_id=b.property_id,
        name=b.name,
        total_floors=b.total_floors,
        floors=[]
    )


@router.post("/floors", response_model=FloorResponse)
def create_floor(
    data: FloorCreate,
    db: Session = Depends(get_db)
):
    f = Floor(
        building_id=data.building_id,
        floor_number=data.floor_number,
        floor_name=data.floor_name
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return FloorResponse(
        id=f.id,
        building_id=f.building_id,
        floor_number=f.floor_number,
        floor_name=f.floor_name,
        rooms=[]
    )


@router.post("", response_model=RoomResponse)
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db)
):
    r = Room(
        floor_id=data.floor_id,
        room_number=data.room_number,
        room_type=data.room_type.upper(),
        capacity=data.capacity,
        base_rent=data.base_rent,
        image_url=data.image_url
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return RoomResponse(
        id=r.id,
        floor_id=r.floor_id,
        room_number=r.room_number,
        room_type=r.room_type,
        capacity=r.capacity,
        base_rent=r.base_rent,
        is_active=r.is_active,
        image_url=r.image_url,
        beds=[],
        occupied_count=0,
        available_count=0
    )


@router.post("/beds", response_model=BedResponse)
def create_bed(
    data: BedCreate,
    db: Session = Depends(get_db)
):
    bed = Bed(
        room_id=data.room_id,
        bed_code=data.bed_code,
        monthly_rent=data.monthly_rent,
        status=data.status.upper()
    )
    db.add(bed)
    db.commit()
    db.refresh(bed)
    return BedResponse(
        id=bed.id,
        room_id=bed.room_id,
        bed_code=bed.bed_code,
        monthly_rent=bed.monthly_rent,
        status=bed.status,
        current_tenant_id=None,
        current_tenant_name=None
    )


@router.patch("/beds/{bed_id}/status", response_model=BedResponse)
def update_bed_status(
    bed_id: str,
    data: BedStatusUpdate,
    db: Session = Depends(get_db)
):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bed not found")

    new_status = data.status.upper()
    valid_statuses = ("AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED")
    if new_status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status '{new_status}'. Allowed: {valid_statuses}")

    # Guard 1: Direct transition to OCCUPIED prohibited without allocation
    if new_status == "OCCUPIED" and bed.status != "OCCUPIED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Direct transition to OCCUPIED is prohibited. Allocate the bed to a tenant via /allocations."
        )

    # Guard 2: If bed is currently OCCUPIED, cannot transition to AVAILABLE or MAINTENANCE without vacating
    if bed.status == "OCCUPIED" and new_status in ("AVAILABLE", "MAINTENANCE"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition OCCUPIED bed to {new_status}. Vacate or reallocate the tenant first."
        )

    bed.status = new_status
    db.commit()
    db.refresh(bed)
    return BedResponse(
        id=bed.id,
        room_id=bed.room_id,
        bed_code=bed.bed_code,
        monthly_rent=bed.monthly_rent,
        status=bed.status,
        current_tenant_id=bed.current_tenant_id,
        current_tenant_name=bed.current_tenant.full_name if bed.current_tenant else None
    )
