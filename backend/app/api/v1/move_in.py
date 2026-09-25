from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import User, MoveInWorkflow
from app.schemas.domain import (
    MoveInActionRequest,
    MoveInWorkflowResponse,
)
from app.services.move_in_service import MoveInService

router = APIRouter(prefix="/move-in", tags=["Move-In Readiness"])


@router.get("/status", response_model=Optional[MoveInWorkflowResponse])
def get_current_user_move_in_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workflow = MoveInService.get_user_active_workflow(current_user.id, db)
    if not workflow:
        return None
    return MoveInService.format_workflow_response(workflow, db)


@router.get("/{workflow_id}", response_model=MoveInWorkflowResponse)
def get_workflow_by_id(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workflow = db.query(MoveInWorkflow).filter(MoveInWorkflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Move-in workflow not found")

    # Authorization: Tenant can see own; Staff/Owners can see property workflows
    if current_user.role == "TENANT" and workflow.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return MoveInService.format_workflow_response(workflow, db)


@router.post("/{workflow_id}/action", response_model=MoveInWorkflowResponse)
def execute_workflow_action(
    workflow_id: str,
    request: MoveInActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        updated = MoveInService.execute_action(workflow_id, current_user, request, db)
        return MoveInService.format_workflow_response(updated, db)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.get("/property/{property_id}", response_model=List[MoveInWorkflowResponse])
def get_property_workflows(
    property_id: str,
    current_user: User = Depends(require_roles(["PROPERTY_OWNER", "WARDEN", "STAFF", "SUPER_ADMIN"])),
    db: Session = Depends(get_db)
):
    workflows = db.query(MoveInWorkflow).filter(
        MoveInWorkflow.property_id == property_id
    ).order_by(MoveInWorkflow.created_at.desc()).all()
    return [MoveInService.format_workflow_response(w, db) for w in workflows]
