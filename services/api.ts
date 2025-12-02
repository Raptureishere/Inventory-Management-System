// API Service for Backend Integration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API Service
export const api = {
  // ==================== AUTH ====================
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (userData: {
    username: string;
    password: string;
    role: string;
    fullName?: string;
    email?: string;
  }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hims_user');
  },

  // ==================== ITEMS ====================
  getItems: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const response = await fetch(`${API_URL}/items?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  getItemById: async (id: number) => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createItem: async (itemData: any) => {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },

  updateItem: async (id: number, itemData: any) => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },

  deleteItem: async (id: number) => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  // ==================== SUPPLIERS ====================
  getSuppliers: async () => {
    const response = await fetch(`${API_URL}/suppliers`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createSupplier: async (supplierData: any) => {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(supplierData)
    });
    return handleResponse(response);
  },

  updateSupplier: async (id: number, supplierData: any) => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(supplierData)
    });
    return handleResponse(response);
  },

  deleteSupplier: async (id: number) => {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  // ==================== REQUISITIONS ====================
  getRequisitions: async (params?: { status?: string; department?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.department) queryParams.append('department', params.department);

    const response = await fetch(`${API_URL}/requisitions?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  getRequisitionById: async (id: number) => {
    const response = await fetch(`${API_URL}/requisitions/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createRequisition: async (requisitionData: any) => {
    const response = await fetch(`${API_URL}/requisitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requisitionData)
    });
    return handleResponse(response);
  },

  updateRequisition: async (id: number, requisitionData: any) => {
    const response = await fetch(`${API_URL}/requisitions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requisitionData)
    });
    return handleResponse(response);
  },

  forwardRequisition: async (id: number) => {
    const response = await fetch(`${API_URL}/requisitions/${id}/forward`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  cancelRequisition: async (id: number) => {
    const response = await fetch(`${API_URL}/requisitions/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  deleteRequisition: async (id: number) => {
    const response = await fetch(`${API_URL}/requisitions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  // ==================== PURCHASE ORDERS ====================
  getPurchaseOrders: async (params?: { status?: string; supplierId?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId.toString());

    const response = await fetch(`${API_URL}/purchase-orders?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createPurchaseOrder: async (poData: any) => {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(poData)
    });
    return handleResponse(response);
  },

  receivePurchaseOrder: async (id: number, receiveData: any) => {
    const response = await fetch(`${API_URL}/purchase-orders/${id}/receive`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(receiveData)
    });
    return handleResponse(response);
  },

  // ==================== ISSUING VOUCHERS ====================
  getIssuingVouchers: async (params?: { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_URL}/issuing?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createIssuingVoucher: async (voucherData: any) => {
    const response = await fetch(`${API_URL}/issuing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(voucherData)
    });
    return handleResponse(response);
  },

  updateIssuingVoucher: async (id: number, voucherData: any) => {
    const response = await fetch(`${API_URL}/issuing/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(voucherData)
    });
    return handleResponse(response);
  },

  deleteIssuingVoucher: async (id: number) => {
    const response = await fetch(`${API_URL}/issuing/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  // ==================== USERS ====================
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  createUser: async (userData: any) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  updateUser: async (id: number, userData: any) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  }
};

export default api;
