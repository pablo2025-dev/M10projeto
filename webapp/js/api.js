// API layer (fetch + async/await). Sem bibliotecas externas.

(function () {
  async function request(path, { method = "GET", body, headers } = {}) {
    const base = window.API_CONFIG.getBase();
    const url = `${base}${path}`;

    const token = (window.AUTH && typeof window.AUTH.getToken === 'function')
      ? window.AUTH.getToken()
      : (localStorage.getItem('m10_auth_token') || '');

    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(headers || {})
      }
    };

    if (body !== undefined) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      const e = new Error("Não foi possível ligar à API. Verifica o URL e se o servidor está a correr.");
      e.cause = err;
      throw e;
    }

    let data = null;
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    if (isJson) {
      try { data = await res.json(); } catch { data = null; }
    } else {
      try { data = await res.text(); } catch { data = null; }
    }

    if (!res.ok) {
      // Auto-handle expired/invalid session
      if (res.status === 401) {
        localStorage.removeItem('m10_auth_token');
        localStorage.removeItem('m10_auth_user');

        const page = (location.pathname.split('/').pop() || '').toLowerCase();
        const onAuthPage = page === 'login.html' || page === 'register.html';
        if (!onAuthPage) {
          const next = encodeURIComponent(page || 'index.html');
          location.href = `login.html?next=${next}`;
        }
      }

      const msg = (data && (data.message || data.error)) ? `${data.error || "Erro"}: ${data.message || ""}` : `HTTP ${res.status}`;
      const e = new Error(msg);
      e.status = res.status;
      e.payload = data;
      throw e;
    }

    return data;
  }

  function toQuery(params = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      sp.set(k, String(v));
    });
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  }

  // Tickets
  async function listTickets(params) {
    return request(`/api/tickets${toQuery(params)}`);
  }

  async function getTicket(id) {
    return request(`/api/tickets/${encodeURIComponent(id)}`);
  }

  async function createTicket(payload) {
    return request(`/api/tickets`, { method: "POST", body: payload });
  }

  async function updateTicket(id, payload) {
    return request(`/api/tickets/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
  }

  async function removeTicket(id) {
    return request(`/api/tickets/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  // Stats
  async function getSummary() {
    return request(`/api/stats/summary`);
  }

  // Auth
  async function register(payload) {
    return request(`/api/auth/register`, { method: 'POST', body: payload });
  }

  async function login(payload) {
    return request(`/api/auth/login`, { method: 'POST', body: payload });
  }

  async function me() {
    return request(`/api/auth/me`);
  }

  async function logout() {
    return request(`/api/auth/logout`, { method: 'POST' });
  }

  window.API = { request, listTickets, getTicket, createTicket, updateTicket, removeTicket, getSummary, register, login, me, logout };
})();
