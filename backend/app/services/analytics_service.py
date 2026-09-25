from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Property, User, Bed, Room, Floor, Building, Complaint, Invoice, Notice
from app.schemas.domain import DashboardStatsResponse, ComplaintResponse, NoticeResponse


class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(db: Session, owner_id: str = None) -> DashboardStatsResponse:
        # Properties
        prop_query = db.query(Property)
        if owner_id:
            prop_query = prop_query.filter(Property.owner_id == owner_id)
        total_properties = prop_query.count()

        if owner_id:
            owner_prop_ids = [p.id for p in prop_query.all()]
            if not owner_prop_ids:
                return DashboardStatsResponse(
                    total_properties=0,
                    total_residents=0,
                    occupancy_rate=0.0,
                    monthly_revenue=0.0,
                    pending_complaints=0,
                    pending_invoices_amount=0.0,
                    recent_complaints=[],
                    recent_notices=[]
                )

            # Scoped Beds & Occupancy
            bed_q = db.query(Bed).join(Room).join(Floor).join(Building).filter(Building.property_id.in_(owner_prop_ids))
            total_beds = bed_q.count()
            occupied_beds = bed_q.filter(Bed.status == "OCCUPIED").count()
            occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

            # Scoped Residents
            total_residents = db.query(func.count(func.distinct(Bed.current_tenant_id))).join(Room).join(Floor).join(Building).filter(
                Building.property_id.in_(owner_prop_ids),
                Bed.current_tenant_id.isnot(None)
            ).scalar() or 0

            # Scoped Monthly Revenue
            monthly_revenue = db.query(func.sum(Bed.monthly_rent)).join(Room).join(Floor).join(Building).filter(
                Building.property_id.in_(owner_prop_ids),
                Bed.status == "OCCUPIED"
            ).scalar() or 0.0

            # Scoped Pending Complaints
            pending_complaints = db.query(Complaint).filter(
                Complaint.property_id.in_(owner_prop_ids),
                Complaint.status.in_(["PENDING", "IN_PROGRESS", "ASSIGNED"])
            ).count()

            # Scoped Pending Invoices Amount
            pending_invoices_amount = db.query(func.sum(Invoice.total_amount)).filter(
                Invoice.property_id.in_(owner_prop_ids),
                Invoice.status == "PENDING"
            ).scalar() or 0.0

            # Scoped Recent Complaints
            recent_c = db.query(Complaint).filter(
                Complaint.property_id.in_(owner_prop_ids)
            ).order_by(Complaint.created_at.desc()).limit(5).all()

            # Scoped Recent Notices
            recent_n = db.query(Notice).filter(
                Notice.property_id.in_(owner_prop_ids),
                Notice.is_active == True
            ).order_by(Notice.created_at.desc()).limit(5).all()

        else:
            # Platform-wide totals (Admin / Global)
            total_beds = db.query(Bed).count()
            occupied_beds = db.query(Bed).filter(Bed.status == "OCCUPIED").count()
            occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

            total_residents = db.query(User).filter(User.role == "TENANT", User.is_active == True).count()
            monthly_revenue = db.query(func.sum(Bed.monthly_rent)).filter(Bed.status == "OCCUPIED").scalar() or 0.0
            pending_complaints = db.query(Complaint).filter(Complaint.status.in_(["PENDING", "IN_PROGRESS", "ASSIGNED"])).count()
            pending_invoices_amount = db.query(func.sum(Invoice.total_amount)).filter(Invoice.status == "PENDING").scalar() or 0.0

            recent_c = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(5).all()
            recent_n = db.query(Notice).filter(Notice.is_active == True).order_by(Notice.created_at.desc()).limit(5).all()

        c_responses = []
        for c in recent_c:
            c_responses.append(ComplaintResponse(
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
                tenant_name=c.tenant.full_name if c.tenant else None
            ))

        n_responses = [NoticeResponse.model_validate(n) for n in recent_n]

        return DashboardStatsResponse(
            total_properties=total_properties,
            total_residents=total_residents,
            occupancy_rate=occupancy_rate,
            monthly_revenue=float(monthly_revenue),
            pending_complaints=pending_complaints,
            pending_invoices_amount=float(pending_invoices_amount),
            recent_complaints=c_responses,
            recent_notices=n_responses
        )
