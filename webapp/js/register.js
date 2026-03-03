(function () {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('registerBtn');

  const emailEl = document.getElementById('email');
  const pwEl = document.getElementById('password');
  const pw2El = document.getElementById('password2');
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

  // If already logged in, go home
  if (AUTH.isLoggedIn()) {
    location.href = 'index.html';
    return;
  }

  AUTH.wirePasswordStrength({ input: pwEl, rulesList: pwRules, submitBtn: btn, messageEl: pwMsg });

  function passwordsMatch() {
    return (pwEl.value || '') === (pw2El.value || '');
  }

  function validateMatch() {
    if (!pw2El.value) {
      pw2El.setCustomValidity('');
      return;
    }
    pw2El.setCustomValidity(passwordsMatch() ? '' : 'Passwords não coincidem');
  }

  pwEl.addEventListener('input', validateMatch);
  pw2El.addEventListener('input', validateMatch);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    validateMatch();
    if (!form.checkValidity()) {
      setMsg('Confere os campos do formulário.', 'bad');
      form.reportValidity();
      return;
    }

    const email = (emailEl.value || '').trim().toLowerCase();
    const password = pwEl.value || '';

    setMsg('A registar...');

    try {
      await API.register({ email, password });
      UI.toast({ title: 'Registo', message: 'Conta criada. Já podes fazer login.', variant: 'ok' });
      location.href = 'login.html';
    } catch (err) {
      setMsg(err.message || 'Erro no registo.', 'bad');
      UI.toast({ title: 'Erro', message: err.message || 'Erro no registo', variant: 'bad' });
    }
  });
})();
