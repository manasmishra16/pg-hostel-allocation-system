from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import Complaint, ComplaintAssignment, User, Room
from app.schemas.domain import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.ai.complaint_classifier import ComplaintClassifier


class ComplaintService:
    @staticmethod
    def create_complaint(db: Session, data: ComplaintCreate, tenant_id: str) -> Complaint:
        # Run AI/Rule-based triage
        triage = ComplaintClassifier.classify(data.title, data.description)

        category = data.category if data.category != "OTHER" else triage.category
        priority = data.priority if data.priority != "MEDIUM" else triage.priority

        complaint = Complaint(
            tenant_id=tenant_id,
            property_id=data.property_id,
            room_id=data.room_id,
            title=data.title,
            description=data.description,
            category=category,
            priority=priority,
            status="PENDING",
            image_url=data.image_url,
            ai_summary=triage.summary,
            suggested_department=triage.department,
            escalated=False
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def assign_staff(db: Session, complaint_id: str, staff_id: str, notes: Optional[str] = None) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

        staff = db.query(User).filter(User.id == staff_id).first()
        if not staff or staff.role not in ("STAFF", "WARDEN", "SUPER_ADMIN"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned user must have STAFF or WARDEN role")

        assignment = ComplaintAssignment(
            complaint_id=complaint.id,
            staff_id=staff.id,
            notes=notes
        )
        db.add(assignment)

        complaint.status = "ASSIGNED"
        db.commit()
        db.refresh(complaint)

        # Notify tenant
        try:
            from app.services.notification_service import NotificationService
            NotificationService.notify_complaint_assigned(db, complaint.tenant_id, complaint.title, staff.full_name)
        except Exception:
            pass

        return complaint

    @staticmethod
    def resolve_complaint(db: Session, complaint_id: str, resolution_notes: Optional[str] = None) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

        complaint.status = "RESOLVED"
        complaint.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(complaint)

        try:
            from app.services.notification_service import NotificationService
            NotificationService.notify_complaint_resolved(db, complaint.tenant_id, complaint.title)
        except Exception:
            pass

        return complaint

    @staticmethod
    def escalate_complaint(db: Session, complaint_id: str, reason: Optional[str] = None) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

        complaint.status = "ESCALATED"
        complaint.escalated = True
        complaint.escalated_at = datetime.utcnow()
        complaint.priority = "HIGH"
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def update_complaint(db: Session, complaint_id: str, data: ComplaintUpdate) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

        if data.status:
            complaint.status = data.status
            if data.status == "RESOLVED":
                complaint.resolved_at = datetime.utcnow()
                try:
                    from app.services.notification_service import NotificationService
                    NotificationService.notify_complaint_resolved(db, complaint.tenant_id, complaint.title)
                except Exception:
                    pass
            elif data.status == "ESCALATED":
                complaint.escalated = True
                complaint.escalated_at = datetime.utcnow()
                complaint.priority = "HIGH"

        if data.priority:
            complaint.priority = data.priority

        if data.assigned_staff_id:
            ComplaintService.assign_staff(db, complaint_id, data.assigned_staff_id, data.notes)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def check_auto_escalations(db: Session) -> int:
        """
        48-hour auto-escalation rule from legacy hostel schema
        """
        cutoff = datetime.utcnow() - timedelta(hours=48)
        overdue = db.query(Complaint).filter(
            Complaint.status.in_(["PENDING", "ASSIGNED"]),
            Complaint.created_at < cutoff,
            Complaint.escalated == False
        ).all()

        count = 0
        for c in overdue:
            c.escalated = True
            c.escalated_at = datetime.utcnow()
            c.priority = "HIGH"
            count += 1

        if count > 0:
            db.commit()
        return count
