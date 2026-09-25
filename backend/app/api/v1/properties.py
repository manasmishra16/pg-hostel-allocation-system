import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import Property, User, Building, Floor, Room, Bed
from app.schemas.domain import PropertyResponse, PropertyCreate, BuildingResponse, FloorResponse, RoomResponse, BedResponse

router = APIRouter(prefix="/properties", tags=["Properties"])


def build_property_response(prop: Property, db: Session) -> PropertyResponse:
    buildings_res = []
    for b in prop.buildings:
        floors_res = []
        for f in b.floors:
            rooms_res = []
            for r in f.rooms:
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
                rooms_res.append(RoomResponse(
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
            floors_res.append(FloorResponse(
                id=f.id,
                building_id=f.building_id,
                floor_number=f.floor_number,
                floor_name=f.floor_name,
                rooms=rooms_res
            ))
        buildings_res.append(BuildingResponse(
            id=b.id,
            property_id=b.property_id,
            name=b.name,
            total_floors=b.total_floors,
            floors=floors_res
        ))

    # Calculate total beds and occupied beds across all rooms
    all_beds = [b for bldg in buildings_res for f in bldg.floors for r in f.rooms for b in r.beds]
    tot_beds = len(all_beds)
    occ_beds = len([b for b in all_beds if b.status == "OCCUPIED"])

    return PropertyResponse(
        id=prop.id,
        owner_id=prop.owner_id,
        name=prop.name,
        slug=prop.slug,
        property_type=prop.property_type,
        gender_type=prop.gender_type,
        description=prop.description,
        address=prop.address,
        locality=prop.locality,
        city=prop.city,
        state=prop.state,
        pincode=prop.pincode,
        starting_rent=prop.starting_rent,
        rating=prop.rating,
        total_reviews=prop.total_reviews,
        is_verified=prop.is_verified,
        is_featured=prop.is_featured,
        cover_image=prop.cover_image,
        images_json=prop.images_json or [],
        images=prop.images_json or [],
        total_beds=tot_beds,
        occupied_beds=occ_beds,
        contact_phone=prop.contact_phone,
        contact_email=prop.contact_email,
        created_at=prop.created_at,
        buildings=buildings_res
    )


@router.get("", response_model=List[PropertyResponse])
def get_properties(
    locality: Optional[str] = None,
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    gender_type: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    search: Optional[str] = None,
    room_type: Optional[str] = None,
    has_ac: Optional[bool] = None,
    has_food: Optional[bool] = None,
    has_wifi: Optional[bool] = None,
    has_laundry: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    has_security: Optional[bool] = None,
    available_only: Optional[bool] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(Property)
    if locality and locality.lower() != "all":
        q = q.filter(Property.locality.ilike(f"%{locality}%"))
    if city:
        q = q.filter(Property.city.ilike(f"%{city}%"))
    if property_type and property_type.lower() != "all":
        q = q.filter(Property.property_type == property_type.upper())
    if gender_type and gender_type.lower() != "all":
        q = q.filter(Property.gender_type == gender_type.upper())
    if min_budget is not None:
        q = q.filter(Property.starting_rent >= min_budget)
    if max_budget is not None:
        q = q.filter(Property.starting_rent <= max_budget)
    if search:
        term = f"%{search}%"
        q = q.filter((Property.name.ilike(term)) | (Property.locality.ilike(term)) | (Property.address.ilike(term)))

    # Room type filter
    if room_type and room_type.upper() != "ALL":
        q = q.join(Building).join(Floor).join(Room).filter(Room.room_type == room_type.upper()).distinct()

    # Sorting
    if sort_by == "price_asc":
        q = q.order_by(Property.starting_rent.asc())
    elif sort_by == "price_desc":
        q = q.order_by(Property.starting_rent.desc())
    elif sort_by == "rating_desc":
        q = q.order_by(Property.rating.desc())
    elif sort_by == "newest":
        q = q.order_by(Property.created_at.desc())
    else:
        q = q.order_by(Property.created_at.desc())

    properties = q.offset(skip).limit(limit).all()
    results = [build_property_response(p, db) for p in properties]

    # Amenity post-filters (AC, Food, WiFi, Laundry, Parking, Security)
    if has_ac is not None and has_ac:
        results = [p for p in results if any("ac" in str(r).lower() for r in (p.rules_json or [])) or "ac" in p.name.lower() or "ac" in (p.description or "").lower()]
    if has_food is not None and has_food:
        results = [p for p in results if any(f in str(r).lower() for r in (p.rules_json or []) for f in ["food", "mess", "meal"]) or any(f in (p.description or "").lower() for f in ["food", "mess", "meal"])]
    if has_wifi is not None and has_wifi:
        results = [p for p in results if any("wifi" in str(r).lower() for r in (p.rules_json or [])) or "wifi" in (p.description or "").lower()]
    if has_laundry is not None and has_laundry:
        results = [p for p in results if any("laundry" in str(r).lower() for r in (p.rules_json or [])) or "laundry" in (p.description or "").lower()]
    if has_parking is not None and has_parking:
        results = [p for p in results if any("parking" in str(r).lower() for r in (p.rules_json or [])) or "parking" in (p.description or "").lower()]
    if has_security is not None and has_security:
        results = [p for p in results if any("security" in str(r).lower() for r in (p.rules_json or [])) or "cctv" in (p.description or "").lower()]
    if available_only is not None and available_only:
        results = [p for p in results if (p.total_beds - p.occupied_beds) > 0]

    return results


@router.get("/{id_or_slug}", response_model=PropertyResponse)
def get_property(id_or_slug: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter((Property.id == id_or_slug) | (Property.slug == id_or_slug)).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return build_property_response(prop, db)


@router.post("", response_model=PropertyResponse)
def create_property(
    data: PropertyCreate,
    current_user: User = Depends(require_roles("PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    slug = data.name.lower().replace(" ", "-") + f"-{uuid.uuid4().hex[:6]}"
    rent = data.starting_price if data.starting_price is not None else data.starting_rent
    images = data.images if data.images is not None else data.images_json
    cover = data.cover_image or (images[0] if images else "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200")

    prop = Property(
        owner_id=current_user.id,
        name=data.name,
        slug=slug,
        property_type=data.property_type.upper(),
        gender_type=data.gender_type.upper(),
        description=data.description,
        address=data.address,
        locality=data.locality,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        starting_rent=rent,
        cover_image=cover,
        images_json=images,
        rules_json=data.amenities or [],
        contact_phone=data.contact_phone or current_user.phone,
        contact_email=data.contact_email or current_user.email
    )
    db.add(prop)
    db.flush()

    # Automatically scaffold Building -> Floors -> Rooms -> Beds
    num_floors = data.total_floors or 3
    rooms_pf = data.rooms_per_floor or 4
    beds_pr = data.beds_per_room or 2

    building = Building(
        property_id=prop.id,
        name="Main Block",
        total_floors=num_floors
    )
    db.add(building)
    db.flush()

    bed_labels = ["Bed A", "Bed B", "Bed C", "Bed D", "Bed E", "Bed F"]

    for floor_idx in range(1, num_floors + 1):
        flr = Floor(
            building_id=building.id,
            floor_number=floor_idx,
            floor_name=f"Floor {floor_idx}"
        )
        db.add(flr)
        db.flush()

        for room_idx in range(1, rooms_pf + 1):
            room_num = f"{floor_idx}0{room_idx}"
            sharing_type = "DOUBLE" if beds_pr == 2 else ("SINGLE" if beds_pr == 1 else "FOUR_SHARING")
            rm = Room(
                floor_id=flr.id,
                room_number=room_num,
                room_type=sharing_type,
                capacity=beds_pr,
                base_rent=rent,
                image_url=cover
            )
            db.add(rm)
            db.flush()

            for b_idx in range(beds_pr):
                b_code = bed_labels[b_idx] if b_idx < len(bed_labels) else f"Bed {b_idx + 1}"
                bed = Bed(
                    room_id=rm.id,
                    bed_code=b_code,
                    monthly_rent=rent,
                    status="AVAILABLE"
                )
                db.add(bed)

    db.commit()
    db.refresh(prop)
    return build_property_response(prop, db)


@router.put("/{id}", response_model=PropertyResponse)
def update_property(
    id: str,
    data: PropertyCreate,
    current_user: User = Depends(require_roles("PROPERTY_OWNER", "SUPER_ADMIN", "WARDEN")),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    # Ownership check: only the property owner or super admin can modify
    if current_user.role == "PROPERTY_OWNER" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property")
    if current_user.role == "WARDEN" and prop.owner_id != current_user.id and current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Warden not authorized for this property")

    prop.name = data.name
    prop.property_type = data.property_type.upper()
    prop.gender_type = data.gender_type.upper()
    prop.description = data.description
    prop.address = data.address
    prop.locality = data.locality
    prop.city = data.city
    prop.state = data.state
    prop.pincode = data.pincode
    if data.starting_price is not None:
        prop.starting_rent = data.starting_price
    elif data.starting_rent is not None:
        prop.starting_rent = data.starting_rent
    if data.cover_image:
        prop.cover_image = data.cover_image
    if data.images:
        prop.images_json = data.images
    if data.amenities:
        prop.rules_json = data.amenities

    db.commit()
    db.refresh(prop)
    return build_property_response(prop, db)


@router.delete("/{id}")
def delete_property(
    id: str,
    current_user: User = Depends(require_roles("PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    if current_user.role == "PROPERTY_OWNER" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property")

    db.delete(prop)
    db.commit()
    return {"detail": "Property deleted successfully", "id": id}

