(function () {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('loginBtn');

  const emailEl = document.getElementById('email');
  const pwEl = document.getElementById('password');
  const pwRules = document.getElementById('pwRules');
  const pwMsg = document.getElementById('pwMsg');

  const apiBaseInput = document.getElementById('apiBaseInput');
  const saveApiBaseBtn = document.getElementById('saveApiBaseBtn');

  function setMsg(text, variant) {
    msg.textContent = text || '';
    msg.className = 'form-msg' + (variant ? ` ${variant}` : '');
  }

  // API base box
  if (apiBaseInput) apiBaseInput.value = window.API_CONFIG.getBase();
  if (saveApiBaseBtn) {
    saveApiBaseBtn.addEventListener('click', () => {
      const next = window.API_CONFIG.setBase(apiBaseInput.value);
      const apiPrev = document.getElementById('apiBasePreview');
      if (apiPrev) apiPrev.textContent = next;
      UI.toast({ title: 'Guardado', message: `API Base URL: ${next}`, variant: 'ok' });
    });
  }

  // If already logged in, redirect
  if (AUTH.isLoggedIn()) {
    const sp = new URLSearchParams(location.search);
    const next = sp.get('next') || 'index.html';
    location.href = next;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('A autenticar...');

    const email = (emailEl.value || '').trim().toLowerCase();
    const password = pwEl.value || '';

    try {
      const data = await API.login({ email, password });
      AUTH.setSession({ token: data.token, user: data.user });

      UI.toast({ title: 'Login', message: 'Sessão iniciada com sucesso.', variant: 'ok' });
      const sp = new URLSearchParams(location.search);
      const next = sp.get('next') || 'index.html';
      location.href = next;
    } catch (err) {
      const status = err.status;
      if (status === 429) {
        setMsg('IP bloqueado temporariamente devido a múltiplas falhas. Tenta mais tarde.', 'bad');
      } else {
        setMsg(err.message || 'Erro no login.', 'bad');
      }
      UI.toast({ title: 'Erro', message: err.message || 'Erro no login', variant: 'bad' });
    }
  });
})();
