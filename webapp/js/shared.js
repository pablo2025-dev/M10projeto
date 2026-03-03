// Funcionalidades partilhadas (navbar + footer + baseURL preview)

(function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Navbar mobile toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on navigation (mobile)
    links.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  // Show base URL in footer
  const apiPrev = document.getElementById("apiBasePreview");
  if (apiPrev) apiPrev.textContent = window.API_CONFIG.getBase();

  // Auth nav
  const loggedInEls = document.querySelectorAll('[data-auth="in"]');
  const loggedOutEls = document.querySelectorAll('[data-auth="out"]');
  const userEmailEl = document.getElementById('navUserEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  const isIn = window.AUTH && AUTH.isLoggedIn && AUTH.isLoggedIn();
  loggedInEls.forEach((el) => (el.hidden = !isIn));
  loggedOutEls.forEach((el) => (el.hidden = isIn));

  if (userEmailEl && isIn) {
    const u = AUTH.getUser();
    userEmailEl.textContent = u?.email ? u.email : 'Sessão ativa';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await API.logout(); } catch {}
      AUTH.logout();
    });
  }
})();
