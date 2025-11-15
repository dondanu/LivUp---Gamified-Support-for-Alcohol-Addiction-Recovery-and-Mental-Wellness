import apiClient from './client';

export interface AddSOSContactRequest {
  contactName: string;
  contactPhone: string;
  relationship?: string;
}

export interface SOSContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  relationship: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddSOSContactResponse {
  message: string;
  contact: SOSContact;
}

export interface SOSContactsResponse {
  contacts: SOSContact[];
  count: number;
}

export interface UpdateSOSContactRequest {
  contactName?: string;
  contactPhone?: string;
  relationship?: string;
  isActive?: boolean;
}

export interface UpdateSOSContactResponse {
  message: string;
  contact: SOSContact;
}

// API 38: Add SOS Contact
export const addSOSContact = async (data: AddSOSContactRequest): Promise<AddSOSContactResponse> => {
  const response = await apiClient.post<AddSOSContactResponse>('/sos/contact', data);
  return response.data;
};

// API 39: Get SOS Contacts
export const getSOSContacts = async (): Promise<SOSContactsResponse> => {
  const response = await apiClient.get<SOSContactsResponse>('/sos/contacts');
  return response.data;
};

// API 40: Update SOS Contact
export const updateSOSContact = async (
  contactId: string,
  data: UpdateSOSContactRequest
): Promise<UpdateSOSContactResponse> => {
  const response = await apiClient.put<UpdateSOSContactResponse>(`/sos/contact/${contactId}`, data);
  return response.data;
};

// API 41: Delete SOS Contact
export const deleteSOSContact = async (contactId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/sos/contact/${contactId}`);
  return response.data;
};

