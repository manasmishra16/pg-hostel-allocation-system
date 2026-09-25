import os
import math
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from sqlalchemy.orm import Session
from app.models.entities import UserDestination, CommuteCache, Property
from app.schemas.domain import (
    UserDestinationCreate,
    UserDestinationResponse,
    CommuteCalculationResponse,
)


# Standard Bengaluru locality coordinates fallback
LOCALITY_COORDINATES = {
    "koramangala": (12.9352, 77.6245),
    "hsr layout": (12.9121, 77.6446),
    "indiranagar": (12.9784, 77.6408),
    "electronic city": (12.8452, 77.6602),
    "whitefield": (12.9698, 77.7500),
    "marathahalli": (12.9591, 77.6974),
    "bellandur": (12.9304, 77.6784),
    "bengaluru": (12.9716, 77.5946),
}


class CommuteService:
    @staticmethod
    def get_destinations(user_id: str, db: Session) -> List[UserDestination]:
        destinations = db.query(UserDestination).filter(UserDestination.user_id == user_id).all()
        # If user has no destination, seed a primary university destination for testing
        if not destinations:
            seed_dest = UserDestination(
                user_id=user_id,
                name="Christ University (Central Campus)",
                destination_type="COLLEGE",
                address="Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka 560029",
                latitude=12.9344,
                longitude=77.6060,
                travel_mode="DRIVING",
                is_primary=True,
            )
            work_dest = UserDestination(
                user_id=user_id,
                name="Embassy TechVillage (Cisco / Wells Fargo)",
                destination_type="WORK",
                address="Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru 560103",
                latitude=12.9288,
                longitude=77.6917,
                travel_mode="DRIVING",
                is_primary=False,
            )
            db.add_all([seed_dest, work_dest])
            db.commit()
            destinations = [seed_dest, work_dest]
        return destinations

    @staticmethod
    def create_destination(user_id: str, data: UserDestinationCreate, db: Session) -> UserDestination:
        if data.is_primary:
            # Demote existing primary
            db.query(UserDestination).filter(
                UserDestination.user_id == user_id,
                UserDestination.is_primary == True
            ).update({"is_primary": False})

        dest = UserDestination(
            user_id=user_id,
            name=data.name,
            destination_type=data.destination_type,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
            travel_mode=data.travel_mode,
            is_primary=data.is_primary,
        )
        db.add(dest)
        db.commit()
        db.refresh(dest)
        return dest

    @staticmethod
    def delete_destination(user_id: str, dest_id: str, db: Session) -> bool:
        dest = db.query(UserDestination).filter(
            UserDestination.id == dest_id,
            UserDestination.user_id == user_id
        ).first()
        if not dest:
            return False
        db.delete(dest)
        db.commit()
        return True

    @staticmethod
    def _resolve_property_coords(prop: Property) -> tuple[float, float]:
        if prop.latitude is not None and prop.longitude is not None:
            return (prop.latitude, prop.longitude)
        loc = (prop.locality or "").strip().lower()
        if loc in LOCALITY_COORDINATES:
            return LOCALITY_COORDINATES[loc]
        return LOCALITY_COORDINATES["bengaluru"]

    @staticmethod
    def calculate_commute(property_id: str, destination_id: str, db: Session) -> CommuteCalculationResponse:
        prop = db.query(Property).filter(Property.id == property_id).first()
        if not prop:
            raise ValueError(f"Property {property_id} not found")

        dest = db.query(UserDestination).filter(UserDestination.id == destination_id).first()
        if not dest:
            raise ValueError(f"Destination {destination_id} not found")

        origin_lat, origin_lng = CommuteService._resolve_property_coords(prop)
        dest_lat, dest_lng = dest.latitude, dest.longitude
        travel_mode = dest.travel_mode or "DRIVING"
        provider = os.getenv("COMMUTE_PROVIDER", "OSRM")

        # 1. Check CommuteCache
        now = datetime.utcnow()
        cache = db.query(CommuteCache).filter(
            CommuteCache.travel_mode == travel_mode,
            CommuteCache.expires_at > now,
            CommuteCache.origin_lat.between(origin_lat - 0.001, origin_lat + 0.001),
            CommuteCache.origin_lng.between(origin_lng - 0.001, origin_lng + 0.001),
            CommuteCache.dest_lat.between(dest_lat - 0.001, dest_lat + 0.001),
            CommuteCache.dest_lng.between(dest_lng - 0.001, dest_lng + 0.001),
        ).first()

        if cache:
            return CommuteCalculationResponse(
                destination_id=dest.id,
                destination_name=dest.name,
                property_id=prop.id,
                property_name=prop.name,
                travel_mode=travel_mode,
                distance_km=cache.distance_km,
                duration_mins=cache.duration_mins,
                provider=cache.provider,
                is_cached=True,
                status="AVAILABLE"
            )

        # 2. Call external routing provider (OSRM)
        osrm_mode = "driving"
        if travel_mode.upper() == "WALKING":
            osrm_mode = "foot"
        elif travel_mode.upper() == "TWO_WHEELER":
            osrm_mode = "driving"

        url = f"https://router.project-osrm.org/route/v1/{osrm_mode}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=false"

        try:
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    if data.get("code") == "Ok" and data.get("routes"):
                        route = data["routes"][0]
                        distance_km = round(route["distance"] / 1000.0, 2)
                        duration_mins = round(route["duration"] / 60.0, 1)

                        # Save into DB cache
                        cache_entry = CommuteCache(
                            origin_lat=origin_lat,
                            origin_lng=origin_lng,
                            dest_lat=dest_lat,
                            dest_lng=dest_lng,
                            travel_mode=travel_mode,
                            distance_km=distance_km,
                            duration_mins=duration_mins,
                            provider="OSRM",
                            expires_at=now + timedelta(days=7)
                        )
                        db.add(cache_entry)
                        db.commit()

                        return CommuteCalculationResponse(
                            destination_id=dest.id,
                            destination_name=dest.name,
                            property_id=prop.id,
                            property_name=prop.name,
                            travel_mode=travel_mode,
                            distance_km=distance_km,
                            duration_mins=duration_mins,
                            provider="OSRM",
                            is_cached=False,
                            status="AVAILABLE"
                        )
        except Exception:
            pass

        # If external provider is unavailable, strictly report UNAVAILABLE — never invent fake data
        return CommuteCalculationResponse(
            destination_id=dest.id,
            destination_name=dest.name,
            property_id=prop.id,
            property_name=prop.name,
            travel_mode=travel_mode,
            distance_km=None,
            duration_mins=None,
            provider=provider,
            is_cached=False,
            status="UNAVAILABLE",
            message="Maps routing provider is currently unreachable. Real distance cannot be calculated."
        )

    @staticmethod
    def calculate_all_destinations(property_id: str, user_id: str, db: Session) -> List[CommuteCalculationResponse]:
        destinations = CommuteService.get_destinations(user_id, db)
        results = []
        for dest in destinations:
            try:
                calc = CommuteService.calculate_commute(property_id, dest.id, db)
                results.append(calc)
            except Exception:
                continue
        return results
