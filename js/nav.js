/**
 * 모든 페이지에서 동일한 상단 네비게이션을 표시합니다.
 * 로그인/회원가입/비밀번호초기화 페이지에서는 네비 숨김. 로그인된 페이지에서는 로그아웃 링크 추가.
 */
(function () {
  var NAV_ITEMS = [
    { id: 'input', href: 'input.html', label: '성적 입력/관리' },
    { id: 'view', href: 'view.html', label: '성적 조회' },
    { id: 'summary', href: 'summary.html', label: '성적 요약' },
    { id: 'manage', href: 'manage.html', label: '관리 필요' },
    { id: 'retake', href: 'retake.html', label: '재수강 성적 입력' },
    { id: 'retake-list', href: 'retake-list.html', label: '재수강 인원 조회' },
    { id: 'board', href: 'board.html', label: '게시판' },
    { id: 'signup-requests', href: 'signup-requests.html', label: '가입 요청 관리', adminOnly: true }
  ];

  function getCurrentId() {
    var path = typeof window !== 'undefined' && window.location && window.location.pathname;
    if (!path) return '';
    var name = path.split('/').pop() || path;
    if (name === 'input.html' || name === 'preview.html') return 'input';
    if (name === 'view.html') return 'view';
    if (name === 'summary.html') return 'summary';
    if (name === 'manage.html') return 'manage';
    if (name === 'retake.html') return 'retake';
    if (name === 'retake-list.html') return 'retake-list';
    if (name === 'board.html' || name === 'board-detail.html' || name === 'board-write.html') return 'board';
    if (name === 'signup-requests.html') return 'signup-requests';
    return '';
  }

  function render() {
    var nav = document.querySelector('.global-nav');
    if (!nav) return;
    if (typeof Auth !== 'undefined' && Auth.isPublicPage()) {
      nav.innerHTML = '';
      nav.style.display = 'none';
      return;
    }
    nav.style.display = '';
    var session = typeof Auth !== 'undefined' ? Auth.getSession() : null;
    var isAdmin = session && session.is_admin;
    var current = nav.getAttribute('data-current') || getCurrentId();
    var items = NAV_ITEMS.filter(function (item) {
      return !item.adminOnly || isAdmin;
    });
    var html = items.map(function (item) {
      var active = item.id === current ? ' class="is-active"' : '';
      return '<a href="' + item.href + '"' + active + '>' + item.label + '</a>';
    }).join('\n        ');
    if (session) {
      html += ' <a href="login.html" id="nav-logout" style="margin-left: auto;">로그아웃</a>';
    }
    nav.innerHTML = html;
    var logoutLink = document.getElementById('nav-logout');
    if (logoutLink) {
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof Auth !== 'undefined') Auth.clearSession();
        window.location.href = 'login.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
