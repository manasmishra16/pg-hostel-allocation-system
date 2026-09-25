import { authApi } from "./auth";
import { propertiesApi } from "./properties";
import { roomsApi } from "./rooms";
import { allocationsApi } from "./allocations";
import { invoicesApi } from "./invoices";
import { paymentsApi } from "./payments";
import { complaintsApi } from "./complaints";
import { noticesApi } from "./notices";
import { notificationsApi } from "./notifications";
import { documentsApi } from "./documents";
import { roommatesApi } from "./roommates";
import { analyticsApi } from "./analytics";
import { staymatchApi } from "./staymatch";
import { commuteApi } from "./commute";
import { moveInApi } from "./moveIn";
import { maintenanceApi } from "./maintenance";
import { trustApi } from "./trust";

export {
  authApi,
  propertiesApi,
  roomsApi,
  allocationsApi,
  invoicesApi,
  paymentsApi,
  complaintsApi,
  noticesApi,
  notificationsApi,
  documentsApi,
  roommatesApi,
  analyticsApi,
  staymatchApi,
  commuteApi,
  moveInApi,
  maintenanceApi,
  trustApi,
};

export const api = {
  auth: authApi,
  properties: propertiesApi,
  rooms: roomsApi,
  allocations: allocationsApi,
  invoices: invoicesApi,
  payments: paymentsApi,
  complaints: complaintsApi,
  notices: noticesApi,
  notifications: notificationsApi,
  documents: documentsApi,
  roommates: roommatesApi,
  analytics: analyticsApi,
  staymatch: staymatchApi,
  commute: commuteApi,
  moveIn: moveInApi,
  maintenance: maintenanceApi,
  trust: trustApi,

  // Flat backward-compatible aliases
  getProperties: propertiesApi.getAll,
  getProperty: propertiesApi.getById,
  createProperty: propertiesApi.create,
  getRooms: roomsApi.getRooms,
  getBeds: roomsApi.getBeds,
  updateBedStatus: roomsApi.updateBedStatus,
  getComplaints: complaintsApi.getAll,
  createComplaint: complaintsApi.create,
  updateComplaintStatus: (id: string, status: string) => complaintsApi.update(id, { status }),
  triageComplaint: (description: string) => complaintsApi.previewTriage("", description),
  getNotices: noticesApi.getAll,
  createNotice: noticesApi.create,
  getRoommateMatches: roommatesApi.getMatches,
  saveRoommatePreferences: roommatesApi.updatePreferences,
  getOwnerAnalytics: analyticsApi.getOwnerDashboard,
  getAdminAnalytics: analyticsApi.getAdminDashboard,
};

export default api;

