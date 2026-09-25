from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.domain import (
    UserDestinationCreate,
    UserDestinationResponse,
    CommuteCalculationResponse,
)
from app.services.commute_service import CommuteService

router = APIRouter(prefix="/commute", tags=["Commute Intelligence"])


@router.get("/destinations", response_model=List[UserDestinationResponse])
def get_user_destinations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CommuteService.get_destinations(current_user.id, db)


@router.post("/destinations", response_model=UserDestinationResponse, status_code=status.HTTP_201_CREATED)
def add_user_destination(
    data: UserDestinationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CommuteService.create_destination(current_user.id, data, db)


@router.delete("/destinations/{destination_id}")
def delete_user_destination(
    destination_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = CommuteService.delete_destination(current_user.id, destination_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Destination not found or unauthorized")
    return {"status": "success", "message": "Destination removed"}


@router.get("/calculate", response_model=CommuteCalculationResponse)
def calculate_commute(
    property_id: str,
    destination_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return CommuteService.calculate_commute(property_id, destination_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/property/{property_id}", response_model=List[CommuteCalculationResponse])
def get_property_commutes(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CommuteService.calculate_all_destinations(property_id, current_user.id, db)
