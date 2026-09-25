from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.domain import (
    UserStayPreferenceUpdate,
    UserStayPreferenceResponse,
    StayMatchScoreResponse,
)
from app.services.staymatch_service import StayMatchService

router = APIRouter(prefix="/staymatch", tags=["StayMatch - Intelligent Stay Fit Score"])


@router.get("/preferences", response_model=UserStayPreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = StayMatchService.get_or_create_preferences(current_user.id, db)
    return pref


@router.put("/preferences", response_model=UserStayPreferenceResponse)
def update_preferences(
    data: UserStayPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = StayMatchService.update_preferences(current_user.id, data, db)
    return pref


@router.get("/property/{property_id}", response_model=StayMatchScoreResponse)
def get_property_fit_score(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return StayMatchService.calculate_property_fit(current_user.id, property_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/all", response_model=List[StayMatchScoreResponse])
def get_all_properties_fit_scores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return StayMatchService.calculate_all_properties(current_user.id, db)
