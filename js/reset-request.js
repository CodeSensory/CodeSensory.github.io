const RESET_TABLE = 'password_reset_requests';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-request-form');
  const statusEl = document.getElementById('reset-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const email = document.getElementById('reset-email').value.trim();

    if (!username) {
      statusEl.textContent = '아이디를 입력하세요.';
      statusEl.style.color = 'var(--text-muted)';
      return;
    }
    if (!email) {
      statusEl.textContent = '이메일을 입력하세요.';
      statusEl.style.color = 'var(--text-muted)';
      return;
    }

    statusEl.textContent = '요청 처리 중...';
    statusEl.style.color = '';

    try {
      const { error } = await supabase.from(RESET_TABLE).insert({
        username: username || null,
        email,
        token: null,
        used: false
      });

      if (error) throw error;

      if (typeof notifyRequestEmail === 'function') {
        notifyRequestEmail({ type: 'password_reset_request', username, email });
      }
      statusEl.textContent = '요청이 접수되었습니다. 확인 후 입력하신 이메일로 안내드리겠습니다.';
      statusEl.style.color = '';
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = '요청 실패: ' + (err.message || '오류가 발생했습니다.');
      statusEl.style.color = 'var(--text-muted)';
    }
  });
});
