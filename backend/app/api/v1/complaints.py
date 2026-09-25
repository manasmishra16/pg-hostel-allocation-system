from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import Complaint, User
from app.schemas.domain import ComplaintCreate, ComplaintUpdate, ComplaintResponse, AITriageResponse
from app.services.complaint_service import ComplaintService
from app.ai.complaint_classifier import ComplaintClassifier

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def map_complaint_response(c: Complaint) -> ComplaintResponse:
    staff_name = None
    if c.assignments:
        latest = c.assignments[-1]
        if latest.staff:
            staff_name = latest.staff.full_name

    return ComplaintResponse(
        id=c.id,
        tenant_id=c.tenant_id,
        property_id=c.property_id,
        room_id=c.room_id,
        title=c.title,
        description=c.description,
        category=c.category,
        priority=c.priority,
        status=c.status,
        image_url=c.image_url,
        ai_summary=c.ai_summary,
        suggested_department=c.suggested_department,
        escalated=c.escalated,
        created_at=c.created_at,
        resolved_at=c.resolved_at,
        tenant_name=c.tenant.full_name if c.tenant else None,
        room_number=c.room.room_number if c.room else "A-101",
        staff_name=staff_name
    )


@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Complaint)
    if current_user.role == "TENANT":
        q = q.filter(Complaint.tenant_id == current_user.id)
    if status_filter and status_filter.upper() != "ALL":
        q = q.filter(Complaint.status == status_filter.upper())
    
    complaints = q.order_by(Complaint.created_at.desc()).all()
    return [map_complaint_response(c) for c in complaints]


@router.post("", response_model=ComplaintResponse)
def create_complaint(
    data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = ComplaintService.create_complaint(db, data, current_user.id)
    return map_complaint_response(complaint)


@router.post("/ai-triage", response_model=AITriageResponse)
def ai_triage_preview(title: str, description: str):
    return ComplaintClassifier.classify(title, description)


@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    if current_user.role == "TENANT" and complaint.tenant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return map_complaint_response(complaint)


@router.post("/{id}/assign", response_model=ComplaintResponse)
def assign_complaint(
    id: str,
    staff_id: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only staff, wardens, and owners can assign complaints")
    complaint = ComplaintService.assign_staff(db, id, staff_id, notes)
    return map_complaint_response(complaint)


@router.post("/{id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    id: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only staff, wardens, and owners can resolve complaints")
    complaint = ComplaintService.resolve_complaint(db, id, notes)
    return map_complaint_response(complaint)


@router.post("/{id}/escalate", response_model=ComplaintResponse)
def escalate_complaint(
    id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Both tenant who created the ticket and staff/wardens can escalate
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    if current_user.role == "TENANT" and complaint.tenant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    complaint = ComplaintService.escalate_complaint(db, id, reason)
    return map_complaint_response(complaint)


@router.patch("/{id}", response_model=ComplaintResponse)
def update_complaint(
    id: str,
    data: ComplaintUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    if current_user.role == "TENANT" and complaint.tenant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    updated = ComplaintService.update_complaint(db, id, data)
    return map_complaint_response(updated)
