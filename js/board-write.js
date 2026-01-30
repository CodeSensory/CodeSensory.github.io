const BOARD_TABLE = 'announcements';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'board.html';
  });
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      window.location.href = 'board.html';
    }
  });
  
  document.getElementById('board-form').addEventListener('submit', handleCreatePost);
});

async function handleCreatePost(event) {
  event.preventDefault();
  const statusEl = document.getElementById('board-form-status');
  statusEl.textContent = '게시글을 등록하는 중입니다...';

  const title = document.getElementById('board-title').value.trim();
  const author = document.getElementById('board-author').value.trim();
  const content = document.getElementById('board-content').value.trim();

  if (!title || !author || !content) {
    statusEl.textContent = '모든 필드를 입력해 주세요.';
    statusEl.style.color = 'var(--text-muted)';
    return;
  }

  try {
    const { data, error } = await supabase.from(BOARD_TABLE).insert({
      title,
      author,
      content,
    });

    if (error) throw error;

    statusEl.textContent = '게시글이 등록되었습니다. 목록으로 이동합니다...';
    statusEl.style.color = '';
    
    setTimeout(() => {
      window.location.href = 'board.html';
    }, 1000);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `등록 실패: ${err.message}`;
    statusEl.style.color = 'var(--text-muted)';
  }
}


















