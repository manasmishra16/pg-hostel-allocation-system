from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.domain import PropertyTrustScoreResponse
from app.services.trust_score_service import TrustScoreService

router = APIRouter(prefix="/trust", tags=["StayNest Trust Score"])


@router.get("/property/{property_id}", response_model=PropertyTrustScoreResponse)
def get_property_trust_score(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return TrustScoreService.calculate_and_save_trust_score(property_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/property/{property_id}/recalculate", response_model=PropertyTrustScoreResponse)
def recalculate_property_trust_score(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return TrustScoreService.calculate_and_save_trust_score(property_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
