from typing import List
from sqlalchemy.orm import Session
from app.models.entities import User, RoommatePreference, Allocation, Bed, Room
from app.schemas.domain import RoommateMatchCard


class RoommateService:
    @staticmethod
    def calculate_compatibility(p1: RoommatePreference, p2: RoommatePreference) -> dict:
        """
        Transparent weighted matching algorithm:
        - Circadian / Sleep Schedule: 25%
        - Cleanliness: 25%
        - Noise Tolerance: 20%
        - Lifestyle (Smoking, Drinking, Food): 15%
        - Academic (Course & Year): 15%
        Total: 100%
        """
        # 1. Circadian (25%)
        circadian = 70
        if p1.sleep_schedule and p2.sleep_schedule:
            if p1.sleep_schedule == p2.sleep_schedule:
                circadian = 100
            elif "flexible" in (p1.sleep_schedule, p2.sleep_schedule):
                circadian = 85
            else:
                circadian = 50
        else:
            circadian = 80

        # 2. Cleanliness (25%)
        clean_c1 = p1.cleanliness if p1.cleanliness is not None else 3
        clean_c2 = p2.cleanliness if p2.cleanliness is not None else 3
        clean_diff = abs(clean_c1 - clean_c2)
        cleanliness = max(20, min(100, 100 - (clean_diff * 20)))

        # 3. Noise Tolerance (20%)
        noise_n1 = p1.noise_tolerance if p1.noise_tolerance is not None else 3
        noise_n2 = p2.noise_tolerance if p2.noise_tolerance is not None else 3
        noise_diff = abs(noise_n1 - noise_n2)
        noise = max(20, min(100, 100 - (noise_diff * 20)))

        # 4. Lifestyle (15%) - Smoking, Drinking, Food
        smoking_score = 100 if p1.smoking == p2.smoking else 35
        drinking_score = 100 if p1.drinking == p2.drinking else 50
        food_score = 100 if (p1.food_preference == p2.food_preference or "any" in (p1.food_preference or "", p2.food_preference or "")) else 70
        lifestyle = int((smoking_score * 0.4) + (drinking_score * 0.3) + (food_score * 0.3))
        lifestyle = max(30, min(100, lifestyle))

        # 5. Academic (15%) - Course & Year
        course_score = 100 if (p1.course and p2.course and p1.course.strip().lower() == p2.course.strip().lower()) else 70
        year_diff = abs((p1.year_of_study or 1) - (p2.year_of_study or 1))
        year_score = 100 if year_diff == 0 else (85 if year_diff == 1 else 60)
        academic = int((course_score * 0.6) + (year_score * 0.4))
        academic = max(40, min(100, academic))

        # Overall weighted total: 25% + 25% + 20% + 15% + 15% = 100%
        overall = round(
            (circadian * 0.25) +
            (cleanliness * 0.25) +
            (noise * 0.20) +
            (lifestyle * 0.15) +
            (academic * 0.15)
        )

        match_tag = "Excellent Match" if overall >= 85 else ("Great Match" if overall >= 75 else "Good Match")

        return {
            "overall": int(overall),
            "circadian": int(circadian),
            "sleep": int(circadian),
            "cleanliness": int(cleanliness),
            "noise": int(noise),
            "lifestyle": int(lifestyle),
            "academic": int(academic),
            "match_tag": match_tag,
            "weights": {
                "circadian": "25%",
                "cleanliness": "25%",
                "noise": "20%",
                "lifestyle": "15%",
                "academic": "15%"
            }
        }

    @staticmethod
    def get_matches_for_tenant(db: Session, current_tenant_id: str) -> List[RoommateMatchCard]:
        my_pref = db.query(RoommatePreference).filter(RoommatePreference.tenant_id == current_tenant_id).first()
        if not my_pref:
            # Create a default preference profile if not present
            my_pref = RoommatePreference(
                tenant_id=current_tenant_id,
                course="Computer Science",
                year_of_study=3,
                sleep_schedule="night_owl",
                noise_tolerance=3,
                cleanliness=4,
                smoking="non_smoker",
                food_preference="vegetarian"
            )
            db.add(my_pref)
            db.commit()
            db.refresh(my_pref)

        other_prefs = db.query(RoommatePreference).filter(RoommatePreference.tenant_id != current_tenant_id).all()
        results: List[RoommateMatchCard] = []

        for op in other_prefs:
            user = db.query(User).filter(User.id == op.tenant_id).first()
            if not user or not user.is_active:
                continue

            scores = RoommateService.calculate_compatibility(my_pref, op)

            # Get room & bed info if allocated
            alloc = db.query(Allocation).filter(
                Allocation.tenant_id == user.id,
                Allocation.status == "ACTIVE"
            ).first()

            room_no = None
            bed_code = None
            if alloc and alloc.bed:
                bed_code = alloc.bed.bed_code
                if alloc.bed.room:
                    room_no = alloc.bed.room.room_number

            results.append(RoommateMatchCard(
                tenant_id=user.id,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                course=op.course or "General Studies",
                year_of_study=op.year_of_study or 1,
                overall_compatibility=scores["overall"],
                academic_compatibility=scores["academic"],
                lifestyle_compatibility=scores["lifestyle"],
                sleep_compatibility=scores["sleep"],
                cleanliness_compatibility=scores["cleanliness"],
                noise_compatibility=scores["noise"],
                match_tag=scores["match_tag"],
                room_number=room_no,
                bed_code=bed_code,
                bio=op.bio,
                hobbies=op.hobbies
            ))

        results.sort(key=lambda x: x.overall_compatibility, reverse=True)
        return results
