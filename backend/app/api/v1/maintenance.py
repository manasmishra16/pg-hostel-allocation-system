from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import User
from app.schemas.domain import (
    PreventiveActionCreate,
    PreventiveActionUpdate,
    PreventiveActionResponse,
    PropertyMaintenanceRiskResponse,
)
from app.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/maintenance", tags=["Predictive Maintenance & Risk"])


@router.get("/risk/{property_id}", response_model=PropertyMaintenanceRiskResponse)
def get_property_maintenance_risk(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return MaintenanceService.calculate_property_risk(property_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/actions", response_model=List[PreventiveActionResponse])
def get_preventive_actions(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return MaintenanceService.get_actions_for_property(property_id, db)


@router.post("/actions", response_model=PreventiveActionResponse, status_code=status.HTTP_201_CREATED)
def create_preventive_action(
    data: PreventiveActionCreate,
    current_user: User = Depends(require_roles(["PROPERTY_OWNER", "WARDEN", "STAFF", "SUPER_ADMIN"])),
    db: Session = Depends(get_db)
):
    action = MaintenanceService.create_preventive_action(data, current_user, db)
    return MaintenanceService._format_action(action, db)


@router.patch("/actions/{action_id}", response_model=PreventiveActionResponse)
def update_preventive_action(
    action_id: str,
    data: PreventiveActionUpdate,
    current_user: User = Depends(require_roles(["PROPERTY_OWNER", "WARDEN", "STAFF", "SUPER_ADMIN"])),
    db: Session = Depends(get_db)
):
    try:
        updated = MaintenanceService.update_preventive_action(action_id, data, db)
        return MaintenanceService._format_action(updated, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
