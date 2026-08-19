const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return body;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),

  // Categories
  getCategories: () => request('/categories'),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),

  // Cart
  getCart: (customerId) => request(`/cart/${customerId}`),
  addToCart: (customerId, product_id, quantity) =>
    request(`/cart/${customerId}/items`, { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  updateCartItem: (cartItemId, quantity) =>
    request(`/cart/items/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (cartItemId) => request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),

  // Orders
  getOrders: (customerId) => request(`/orders${customerId ? `?customer_id=${customerId}` : ''}`),
  getOrder: (id) => request(`/orders/${id}`),
  placeOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  // Reviews
  addReview: (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Analytics
  getCustomerSpending: () => request('/analytics/customer-spending'),
  getRatings: () => request('/analytics/ratings'),
  getLowStock: (threshold) => request(`/analytics/low-stock?threshold=${threshold ?? 50}`),
  getInactiveCustomers: () => request('/analytics/inactive-customers'),
  getBestSellers: (limit) => request(`/analytics/best-sellers?limit=${limit ?? 5}`),
  getSupplierProducts: () => request('/analytics/suppliers'),
  getPaymentSummary: () => request('/analytics/payment-summary')
};
