from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import User
from app.schemas.domain import DashboardStatsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_analytics(
    property_id: Optional[str] = None,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    owner_id = current_user.id if current_user.role == "PROPERTY_OWNER" else None
    return AnalyticsService.get_dashboard_metrics(db, owner_id=owner_id)
