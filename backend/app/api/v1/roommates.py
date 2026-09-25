from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User, RoommatePreference
from app.schemas.domain import RoommatePreferenceBase, RoommatePreferenceResponse, RoommateMatchCard
from app.services.roommate_service import RoommateService

router = APIRouter(prefix="/roommates", tags=["Roommate Matching"])


@router.get("/matches", response_model=List[RoommateMatchCard])
def get_roommate_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return RoommateService.get_matches_for_tenant(db, current_user.id)


@router.get("/preferences", response_model=RoommatePreferenceResponse)
def get_my_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(RoommatePreference).filter(RoommatePreference.tenant_id == current_user.id).first()
    if not pref:
        pref = RoommatePreference(tenant_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return RoommatePreferenceResponse.model_validate(pref)


@router.put("/preferences", response_model=RoommatePreferenceResponse)
def update_my_preferences(
    data: RoommatePreferenceBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(RoommatePreference).filter(RoommatePreference.tenant_id == current_user.id).first()
    if not pref:
        pref = RoommatePreference(tenant_id=current_user.id)
        db.add(pref)

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(pref, field, val)

    db.commit()
    db.refresh(pref)
    return RoommatePreferenceResponse.model_validate(pref)
