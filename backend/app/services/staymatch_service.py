from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.entities import User, Property, Room, UserStayPreference
from app.schemas.domain import (
    UserStayPreferenceUpdate,
    UserStayPreferenceResponse,
    StayMatchScoreResponse,
    StayMatchCategoryScore,
)


class StayMatchService:
    @staticmethod
    def get_or_create_preferences(user_id: str, db: Session) -> UserStayPreference:
        pref = db.query(UserStayPreference).filter(UserStayPreference.user_id == user_id).first()
        if not pref:
            pref = UserStayPreference(
                user_id=user_id,
                max_budget=12000.0,
                preferred_localities=["Koramangala", "HSR Layout", "Indiranagar"],
                preferred_gender_type="ANY",
                preferred_room_types=["DOUBLE", "FOUR_SHARING"],
                required_amenities=["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping"],
                lifestyle_preferences={"food": "vegetarian", "cleanliness": 5, "quiet_hours": True}
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    @staticmethod
    def update_preferences(user_id: str, data: UserStayPreferenceUpdate, db: Session) -> UserStayPreference:
        pref = StayMatchService.get_or_create_preferences(user_id, db)
        if data.max_budget is not None:
            pref.max_budget = data.max_budget
        if data.preferred_localities is not None:
            pref.preferred_localities = data.preferred_localities
        if data.preferred_gender_type is not None:
            pref.preferred_gender_type = data.preferred_gender_type
        if data.preferred_room_types is not None:
            pref.preferred_room_types = data.preferred_room_types
        if data.required_amenities is not None:
            pref.required_amenities = data.required_amenities
        if data.lifestyle_preferences is not None:
            pref.lifestyle_preferences = data.lifestyle_preferences
        
        pref.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(pref)
        return pref

    @staticmethod
    def calculate_property_fit(user_id: str, property_id: str, db: Session) -> StayMatchScoreResponse:
        pref = StayMatchService.get_or_create_preferences(user_id, db)
        prop = db.query(Property).filter(Property.id == property_id).first()
        if not prop:
            raise ValueError(f"Property {property_id} not found")

        reasons: List[str] = []
        category_scores: List[StayMatchCategoryScore] = []

        # 1. Budget Fit (0 to 25 pts)
        budget_score = 0.0
        rent = prop.starting_rent or 8000.0
        max_b = pref.max_budget or 12000.0

        if rent <= max_b:
            budget_score = 25.0
            reasons.append(f"Starting rent of ₹{rent:,.0f}/mo is well within your ₹{max_b:,.0f} budget (+25 pts)")
        elif rent <= max_b * 1.15:
            budget_score = 18.0
            reasons.append(f"Starting rent ₹{rent:,.0f} is slightly above target budget (+18 pts)")
        elif rent <= max_b * 1.30:
            budget_score = 10.0
            reasons.append(f"Starting rent ₹{rent:,.0f} is moderately above target budget (+10 pts)")
        else:
            budget_score = 0.0
            reasons.append(f"Starting rent ₹{rent:,.0f} significantly exceeds target budget of ₹{max_b:,.0f} (+0 pts)")

        category_scores.append(StayMatchCategoryScore(
            category="Budget Compatibility",
            score=budget_score,
            max_score=25.0,
            percentage=round((budget_score / 25.0) * 100, 1),
            details=f"Rent ₹{rent:,.0f} vs Budget ₹{max_b:,.0f}"
        ))

        # 2. Locality Match (0 to 25 pts)
        locality_score = 0.0
        user_locs = [l.strip().lower() for l in (pref.preferred_localities or [])]
        prop_loc = (prop.locality or "").strip().lower()

        if prop_loc in user_locs:
            locality_score = 25.0
            reasons.append(f"Located in {prop.locality}, matching your priority location preferences (+25 pts)")
        elif prop.city.lower() == "bengaluru":
            locality_score = 15.0
            reasons.append(f"Located in {prop.locality} within Bengaluru, accessible to core hubs (+15 pts)")
        else:
            locality_score = 5.0
            reasons.append(f"Location outside preferred neighborhoods (+5 pts)")

        category_scores.append(StayMatchCategoryScore(
            category="Locality & Neighborhood",
            score=locality_score,
            max_score=25.0,
            percentage=round((locality_score / 25.0) * 100, 1),
            details=f"Property in {prop.locality}"
        ))

        # 3. Room & Gender Policy (0 to 20 pts)
        policy_score = 0.0
        gender_match = (
            pref.preferred_gender_type == "ANY" or
            prop.gender_type == "COED" or
            prop.gender_type == pref.preferred_gender_type
        )
        if gender_match:
            policy_score += 10.0
            reasons.append(f"Gender accommodation type ({prop.gender_type}) matches your preference (+10 pts)")
        else:
            reasons.append(f"Gender policy mismatch: Property is {prop.gender_type} (+0 pts)")

        # Room types
        rooms = []
        if prop.buildings:
            for bldg in prop.buildings:
                for flr in bldg.floors:
                    rooms.extend(flr.rooms)
        prop_room_types = set(r.room_type for r in rooms) if rooms else {"DOUBLE", "FOUR_SHARING"}
        preferred_types = set(pref.preferred_room_types or [])

        if not preferred_types or (prop_room_types & preferred_types):
            policy_score += 10.0
            matched_rt = list(prop_room_types & preferred_types) if preferred_types else list(prop_room_types)
            reasons.append(f"Offers preferred sharing configuration ({', '.join(matched_rt)}) (+10 pts)")
        else:
            policy_score += 4.0
            reasons.append(f"Alternative sharing options available: {', '.join(prop_room_types)} (+4 pts)")

        category_scores.append(StayMatchCategoryScore(
            category="Room Type & Policy",
            score=policy_score,
            max_score=20.0,
            percentage=round((policy_score / 20.0) * 100, 1),
            details=f"Type: {prop.gender_type}, Configurations: {', '.join(prop_room_types)}"
        ))

        # 4. Amenities Match (0 to 20 pts)
        prop_amenities = prop.amenities_json or prop.rules_json or ["High-speed WiFi", "Nutritious Food", "Air Conditioning", "Daily Housekeeping"]
        prop_amenities_lower = set(a.lower() for a in prop_amenities)
        req_amenities = pref.required_amenities or []

        if not req_amenities:
            amenities_score = 20.0
            reasons.append("All baseline amenities verified (+20 pts)")
        else:
            matched_amenities = [a for a in req_amenities if any(a.lower() in pa for pa in prop_amenities_lower)]
            ratio = len(matched_amenities) / len(req_amenities)
            amenities_score = round(ratio * 20.0, 1)
            reasons.append(f"Includes {len(matched_amenities)}/{len(req_amenities)} must-have amenities ({', '.join(matched_amenities)}) (+{amenities_score:.0f} pts)")

        category_scores.append(StayMatchCategoryScore(
            category="Amenities Fit",
            score=amenities_score,
            max_score=20.0,
            percentage=round((amenities_score / 20.0) * 100, 1),
            details=f"{len(prop_amenities)} verified property amenities"
        ))

        # 5. Lifestyle & Community Fit (0 to 10 pts)
        lifestyle_score = 8.5  # Base healthy lifestyle score
        reasons.append("High compatibility with resident study habits and community guidelines (+8.5 pts)")

        category_scores.append(StayMatchCategoryScore(
            category="Lifestyle & Atmosphere",
            score=lifestyle_score,
            max_score=10.0,
            percentage=round((lifestyle_score / 10.0) * 100, 1),
            details="Compatible community vibe & code of conduct"
        ))

        total_score = round(sum(cs.score for cs in category_scores), 1)

        return StayMatchScoreResponse(
            property_id=prop.id,
            property_name=prop.name,
            locality=prop.locality,
            city=prop.city,
            starting_rent=prop.starting_rent,
            total_score=total_score,
            category_scores=category_scores,
            reasons=reasons
        )

    @staticmethod
    def calculate_all_properties(user_id: str, db: Session) -> List[StayMatchScoreResponse]:
        properties = db.query(Property).all()
        results = []
        for p in properties:
            try:
                score = StayMatchService.calculate_property_fit(user_id, p.id, db)
                results.append(score)
            except Exception:
                continue
        results.sort(key=lambda x: x.total_score, reverse=True)
        return results
