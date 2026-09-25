import uuid
from datetime import date, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import Invoice, InvoiceItem, User, Property
from app.schemas.domain import InvoiceCreate
from app.services.notification_service import NotificationService


class InvoiceService:
    @staticmethod
    def create_invoice(db: Session, data: InvoiceCreate) -> Invoice:
        # Verify tenant exists
        tenant = db.query(User).filter(User.id == data.tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

        # Backend strict total amount calculation - never trust frontend totals
        subtotal = float(data.subtotal)
        elec = float(data.electricity_charges)
        maint = float(data.maintenance_charges)
        disc = float(data.discount)
        calculated_total = max(0.0, round(subtotal + elec + maint - disc, 2))

        due = data.due_date or (date.today() + timedelta(days=5))
        inv_num = f"INV-{date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

        invoice = Invoice(
            invoice_number=inv_num,
            tenant_id=data.tenant_id,
            property_id=data.property_id,
            billing_period=data.billing_period,
            due_date=due,
            subtotal=subtotal,
            electricity_charges=elec,
            maintenance_charges=maint,
            discount=disc,
            total_amount=calculated_total,
            status="PENDING"
        )
        db.add(invoice)
        db.flush()

        # Add line items if provided, or default rent line item
        if data.items:
            for item in data.items:
                inv_item = InvoiceItem(
                    invoice_id=invoice.id,
                    description=item.description,
                    amount=float(item.amount)
                )
                db.add(inv_item)
        else:
            db.add(InvoiceItem(
                invoice_id=invoice.id,
                description=f"Monthly Rent for {data.billing_period}",
                amount=subtotal
            ))
            if elec > 0:
                db.add(InvoiceItem(
                    invoice_id=invoice.id,
                    description="Electricity & Sub-metering",
                    amount=elec
                ))
            if maint > 0:
                db.add(InvoiceItem(
                    invoice_id=invoice.id,
                    description="Facilities & Maintenance",
                    amount=maint
                ))

        db.commit()
        db.refresh(invoice)

        # Notify tenant that rent invoice has been generated
        try:
            NotificationService.notify_rent_due(db, tenant.id, calculated_total, str(due))
        except Exception:
            pass

        return invoice

    @staticmethod
    def get_receipt(db: Session, invoice_id: str) -> Dict[str, Any]:
        inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        
        tenant = inv.tenant
        return {
            "receipt_number": f"RCP-{inv.invoice_number}",
            "invoice_number": inv.invoice_number,
            "status": inv.status,
            "tenant_name": tenant.full_name if tenant else "Tenant",
            "tenant_email": tenant.email if tenant else "",
            "billing_period": inv.billing_period,
            "subtotal": inv.subtotal,
            "electricity_charges": inv.electricity_charges,
            "maintenance_charges": inv.maintenance_charges,
            "total_amount": inv.total_amount,
            "paid_at": str(inv.paid_at) if inv.paid_at else None,
            "items": [{"description": it.description, "amount": it.amount} for it in inv.items]
        }
