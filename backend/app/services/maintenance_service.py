from datetime import datetime, timedelta
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import (
    Complaint,
    ComplaintAssignment,
    PreventiveMaintenanceAction,
    Property,
    Room,
    User,
)
from app.schemas.domain import (
    PreventiveActionCreate,
    PreventiveActionUpdate,
    PreventiveActionResponse,
    RoomRiskAssessment,
    CategoryRiskAssessment,
    PropertyMaintenanceRiskResponse,
)


class MaintenanceService:
    @staticmethod
    def calculate_property_risk(property_id: str, db: Session) -> PropertyMaintenanceRiskResponse:
        prop = db.query(Property).filter(Property.id == property_id).first()
        if not prop:
            raise ValueError(f"Property {property_id} not found")

        # Fetch complaints for this property
        cutoff = datetime.utcnow() - timedelta(days=90)
        complaints = db.query(Complaint).filter(
            Complaint.property_id == property_id,
            Complaint.created_at >= cutoff
        ).all()

        total_historical = db.query(Complaint).filter(Complaint.property_id == property_id).count()

        # 1. Group complaints by category
        category_map: Dict[str, List[Complaint]] = {}
        for c in complaints:
            cat = c.category.upper() if c.category else "OTHER"
            category_map.setdefault(cat, []).append(c)

        # Standard categories to assess
        evaluated_categories = set(category_map.keys()) | {"PLUMBING", "ELECTRICAL", "WIFI"}
        category_risks: List[CategoryRiskAssessment] = []

        total_weighted_risk = 0.0

        for cat in sorted(evaluated_categories):
            cat_complaints = category_map.get(cat, [])
            count = len(cat_complaints)
            recurring_count = 0
            room_counts: Dict[str, int] = {}
            for c in cat_complaints:
                if c.room_id:
                    room_counts[c.room_id] = room_counts.get(c.room_id, 0) + 1
            recurring_count = sum(1 for cnt in room_counts.values() if cnt > 1)

            escalated_count = sum(1 for c in cat_complaints if c.escalated)
            pending_count = sum(1 for c in cat_complaints if c.status in ["PENDING", "IN_PROGRESS"])

            # Compute MTTR (hours)
            resolved_times = [
                (c.resolved_at - c.created_at).total_seconds() / 3600.0
                for c in cat_complaints
                if c.resolved_at and c.created_at
            ]
            avg_mttr = round(sum(resolved_times) / len(resolved_times), 1) if resolved_times else None

            # Statistical Risk Formula (Zero hallucination, deterministic arithmetic)
            # Frequency: 15 pts per complaint; Recurrence: 25 pts; Escalation: 25 pts; Unresolved: 15 pts
            raw_risk = (count * 15.0) + (recurring_count * 25.0) + (escalated_count * 25.0) + (pending_count * 15.0)
            risk_score = min(100.0, round(raw_risk, 1))

            if risk_score >= 75.0:
                risk_level = "CRITICAL"
            elif risk_score >= 50.0:
                risk_level = "HIGH"
            elif risk_score >= 25.0:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            reasons = []
            if count > 0:
                reasons.append(f"{count} incident(s) logged in 90 days ({pending_count} currently open).")
            else:
                reasons.append("Zero failure incidents logged in the past 90-day maintenance window.")

            if recurring_count > 0:
                reasons.append(f"Repeat failure pattern detected across {recurring_count} specific room(s).")
            if escalated_count > 0:
                reasons.append(f"{escalated_count} incident(s) required administrative escalation.")
            if avg_mttr:
                reasons.append(f"Mean time to resolve: {avg_mttr} hours.")

            category_risks.append(CategoryRiskAssessment(
                category=cat,
                risk_score=risk_score,
                risk_level=risk_level,
                complaint_count_90d=count,
                recurring_count=recurring_count,
                avg_mttr_hours=avg_mttr,
                reasons=reasons
            ))
            total_weighted_risk += risk_score

        overall_risk_score = round(total_weighted_risk / max(len(category_risks), 1), 1)
        if overall_risk_score >= 70.0:
            overall_risk_level = "HIGH"
        elif overall_risk_score >= 35.0:
            overall_risk_level = "MEDIUM"
        else:
            overall_risk_level = "LOW"

        # 2. Room Risk Assessment
        room_map: Dict[str, List[Complaint]] = {}
        for c in complaints:
            if c.room_id:
                room_map.setdefault(c.room_id, []).append(c)

        high_risk_rooms: List[RoomRiskAssessment] = []
        for r_id, r_complaints in room_map.items():
            r = db.query(Room).filter(Room.id == r_id).first()
            r_num = r.room_number if r else "Unknown Room"
            r_count = len(r_complaints)
            primary_cat = max(set(c.category for c in r_complaints), key=lambda x: [c.category for c in r_complaints].count(x))
            
            room_raw_score = min(100.0, r_count * 30.0 + (20.0 if any(c.escalated for c in r_complaints) else 0.0))
            lvl = "HIGH" if room_raw_score >= 60.0 else ("MEDIUM" if room_raw_score >= 30.0 else "LOW")
            
            room_reasons = [
                f"{r_count} complaints logged in last 90 days.",
                f"Primary recurring category: {primary_cat}."
            ]
            if any(c.status == "PENDING" for c in r_complaints):
                room_reasons.append("Contains unaddressed pending complaints.")

            high_risk_rooms.append(RoomRiskAssessment(
                room_id=r_id,
                room_number=r_num,
                risk_score=room_raw_score,
                risk_level=lvl,
                complaint_count_90d=r_count,
                primary_category=primary_cat,
                reasons=room_reasons
            ))

        high_risk_rooms.sort(key=lambda x: x.risk_score, reverse=True)

        # 3. Fetch scheduled & recommended preventive actions
        actions = db.query(PreventiveMaintenanceAction).filter(
            PreventiveMaintenanceAction.property_id == property_id
        ).order_by(PreventiveMaintenanceAction.created_at.desc()).all()

        action_responses = [MaintenanceService._format_action(a, db) for a in actions]

        return PropertyMaintenanceRiskResponse(
            property_id=prop.id,
            property_name=prop.name,
            overall_risk_score=overall_risk_score,
            overall_risk_level=overall_risk_level,
            category_risks=category_risks,
            high_risk_rooms=high_risk_rooms,
            recommended_actions=action_responses,
            total_historical_complaints=total_historical
        )

    @staticmethod
    def create_preventive_action(data: PreventiveActionCreate, user: User, db: Session) -> PreventiveMaintenanceAction:
        action = PreventiveMaintenanceAction(
            property_id=data.property_id,
            room_id=data.room_id,
            category=data.category.upper(),
            title=data.title,
            description=data.description,
            risk_level=data.risk_level.upper(),
            status="SCHEDULED" if data.scheduled_date else "RECOMMENDED",
            scheduled_date=data.scheduled_date,
            assigned_staff_id=data.assigned_staff_id,
            cost_estimate=data.cost_estimate,
            created_by=user.id,
            created_at=datetime.utcnow()
        )
        db.add(action)
        db.commit()
        db.refresh(action)
        return action

    @staticmethod
    def update_preventive_action(action_id: str, data: PreventiveActionUpdate, db: Session) -> PreventiveMaintenanceAction:
        action = db.query(PreventiveMaintenanceAction).filter(PreventiveMaintenanceAction.id == action_id).first()
        if not action:
            raise ValueError(f"Action {action_id} not found")

        if data.status:
            action.status = data.status.upper()
            if action.status == "COMPLETED" and not action.completed_at:
                action.completed_at = datetime.utcnow()
        if data.scheduled_date:
            action.scheduled_date = data.scheduled_date
        if data.assigned_staff_id:
            action.assigned_staff_id = data.assigned_staff_id
        if data.notes:
            action.description = f"{action.description}\n[Update]: {data.notes}"

        db.commit()
        db.refresh(action)
        return action

    @staticmethod
    def get_actions_for_property(property_id: str, db: Session) -> List[PreventiveActionResponse]:
        actions = db.query(PreventiveMaintenanceAction).filter(
            PreventiveMaintenanceAction.property_id == property_id
        ).order_by(PreventiveMaintenanceAction.created_at.desc()).all()
        return [MaintenanceService._format_action(a, db) for a in actions]

    @staticmethod
    def _format_action(action: PreventiveMaintenanceAction, db: Session) -> PreventiveActionResponse:
        room = db.query(Room).filter(Room.id == action.room_id).first() if action.room_id else None
        staff = db.query(User).filter(User.id == action.assigned_staff_id).first() if action.assigned_staff_id else None
        return PreventiveActionResponse(
            id=action.id,
            property_id=action.property_id,
            room_id=action.room_id,
            room_number=room.room_number if room else None,
            category=action.category,
            title=action.title,
            description=action.description,
            risk_level=action.risk_level,
            status=action.status,
            scheduled_date=action.scheduled_date,
            completed_at=action.completed_at,
            assigned_staff_id=action.assigned_staff_id,
            assigned_staff_name=staff.full_name if staff else None,
            cost_estimate=action.cost_estimate,
            created_at=action.created_at
        )
