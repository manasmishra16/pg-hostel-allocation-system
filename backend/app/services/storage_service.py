import os
import uuid
import mimetypes
from datetime import datetime
from typing import Optional, Tuple
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.entities import Document, User


class DocumentStorageService:
    LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "documents")

    @classmethod
    def _ensure_local_dir(cls):
        os.makedirs(cls.LOCAL_UPLOAD_DIR, exist_ok=True)

    @classmethod
    def upload_document(
        cls,
        db: Session,
        user_id: str,
        title: str,
        document_type: str,
        file: UploadFile,
        is_private: bool = True
    ) -> Document:
        file_ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        file_uuid = uuid.uuid4().hex
        stored_filename = f"{user_id}_{file_uuid}{file_ext}"

        # 1. Supabase Storage if configured
        file_url = ""
        if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://your-project"):
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                bucket_name = "tenant-documents"
                file_bytes = file.file.read()
                file.file.seek(0)
                supabase.storage.from_(bucket_name).upload(
                    path=stored_filename,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "application/octet-stream"}
                )
                file_url = f"supabase://{bucket_name}/{stored_filename}"
            except Exception:
                file_url = ""

        # 2. Local secure protected storage fallback
        if not file_url:
            cls._ensure_local_dir()
            target_path = os.path.join(cls.LOCAL_UPLOAD_DIR, stored_filename)
            contents = file.file.read()
            with open(target_path, "wb") as f:
                f.write(contents)
            file_url = f"/uploads/documents/{stored_filename}"

        # 3. Create Document Record
        doc = Document(
            user_id=user_id,
            title=title,
            document_type=document_type.upper(),
            file_url=file_url,
            verification_status="PENDING",
            is_private=is_private
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @classmethod
    def get_signed_url(cls, doc: Document) -> str:
        """
        Generate a temporary, authorized signed URL for private access.
        Never returns direct unprotected public URLs for private documents.
        """
        if doc.file_url.startswith("supabase://"):
            if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://your-project"):
                try:
                    from supabase import create_client
                    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                    parts = doc.file_url.replace("supabase://", "").split("/", 1)
                    bucket, path = parts[0], parts[1]
                    res = supabase.storage.from_(bucket).create_signed_url(path, 900)  # 15 minutes
                    return res.get("signedURL") or res.get("signedUrl")
                except Exception:
                    pass

        # For local secured storage, return protected access endpoint
        return f"/api/v1/documents/{doc.id}/download"

    @classmethod
    def delete_document(cls, db: Session, doc_id: str, requesting_user: User) -> bool:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        # Authorization: Only owner of document or SUPER_ADMIN can delete
        if doc.user_id != requesting_user.id and requesting_user.role != "SUPER_ADMIN":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this document")

        # Delete physical file
        if doc.file_url.startswith("/uploads/documents/"):
            filename = os.path.basename(doc.file_url)
            local_path = os.path.join(cls.LOCAL_UPLOAD_DIR, filename)
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except OSError:
                    pass
        elif doc.file_url.startswith("supabase://"):
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                parts = doc.file_url.replace("supabase://", "").split("/", 1)
                supabase.storage.from_(parts[0]).remove([parts[1]])
            except Exception:
                pass

        db.delete(doc)
        db.commit()
        return True
