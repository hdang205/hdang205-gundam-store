const API_BASE = "http://localhost:5000/api";

const api = {
  async fetchWithAuth(url, options = {}) {
    const session = JSON.parse(localStorage.getItem("gunpla_session") || "{}");
    const token = session.token;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // Unauthorized, maybe logout or redirect
    }
    return res.json();
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Lỗi đăng nhập" };
      }
      return { success: true, ...data };
    } catch (error) {
      console.error("Login API Error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  async register(name, email, password) {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Lỗi đăng ký" };
      }
      return { success: true, ...data };
    } catch (error) {
      console.error("Register API Error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  async getProfile() {
    return this.fetchWithAuth(`${API_BASE}/users/profile`);
  },

  async updateProfile(profileData) {
    return this.fetchWithAuth(`${API_BASE}/users/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  async createOrder(orderData) {
    return this.fetchWithAuth(`${API_BASE}/orders`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders() {
    return this.fetchWithAuth(`${API_BASE}/orders/myorders`);
  },

  async getAllOrders() {
    return this.fetchWithAuth(`${API_BASE}/orders`);
  },

  async updateOrderStatus(id, status, paymentStatus) {
    return this.fetchWithAuth(`${API_BASE}/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, paymentStatus }),
    });
  },

  async getContacts() {
    return this.fetchWithAuth(`${API_BASE}/contacts`);
  },

  async replyToContact(id, reply) {
    return this.fetchWithAuth(`${API_BASE}/contacts/${id}/reply`, {
      method: "PUT",
      body: JSON.stringify({ reply }),
    });
  },

  async getInventory() {
    return this.fetchWithAuth(`${API_BASE}/inventory/status`);
  },

  async adjustStock(productId, type, quantity, reason) {
    return this.fetchWithAuth(`${API_BASE}/inventory/log`, {
      method: "POST",
      body: JSON.stringify({ productId, type, quantity, reason }),
    });
  },

  async getBanners() {
    const res = await fetch(`${API_BASE}/banners`);
    return res.json();
  },

  async validateCoupon(code, orderValue) {
    return this.fetchWithAuth(`${API_BASE}/discounts/validate`, {
      method: "POST",
      body: JSON.stringify({ code, orderValue }),
    });
  },
};
