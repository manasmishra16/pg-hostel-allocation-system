from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import Payment, Invoice, User
from app.schemas.domain import PaymentOrderCreate, PaymentOrderResponse, PaymentVerifyRequest, PaymentResponse
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/summary")
def get_payment_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # 1. Total paid
    total_paid = db.query(func.sum(Payment.amount)).filter(
        Payment.tenant_id == current_user.id,
        Payment.status == "COMPLETED"
    ).scalar() or 0.0

    # 2. Next due invoice
    next_invoice = db.query(Invoice).filter(
        Invoice.tenant_id == current_user.id,
        Invoice.status == "PENDING"
    ).order_by(Invoice.due_date.asc()).first()

    # 3. Pending total
    total_pending = db.query(func.sum(Invoice.total_amount)).filter(
        Invoice.tenant_id == current_user.id,
        Invoice.status == "PENDING"
    ).scalar() or 0.0

    return {
        "next_due_amount": next_invoice.total_amount if next_invoice else 0.0,
        "next_due_date": str(next_invoice.due_date) if next_invoice else "No dues",
        "next_invoice_id": next_invoice.id if next_invoice else None,
        "next_invoice_number": next_invoice.invoice_number if next_invoice else None,
        "total_paid": float(total_paid),
        "total_pending": float(total_pending),
        "payment_status": "Good" if total_pending == 0 or (next_invoice and next_invoice.status != "OVERDUE") else "Attention Needed"
    }


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(
    data: PaymentOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return PaymentService.create_order(db, data.invoice_id, current_user.id)


@router.post("/verify", response_model=PaymentResponse)
def verify_payment(
    data: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return PaymentService.verify_payment(db, data, current_user.id)


@router.get("/history", response_model=List[PaymentResponse])
def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).filter(
        Payment.tenant_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    return [PaymentResponse.model_validate(p) for p in payments]


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    
    if not PaymentService.verify_webhook_signature(body, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")
    
    import json
    try:
        event = json.loads(body.decode("utf-8"))
        event_type = event.get("event")
        # Process payment events
        return {"status": "received", "event": event_type}
    except Exception:
        return {"status": "error", "detail": "Invalid JSON payload"}
