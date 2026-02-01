/**
 * 로그인 없이 게시판(announcements) 1번 글(id=1)의 제목만 가져와 표시.
 * 네비/메뉴에는 노출하지 않는 단독 페이지용.
 */
(function () {
  const POST_ID = 1;
  const BOARD_TABLE = 'announcements';

  async function loadFirstPostTitle() {
    const titleEl = document.getElementById('title-output');
    const errorEl = document.getElementById('title-error');

    if (!titleEl) return;

    try {
      const { data, error } = await supabase
        .from(BOARD_TABLE)
        .select('title')
        .eq('id', POST_ID)
        .maybeSingle();

      if (error) throw error;

      if (data && data.title != null) {
        titleEl.textContent = data.title;
        titleEl.style.color = '';
      } else {
        titleEl.textContent = '(1번 글이 없습니다.)';
        titleEl.style.color = 'var(--text-muted)';
      }
    } catch (err) {
      console.error(err);
      titleEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = '제목을 불러오지 못했습니다: ' + (err.message || '오류');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFirstPostTitle);
  } else {
    loadFirstPostTitle();
  }
})();
