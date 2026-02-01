const USERS_TABLE = 'app_users';
const RESET_TABLE = 'password_reset_requests';

document.addEventListener('DOMContentLoaded', () => {
  const session = Auth.getSession();
  if (!session || !session.is_admin) {
    window.location.href = 'view.html';
    return;
  }

  loadPendingRequests();
  loadResetRequests();
});

async function loadPendingRequests() {
  const statusEl = document.getElementById('signup-requests-status');
  const tbody = document.querySelector('#signup-requests-table tbody');
  const emptyEl = document.getElementById('signup-requests-empty');

  statusEl.textContent = '가입 요청 목록을 불러오는 중...';
  statusEl.style.color = '';
  tbody.innerHTML = '';
  emptyEl.style.display = 'none';

  try {
    const { data: rows, error } = await supabase
      .from(USERS_TABLE)
      .select('id, username, name, title, created_at')
      .eq('approved', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    statusEl.textContent = '';

    if (!rows || rows.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    tbody.innerHTML = rows
      .map((row) => {
        const dateStr = row.created_at
          ? new Date(row.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
          : '-';
        return `
          <tr data-id="${row.id}">
            <td>${escapeHtml(row.username || '')}</td>
            <td>${escapeHtml(row.name || '')}</td>
            <td>${escapeHtml(row.title || '-')}</td>
            <td>${dateStr}</td>
            <td>
            <button type="button" class="primary approve-btn" data-id="${row.id}" style="padding: 6px 12px; font-size: 13px;">승인</button>
            <button type="button" class="secondary delete-btn" data-id="${row.id}" style="padding: 6px 12px; font-size: 13px; margin-left: 6px;">삭제</button>
          </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('.approve-btn').forEach((btn) => {
      btn.addEventListener('click', () => approveRequest(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => deleteRequest(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = '목록을 불러오지 못했습니다: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

async function approveRequest(userId) {
  const statusEl = document.getElementById('signup-requests-status');
  statusEl.textContent = '승인 처리 중...';
  statusEl.style.color = '';

  try {
    const { error } = await supabase
      .from(USERS_TABLE)
      .update({ approved: true })
      .eq('id', userId);

    if (error) throw error;

    statusEl.textContent = '승인되었습니다.';
    statusEl.style.color = '';
    loadPendingRequests();
  } catch (err) {
    console.error(err);
    statusEl.textContent = '승인 실패: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

async function deleteRequest(userId) {
  if (!confirm('이 가입 요청을 삭제하면 목록에서 제거됩니다. 계속할까요?')) return;
  const statusEl = document.getElementById('signup-requests-status');
  statusEl.textContent = '삭제 처리 중...';
  statusEl.style.color = '';

  try {
    const { error } = await supabase
      .from(USERS_TABLE)
      .delete()
      .eq('id', userId);

    if (error) throw error;

    statusEl.textContent = '삭제되었습니다.';
    statusEl.style.color = '';
    loadPendingRequests();
  } catch (err) {
    console.error(err);
    statusEl.textContent = '삭제 실패: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

async function loadResetRequests() {
  const statusEl = document.getElementById('reset-requests-status');
  const tbody = document.querySelector('#reset-requests-table tbody');
  const emptyEl = document.getElementById('reset-requests-empty');

  if (!statusEl || !tbody || !emptyEl) return;

  statusEl.textContent = '비밀번호 초기화 요청 목록을 불러오는 중...';
  statusEl.style.color = '';
  tbody.innerHTML = '';
  emptyEl.style.display = 'none';

  try {
    const { data: rows, error } = await supabase
      .from(RESET_TABLE)
      .select('id, username, email, created_at, approved, used')
      .order('created_at', { ascending: false });

    if (error) throw error;

    statusEl.textContent = '';

    if (!rows || rows.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    tbody.innerHTML = rows
      .map((row) => {
        const dateStr = row.created_at
          ? new Date(row.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
          : '-';
        let statusStr = '대기';
        if (row.used === true) statusStr = '비밀번호 변경 완료';
        else if (row.approved === true) statusStr = '승인됨 (재설정 대기)';
        const statusClass = row.used === true ? 'color: var(--text-muted);' : '';
        const showApproveBtn = row.approved !== true && row.used !== true;
        return `
          <tr data-id="${row.id}">
            <td>${escapeHtml(row.username || '-')}</td>
            <td>${escapeHtml(row.email || '')}</td>
            <td>${dateStr}</td>
            <td style="${statusClass}">${statusStr}</td>
            <td>
            ${showApproveBtn ? `<button type="button" class="primary approve-reset-btn" data-id="${row.id}" style="padding: 6px 12px; font-size: 13px;">승인</button>` : ''}
            <button type="button" class="secondary delete-reset-btn" data-id="${row.id}" style="padding: 6px 12px; font-size: 13px; margin-left: 6px;">삭제</button>
          </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('.approve-reset-btn').forEach((btn) => {
      btn.addEventListener('click', () => approveResetRequest(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-reset-btn').forEach((btn) => {
      btn.addEventListener('click', () => deleteResetRequest(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = '목록을 불러오지 못했습니다: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

async function deleteResetRequest(requestId) {
  if (!confirm('이 비밀번호 초기화 요청을 삭제하면 목록에서 제거됩니다. 계속할까요?')) return;
  const statusEl = document.getElementById('reset-requests-status');
  statusEl.textContent = '삭제 처리 중...';
  statusEl.style.color = '';

  try {
    const { error } = await supabase
      .from(RESET_TABLE)
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    statusEl.textContent = '삭제되었습니다.';
    statusEl.style.color = '';
    loadResetRequests();
  } catch (err) {
    console.error(err);
    statusEl.textContent = '삭제 실패: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

async function approveResetRequest(requestId) {
  const statusEl = document.getElementById('reset-requests-status');
  statusEl.textContent = '승인 처리 중...';
  statusEl.style.color = '';

  try {
    const { error } = await supabase
      .from(RESET_TABLE)
      .update({ approved: true })
      .eq('id', requestId);

    if (error) throw error;

    statusEl.textContent = '비밀번호 초기화 요청이 승인되었습니다.';
    statusEl.style.color = '';
    loadResetRequests();
  } catch (err) {
    console.error(err);
    statusEl.textContent = '승인 실패: ' + (err.message || '오류');
    statusEl.style.color = 'var(--text-muted)';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
