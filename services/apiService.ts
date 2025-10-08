import { User, Item, Requisition, IssuedItemRecord } from '../types';

// The backend server is running on http://localhost:3001
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * A helper function to handle fetch requests and responses.
 * @param endpoint - The API endpoint to call.
 * @param options - Optional fetch options (method, headers, body, etc.).
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            // Include auth tokens here if using them
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Return JSON for all responses except for 204 No Content
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export const apiService = {
    auth: {
        login: (username: string, password?: string): Promise<User> => {
            return apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
        },
        logout: (): Promise<void> => {
            return apiFetch('/auth/logout', { method: 'POST' });
        },
    },
    users: {
        getAll: (): Promise<User[]> => apiFetch('/users'),
        create: (username: string, password?: string): Promise<User> => {
             return apiFetch('/users', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
        },
        delete: (id: number): Promise<void> => apiFetch(`/users/${id}`, { method: 'DELETE' }),
    },
    items: {
        getAll: (): Promise<Item[]> => apiFetch('/items'),
        create: (itemData: Omit<Item, 'id' | 'itemCode'>): Promise<Item> => {
            return apiFetch('/items', {
                method: 'POST',
                body: JSON.stringify(itemData),
            });
        },
        update: (id: number, itemData: Item): Promise<Item> => {
            return apiFetch(`/items/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData),
            });
        },
        delete: (id: number): Promise<void> => apiFetch(`/items/${id}`, { method: 'DELETE' }),
    },
    requisitions: {
        getAll: (): Promise<Requisition[]> => apiFetch('/requisitions'),
        getById: (id: number): Promise<Requisition> => apiFetch(`/requisitions/${id}`),
        create: (reqData: Omit<Requisition, 'id' | 'dateRequested' | 'status'>): Promise<Requisition> => {
            return apiFetch('/requisitions', {
                method: 'POST',
                body: JSON.stringify(reqData),
            });
        },
        update: (id: number, reqData: Requisition): Promise<Requisition> => {
            return apiFetch(`/requisitions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(reqData),
            });
        },
        updateStatus: (id: number, status: string): Promise<void> => {
            return apiFetch(`/requisitions/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        },
        delete: (id: number): Promise<void> => apiFetch(`/requisitions/${id}`, { method: 'DELETE' }),
    },
    issuedRecords: {
        getAll: (): Promise<IssuedItemRecord[]> => apiFetch('/issued-records'),
        create: (voucherData: any): Promise<IssuedItemRecord> => {
            // The backend should handle creating the voucher and all related updates
            return apiFetch('/issued-records', {
                method: 'POST',
                body: JSON.stringify(voucherData),
            });
        },
    },
};
