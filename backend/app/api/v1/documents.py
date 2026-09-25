import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entities import Document, User
from app.schemas.domain import DocumentResponse
from app.services.storage_service import DocumentStorageService

router = APIRouter(prefix="/documents", tags=["Documents & Verification"])


def map_doc_response(doc: Document) -> DocumentResponse:
    signed = DocumentStorageService.get_signed_url(doc)
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        document_type=doc.document_type,
        title=doc.title,
        file_url=doc.file_url,
        signed_url=signed,
        verification_status=doc.verification_status,
        is_private=doc.is_private,
        created_at=doc.created_at
    )


@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    title: str = Form(...),
    document_type: str = Form("ID_PROOF"),
    is_private: bool = Form(True),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = DocumentStorageService.upload_document(
        db=db,
        user_id=current_user.id,
        title=title,
        document_type=document_type,
        file=file,
        is_private=is_private
    )
    return map_doc_response(doc)


@router.get("", response_model=List[DocumentResponse])
def get_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return [map_doc_response(d) for d in docs]


@router.get("/{id}/download")
def download_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Authorization: User can only access their own private documents, or staff/warden/admin/owner
    if doc.is_private and doc.user_id != current_user.id and current_user.role not in ("STAFF", "WARDEN", "PROPERTY_OWNER", "SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to private document")

    if doc.file_url.startswith("/uploads/documents/"):
        filename = os.path.basename(doc.file_url)
        filepath = os.path.join(DocumentStorageService.LOCAL_UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            return FileResponse(filepath, filename=f"{doc.title}.pdf")

    # Return signed external redirect or file url
    signed = DocumentStorageService.get_signed_url(doc)
    return {"download_url": signed, "title": doc.title}


@router.delete("/{id}")
def delete_document(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    DocumentStorageService.delete_document(db, id, current_user)
    return {"detail": "Document successfully deleted"}
