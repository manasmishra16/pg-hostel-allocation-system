from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.entities import Invoice, InvoiceItem, User
from app.schemas.domain import InvoiceResponse, InvoiceCreate
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.post("", response_model=InvoiceResponse)
def create_invoice(
    data: InvoiceCreate,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    inv = InvoiceService.create_invoice(db, data)
    return InvoiceResponse.model_validate(inv)


@router.get("/my", response_model=List[InvoiceResponse])
def get_my_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(
        Invoice.tenant_id == current_user.id
    ).order_by(Invoice.due_date.desc()).all()
    return [InvoiceResponse.model_validate(inv) for inv in invoices]


@router.get("/{id}/receipt")
def get_invoice_receipt(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    inv = db.query(Invoice).filter(Invoice.id == id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    if inv.tenant_id != current_user.id and current_user.role not in ("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return InvoiceService.get_receipt(db, id)


@router.get("/{id}", response_model=InvoiceResponse)
def get_invoice(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    if inv.tenant_id != current_user.id and current_user.role not in ("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return InvoiceResponse.model_validate(inv)


@router.get("", response_model=List[InvoiceResponse])
def get_all_invoices(
    property_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_roles("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN")),
    db: Session = Depends(get_db)
):
    q = db.query(Invoice)
    if property_id:
        q = q.filter(Invoice.property_id == property_id)
    if status_filter:
        q = q.filter(Invoice.status == status_filter.upper())
    invoices = q.order_by(Invoice.due_date.desc()).all()
    return [InvoiceResponse.model_validate(inv) for inv in invoices]
