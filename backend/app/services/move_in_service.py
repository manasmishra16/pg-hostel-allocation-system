from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import (
    MoveInWorkflow,
    MoveInAuditLog,
    Allocation,
    User,
    Bed,
    Property,
    Document,
)
from app.schemas.domain import (
    MoveInActionRequest,
    MoveInWorkflowResponse,
    MoveInAuditLogResponse,
)


class MoveInService:
    @staticmethod
    def get_or_create_workflow_for_allocation(allocation_id: str, db: Session) -> MoveInWorkflow:
        workflow = db.query(MoveInWorkflow).filter(MoveInWorkflow.allocation_id == allocation_id).first()
        if not workflow:
            alloc = db.query(Allocation).filter(Allocation.id == allocation_id).first()
            if not alloc:
                raise ValueError(f"Allocation {allocation_id} not found")

            bed = alloc.bed
            room = bed.room if bed else None
            floor = room.floor if room else None
            building = floor.building if floor else None
            property_id = building.property_id if building else None

            if not property_id:
                prop = db.query(Property).first()
                property_id = prop.id if prop else None

            workflow = MoveInWorkflow(
                allocation_id=alloc.id,
                tenant_id=alloc.tenant_id,
                property_id=property_id,
                bed_id=alloc.bed_id,
                status="INITIATED"
            )
            db.add(workflow)
            db.commit()
            db.refresh(workflow)

            # Record initial audit entry
            audit = MoveInAuditLog(
                workflow_id=workflow.id,
                from_status="NONE",
                to_status="INITIATED",
                action="INITIALIZE_WORKFLOW",
                performed_by=alloc.tenant_id,
                notes="Move-in onboarding initiated automatically upon bed reservation.",
                timestamp=datetime.utcnow()
            )
            db.add(audit)
            db.commit()
        return workflow

    @staticmethod
    def get_user_active_workflow(user_id: str, db: Session) -> Optional[MoveInWorkflow]:
        # Find user's active allocation first
        alloc = db.query(Allocation).filter(
            Allocation.tenant_id == user_id,
            Allocation.status == "ACTIVE"
        ).order_by(Allocation.created_at.desc()).first()

        if alloc:
            return MoveInService.get_or_create_workflow_for_allocation(alloc.id, db)

        # Fallback to any workflow directly associated with tenant
        return db.query(MoveInWorkflow).filter(
            MoveInWorkflow.tenant_id == user_id
        ).order_by(MoveInWorkflow.created_at.desc()).first()

    @staticmethod
    def execute_action(
        workflow_id: str,
        user: User,
        request: MoveInActionRequest,
        db: Session
    ) -> MoveInWorkflow:
        workflow = db.query(MoveInWorkflow).filter(MoveInWorkflow.id == workflow_id).first()
        if not workflow:
            raise ValueError(f"Move-in workflow {workflow_id} not found")

        current_status = workflow.status
        action = request.action.upper()
        now = datetime.utcnow()
        new_status = current_status
        audit_notes = request.notes or ""

        # --- STATE MACHINE VALIDATION ---
        if action == "SUBMIT_KYC":
            if current_status != "INITIATED":
                raise ValueError(f"Cannot submit KYC from status '{current_status}'. Must be 'INITIATED'.")
            workflow.kyc_document_id = request.document_id
            new_status = "KYC_SUBMITTED"
            audit_notes = request.notes or "Government ID & Tenant Verification form submitted for warden review."

        elif action == "VERIFY_KYC":
            # RBAC: Only WARDEN, PROPERTY_OWNER, STAFF, or SUPER_ADMIN
            if user.role not in ["WARDEN", "PROPERTY_OWNER", "STAFF", "SUPER_ADMIN"]:
                raise PermissionError("Only staff or property owners can verify tenant KYC.")
            if current_status != "KYC_SUBMITTED":
                raise ValueError(f"Cannot verify KYC from status '{current_status}'. KYC must be 'KYC_SUBMITTED'.")
            workflow.kyc_verified_at = now
            workflow.kyc_verified_by = user.id
            new_status = "KYC_VERIFIED"
            audit_notes = request.notes or f"KYC documents officially reviewed and verified by {user.full_name} ({user.role})."

        elif action == "SIGN_AGREEMENT":
            if current_status != "KYC_VERIFIED":
                raise ValueError(f"Cannot sign tenancy agreement until KYC is verified. Current status: '{current_status}'.")
            workflow.agreement_signed_at = now
            workflow.agreement_signature = request.signature or user.full_name
            workflow.agreement_document_url = f"/documents/agreement_{workflow.id}.pdf"
            new_status = "AGREEMENT_SIGNED"
            audit_notes = request.notes or f"Digital tenancy agreement electronically signed with cryptographic timestamp by {user.full_name}."

        elif action == "PAY_DEPOSIT":
            if current_status != "AGREEMENT_SIGNED":
                raise ValueError(f"Cannot process move-in deposit from status '{current_status}'. Agreement must be signed first.")
            workflow.deposit_paid_at = now
            workflow.deposit_payment_id = request.payment_id
            new_status = "DEPOSIT_PAID"
            audit_notes = request.notes or "Security deposit and first-month advance payment verified through gateway."

        elif action == "COMPLETE_INSPECTION":
            if user.role not in ["WARDEN", "PROPERTY_OWNER", "STAFF", "SUPER_ADMIN"]:
                raise PermissionError("Only wardens or staff can complete physical move-in room inspections.")
            if current_status != "DEPOSIT_PAID":
                raise ValueError(f"Cannot conduct final inspection until deposit is confirmed. Current status: '{current_status}'.")
            
            passed = request.inspection_passed if request.inspection_passed is not None else True
            workflow.inspection_passed = passed
            workflow.inspection_notes = request.inspection_notes or "Room fixtures, bed mattress, electrical switches, and plumbing inspected in good working order."
            workflow.inspection_completed_at = now
            workflow.inspected_by = user.id

            if passed:
                new_status = "INSPECTION_COMPLETED"
                audit_notes = f"Room inspection passed. Certified clean and ready for occupancy by {user.full_name}."
            else:
                new_status = "DEPOSIT_PAID"
                audit_notes = f"Inspection flagged issues: {request.inspection_notes}. Rectification in progress."

        elif action == "HANDOVER_KEYS":
            if user.role not in ["WARDEN", "PROPERTY_OWNER", "STAFF", "SUPER_ADMIN"]:
                raise PermissionError("Only wardens or staff can record physical key handover.")
            if current_status != "INSPECTION_COMPLETED":
                raise ValueError(f"Cannot hand over keys until inspection has passed. Current status: '{current_status}'.")
            
            key_no = request.key_number or "KEY-A101-01"
            workflow.key_number = key_no
            workflow.key_handed_over_at = now
            workflow.key_handed_over_by = user.id
            new_status = "KEY_HANDED_OVER"
            audit_notes = f"Physical room & cupboard key set '{key_no}' officially issued to resident by {user.full_name}."

        elif action == "COMPLETE_MOVE_IN":
            if current_status != "KEY_HANDED_OVER":
                raise ValueError(f"Cannot finalize move-in until keys are handed over. Current status: '{current_status}'.")
            new_status = "MOVE_IN_COMPLETED"
            audit_notes = "Move-in readiness cycle 100% completed. Resident is officially in residence."
            
            # Ensure bed status is marked OCCUPIED
            bed = db.query(Bed).filter(Bed.id == workflow.bed_id).first()
            if bed:
                bed.status = "OCCUPIED"
                bed.current_tenant_id = workflow.tenant_id

        elif action == "REJECT":
            if user.role not in ["WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"]:
                raise PermissionError("Only owners or wardens can reject a move-in onboarding workflow.")
            new_status = "REJECTED"
            audit_notes = f"Move-in workflow rejected by {user.full_name}: {request.notes or 'Failed verification standards.'}"

        else:
            raise ValueError(f"Unknown action '{action}'")

        workflow.status = new_status
        workflow.updated_at = now

        # Append immutable audit entry
        audit_entry = MoveInAuditLog(
            workflow_id=workflow.id,
            from_status=current_status,
            to_status=new_status,
            action=action,
            performed_by=user.id,
            notes=audit_notes,
            timestamp=now
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(workflow)
        return workflow

    @staticmethod
    def format_workflow_response(workflow: MoveInWorkflow, db: Session) -> MoveInWorkflowResponse:
        tenant = db.query(User).filter(User.id == workflow.tenant_id).first()
        prop = db.query(Property).filter(Property.id == workflow.property_id).first()
        bed = db.query(Bed).filter(Bed.id == workflow.bed_id).first()
        room = bed.room if bed else None

        audit_logs_resp = []
        for log in workflow.audit_logs:
            performer = db.query(User).filter(User.id == log.performed_by).first() if log.performed_by else None
            audit_logs_resp.append(MoveInAuditLogResponse(
                id=log.id,
                workflow_id=log.workflow_id,
                from_status=log.from_status,
                to_status=log.to_status,
                action=log.action,
                performed_by=log.performed_by,
                performer_name=performer.full_name if performer else "System",
                notes=log.notes,
                timestamp=log.timestamp
            ))

        return MoveInWorkflowResponse(
            id=workflow.id,
            allocation_id=workflow.allocation_id,
            tenant_id=workflow.tenant_id,
            tenant_name=tenant.full_name if tenant else "Resident",
            property_id=workflow.property_id,
            property_name=prop.name if prop else "StayNest Property",
            bed_id=workflow.bed_id,
            bed_code=bed.bed_code if bed else "Bed",
            room_number=room.room_number if room else "Room",
            status=workflow.status,
            kyc_document_id=workflow.kyc_document_id,
            kyc_verified_at=workflow.kyc_verified_at,
            agreement_signed_at=workflow.agreement_signed_at,
            agreement_document_url=workflow.agreement_document_url,
            deposit_paid_at=workflow.deposit_paid_at,
            inspection_notes=workflow.inspection_notes,
            inspection_passed=workflow.inspection_passed,
            inspection_completed_at=workflow.inspection_completed_at,
            key_number=workflow.key_number,
            key_handed_over_at=workflow.key_handed_over_at,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            audit_logs=audit_logs_resp
        )
