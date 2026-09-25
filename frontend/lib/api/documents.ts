import { fetcher } from "./client";
import { DocumentItem } from "@/types";

export const documentsApi = {
  getMy: () => fetcher<DocumentItem[]>("/documents"),

  upload: (file: File, title: string, documentType = "ID_PROOF", isPrivate = true) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("document_type", documentType);
    formData.append("is_private", String(isPrivate));

    return fetcher<DocumentItem>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  download: (id: string) => fetcher<{ download_url?: string; title?: string }>(`/documents/${id}/download`),

  delete: (id: string) =>
    fetcher<{ detail: string }>(`/documents/${id}`, {
      method: "DELETE",
    }),
};
