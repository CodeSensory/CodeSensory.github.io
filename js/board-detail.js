const BOARD_TABLE = 'announcements';
let currentPostId = null;
let currentPost = null;

document.addEventListener('DOMContentLoaded', () => {
  // URL에서 게시글 ID 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  if (!postId) {
    alert('게시글을 찾을 수 없습니다.');
    window.location.href = 'board.html';
    return;
  }
  
  currentPostId = postId;
  fetchPostDetail();
  
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'board.html';
  });
  
  document.getElementById('delete-btn').addEventListener('click', handleDeletePost);
});

async function fetchPostDetail() {
  const statusEl = document.getElementById('board-status');
  statusEl.textContent = '게시글을 불러오는 중입니다...';
  
  try {
    const { data, error } = await supabase
      .from(BOARD_TABLE)
      .select('*')
      .eq('id', currentPostId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = 'board.html';
      return;
    }
    
    currentPost = data;
    
    // 조회수 증가
    await incrementViewCount(data);
    
    // 게시글 표시
    document.getElementById('board-detail-title').textContent = data.title;
    document.getElementById('board-detail-meta').textContent = `${data.author} · ${formatDate(data.created_at, true)}`;
    document.getElementById('board-detail-views').textContent = (data.views ?? 0) + 1;
    document.getElementById('board-detail-body').textContent = data.content;
    
    statusEl.textContent = '';
  } catch (err) {
    console.error(err);
    statusEl.textContent = `게시글을 불러오지 못했습니다: ${err.message}`;
  }
}

async function incrementViewCount(post) {
  try {
    const newViews = (post.views ?? 0) + 1;
    await supabase
      .from(BOARD_TABLE)
      .update({ views: newViews })
      .eq('id', post.id);
  } catch (err) {
    console.error('조회수 업데이트 실패:', err);
  }
}

async function handleDeletePost() {
  if (!currentPostId) {
    alert('삭제할 게시글을 찾을 수 없습니다.');
    return;
  }

  if (!confirm('이 게시글을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
    return;
  }

  const statusEl = document.getElementById('board-status');
  statusEl.textContent = '게시글을 삭제하는 중입니다...';

  try {
    const { error } = await supabase
      .from(BOARD_TABLE)
      .delete()
      .eq('id', currentPostId);

    if (error) throw error;

    alert('게시글이 삭제되었습니다.');
    window.location.href = 'board.html';
  } catch (err) {
    console.error(err);
    statusEl.textContent = `삭제 실패: ${err.message}`;
  }
}

function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = includeTime
    ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('ko-KR', options);
}


















