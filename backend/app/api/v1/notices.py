from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import Notice, User
from app.schemas.domain import NoticeCreate, NoticeResponse

router = APIRouter(prefix="/notices", tags=["Notices"])


@router.get("", response_model=List[NoticeResponse])
def get_notices(
    property_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Notice).filter(Notice.is_active == True)
    if property_id:
        q = q.filter((Notice.property_id == property_id) | (Notice.property_id == None))
    notices = q.order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).all()
    return [NoticeResponse.model_validate(n) for n in notices]


@router.post("", response_model=NoticeResponse)
def create_notice(
    data: NoticeCreate,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    notice = Notice(
        property_id=data.property_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        author_id=current_user.id,
        is_pinned=data.is_pinned,
        is_active=True
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    # Notify tenants of the new notice
    try:
        from app.services.notification_service import NotificationService
        from app.models.entities import Allocation
        tenants_query = db.query(Allocation.tenant_id).filter(Allocation.status == "ACTIVE")
        tenant_ids = [t[0] for t in tenants_query.distinct().all()]
        for tid in tenant_ids:
            NotificationService.notify_new_notice(db, tid, notice.title)
    except Exception:
        pass

    return NoticeResponse.model_validate(notice)
