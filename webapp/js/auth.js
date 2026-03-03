// Auth helpers (token/session) + password strength indicator

(function () {
  const TOKEN_KEY = "m10_auth_token";
  const USER_KEY = "m10_auth_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function setSession({ token, user }) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function requireLogin() {
    if (isLoggedIn()) return;
    // Keep current page as return URL
    const next = encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
    location.href = `login.html?next=${next}`;
  }

  function logout() {
    clearSession();
    location.href = 'login.html';
  }

  // Password strength checks per M11 1.2
  function evaluatePassword(pw) {
    const password = String(pw || "");
    const lengthOk = password.length >= 8;
    const numberOk = /\d/.test(password);
    const specialOk = /[^A-Za-z0-9]/.test(password);
    const score = [lengthOk, numberOk, specialOk].filter(Boolean).length;
    return { lengthOk, numberOk, specialOk, score, strong: score === 3 };
  }

  function wirePasswordStrength({ input, rulesList, submitBtn, messageEl }) {
    if (!input) return;

    const items = rulesList ? {
      length: rulesList.querySelector('[data-rule="length"]'),
      number: rulesList.querySelector('[data-rule="number"]'),
      special: rulesList.querySelector('[data-rule="special"]')
    } : null;

    function render() {
      const st = evaluatePassword(input.value);

      if (items) {
        if (items.length) items.length.classList.toggle('ok', st.lengthOk);
        if (items.number) items.number.classList.toggle('ok', st.numberOk);
        if (items.special) items.special.classList.toggle('ok', st.specialOk);
      }

      if (submitBtn) submitBtn.disabled = !st.strong;

      if (messageEl) {
        messageEl.textContent = st.strong
          ? 'Password forte ✅'
          : 'Password fraca: precisa de 8+ caracteres, 1 número e 1 caractere especial.';
      }
    }

    input.addEventListener('input', render);
    render();
  }

  window.AUTH = {
    TOKEN_KEY,
    USER_KEY,
    getToken,
    getUser,
    setSession,
    clearSession,
    isLoggedIn,
    requireLogin,
    logout,
    evaluatePassword,
    wirePasswordStrength
  };
})();
