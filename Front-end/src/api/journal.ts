import client from './client';

export type JournalEntryType = 'note' | 'gratitude' | 'reason' | 'mantra';

export interface JournalEntry {
  id: number;
  user_id: number;
  type: JournalEntryType;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface AddJournalEntryRequest {
  type: JournalEntryType;
  content: string;
  entryDate?: string;
}

export interface UpdateJournalEntryRequest {
  content?: string;
  entryDate?: string;
}

export interface JournalEntriesResponse {
  entries: JournalEntry[];
}

export interface GroupedEntriesResponse {
  grouped: {
    note: JournalEntry[];
    gratitude: JournalEntry[];
    reason: JournalEntry[];
    mantra: JournalEntry[];
  };
}

export interface JournalEntryResponse {
  message: string;
  entry: JournalEntry;
}

export interface JournalStatsResponse {
  total: number;
  byType: {
    note: number;
    gratitude: number;
    reason: number;
    mantra: number;
  };
}

export interface GetJournalEntriesParams {
  type?: JournalEntryType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Get all journal entries with optional filters
 */
export const getJournalEntries = async (
  params?: GetJournalEntriesParams
): Promise<JournalEntriesResponse> => {
  const response = await client.get<JournalEntriesResponse>('/journal', { params });
  return response.data;
};

/**
 * Get journal entries grouped by type
 */
export const getEntriesByType = async (): Promise<GroupedEntriesResponse> => {
  const response = await client.get<GroupedEntriesResponse>('/journal/grouped');
  return response.data;
};

/**
 * Get journal statistics
 */
export const getJournalStats = async (): Promise<JournalStatsResponse> => {
  const response = await client.get<JournalStatsResponse>('/journal/stats');
  return response.data;
};

/**
 * Add a new journal entry
 */
export const addJournalEntry = async (
  data: AddJournalEntryRequest
): Promise<JournalEntryResponse> => {
  const response = await client.post<JournalEntryResponse>('/journal', data);
  return response.data;
};

/**
 * Update an existing journal entry
 */
export const updateJournalEntry = async (
  id: number,
  data: UpdateJournalEntryRequest
): Promise<JournalEntryResponse> => {
  const response = await client.put<JournalEntryResponse>(`/journal/${id}`, data);
  return response.data;
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (id: number): Promise<{ message: string }> => {
  const response = await client.delete<{ message: string }>(`/journal/${id}`);
  return response.data;
};
