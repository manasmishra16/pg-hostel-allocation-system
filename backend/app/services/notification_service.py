from typing import Optional
from sqlalchemy.orm import Session
from app.models.entities import Notification


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        title: str,
        message: str,
        notif_type: str = "SYSTEM"  # 'RENT_DUE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'COMPLAINT_ASSIGNED', 'COMPLAINT_RESOLVED', 'ALLOCATION', 'NOTICE'
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def notify_rent_due(db: Session, user_id: str, amount: float, due_date: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Rent Due Reminder",
            message=f"Your monthly hostel rent of ₹{amount:,.0f} is due by {due_date}. Please clear your dues to avoid late fees.",
            notif_type="RENT_DUE"
        )

    @staticmethod
    def notify_rent_paid(db: Session, user_id: str, amount: float, receipt_num: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Payment Received",
            message=f"Your payment of ₹{amount:,.0f} has been verified and recorded (Receipt: {receipt_num}).",
            notif_type="PAYMENT_SUCCESS"
        )

    @staticmethod
    def notify_payment_failed(db: Session, user_id: str, amount: float, reason: str = "Payment verification failed") -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Payment Failed",
            message=f"Your payment attempt of ₹{amount:,.0f} could not be completed: {reason}. Please retry or contact support.",
            notif_type="PAYMENT_FAILED"
        )

    @staticmethod
    def notify_complaint_assigned(db: Session, user_id: str, complaint_title: str, staff_name: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Complaint Assigned",
            message=f"Your ticket '{complaint_title}' has been assigned to {staff_name} for immediate resolution.",
            notif_type="COMPLAINT_ASSIGNED"
        )

    @staticmethod
    def notify_complaint_resolved(db: Session, user_id: str, complaint_title: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Complaint Resolved",
            message=f"Maintenance issue '{complaint_title}' has been marked as resolved.",
            notif_type="COMPLAINT_RESOLVED"
        )

    @staticmethod
    def notify_bed_allocated(db: Session, user_id: str, bed_code: str, room_number: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="Room & Bed Allocation Confirmed",
            message=f"Welcome to StayNest! You have been successfully allocated {bed_code} in Room {room_number}.",
            notif_type="ALLOCATION"
        )

    @staticmethod
    def notify_new_notice(db: Session, user_id: str, notice_title: str) -> Notification:
        return NotificationService.create_notification(
            db,
            user_id=user_id,
            title="New Announcement",
            message=f"Warden announcement posted: '{notice_title}'. Please check notice board.",
            notif_type="NOTICE"
        )
