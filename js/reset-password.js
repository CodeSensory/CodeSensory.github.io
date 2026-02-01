const USERS_TABLE = 'app_users';
const RESET_TABLE = 'password_reset_requests';

let pendingResetRequestId = null;
let pendingUsername = null;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  const statusEl = document.getElementById('reset-password-status');
  const modal = document.getElementById('new-password-modal');
  const newPasswordForm = document.getElementById('new-password-form');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reset-password-username').value.trim();
    if (!username) {
      statusEl.textContent = '아이디를 입력하세요.';
      statusEl.style.color = 'var(--text-muted)';
      return;
    }

    statusEl.textContent = '확인 중...';
    statusEl.style.color = '';

    try {
      const { data: rows, error } = await supabase
        .from(RESET_TABLE)
        .select('id, username')
        .eq('username', username)
        .eq('approved', true)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!rows || rows.length === 0) {
        statusEl.textContent = '승인된 비밀번호 초기화 요청이 없습니다. 먼저 비밀번호 초기화 요청을 한 뒤 관리자 승인을 기다려 주세요.';
        statusEl.style.color = 'var(--text-muted)';
        return;
      }

      pendingResetRequestId = rows[0].id;
      pendingUsername = username;
      statusEl.textContent = '';
      document.getElementById('new-password').value = '';
      document.getElementById('new-password-confirm').value = '';
      modal.style.display = 'flex';
    } catch (err) {
      console.error(err);
      statusEl.textContent = '오류: ' + (err.message || '확인 실패');
      statusEl.style.color = 'var(--text-muted)';
    }
  });

  modalCancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    pendingResetRequestId = null;
    pendingUsername = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      pendingResetRequestId = null;
      pendingUsername = null;
    }
  });

  newPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('new-password-confirm').value;

    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!pendingUsername || !pendingResetRequestId) {
      alert('세션이 만료되었습니다. 아이디를 다시 입력해 주세요.');
      modal.style.display = 'none';
      return;
    }

    try {
      const salt = Auth.generateSalt();
      const password_hash = await Auth.hashPassword(newPassword, salt);

      const { error: updateUserError } = await supabase
        .from(USERS_TABLE)
        .update({ password_hash, salt })
        .eq('username', pendingUsername);

      if (updateUserError) throw updateUserError;

      const { error: updateResetError } = await supabase
        .from(RESET_TABLE)
        .update({ used: true })
        .eq('id', pendingResetRequestId);

      if (updateResetError) throw updateResetError;

      modal.style.display = 'none';
      pendingResetRequestId = null;
      pendingUsername = null;
      statusEl.textContent = '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.';
      statusEl.style.color = '';
      document.getElementById('reset-password-form').reset();
    } catch (err) {
      console.error(err);
      alert('비밀번호 변경 실패: ' + (err.message || '오류가 발생했습니다.'));
    }
  });
});
