/**
 * 가입 요청 / 비밀번호 초기화 요청 시 Edge Function을 호출해 관리자에게 이메일 알림 발송.
 * Edge Function(notify-request) 배포 및 RESEND_API_KEY, ADMIN_EMAIL 설정이 되어 있어야 동작합니다.
 * 실패해도 사용자 화면에는 영향 없음 (조용히 무시).
 */
(function () {
  function notifyRequestEmail(payload) {
    var url = typeof window !== 'undefined' && window.SUPABASE_URL;
    var anonKey = typeof window !== 'undefined' && window.SUPABASE_ANON_KEY;
    if (!url || !anonKey) return;

    var fnUrl = url.replace(/\/$/, '') + '/functions/v1/notify-request';
    fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + anonKey,
      },
      body: JSON.stringify(payload),
    }).catch(function () {});
  }
  window.notifyRequestEmail = notifyRequestEmail;
})();
