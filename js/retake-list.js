/**
 * 재수강 인원 조회: 재수강한 학생만 표시, 각 과목 셀에 "5(하) -> 9(상)" 형식으로 표시
 */
(function () {
  let allRows = [];
  let currentLevel = 'l1';

  // 재수강 점수 여부 (괄호 안에 쉼표 2개 이상)
  function isRetakeScore(value) {
    if (value === null || value === undefined || value === '') return false;
    const s = String(value).trim();
    return s.includes('(') && (s.match(/,/g) || []).length >= 2;
  }

  // 현재 점수 (맨 앞 숫자)
  function getDisplayScore(value) {
    if (value === null || value === undefined || value === '') return '';
    const m = String(value).match(/^\d+(?:\.\d+)?/);
    return m ? m[0] : '';
  }

  // 이전 점수 (재수강 형식일 때 괄호 안 세 번째 부분의 맨 앞 숫자)
  function getPreviousScore(value) {
    if (!value || !isRetakeScore(value)) return '';
    const s = String(value).trim();
    const innerMatch = s.match(/^\d+(?:\.\d+)?\((.*)\)$/s);
    if (!innerMatch) return '';
    const parts = innerMatch[1].split(/\s*,\s*/, 3);
    if (parts.length < 3) return '';
    const prevPart = parts[2].trim();
    const numMatch = prevPart.match(/^\d+(?:\.\d+)?/);
    return numMatch ? numMatch[0] : '';
  }

  // 현재 달성도 (괄호 앞까지, 없으면 전체)
  function getDisplayAchievement(value) {
    if (value === null || value === undefined || value === '') return '';
    const s = String(value).trim();
    const i = s.indexOf('(');
    return i > 0 ? s.slice(0, i) : s;
  }

  // 이전 달성도 (괄호 안 내용, 예: "중(하)" -> "하")
  function getPreviousAchievement(value) {
    if (value === null || value === undefined || value === '') return '';
    const s = String(value).trim();
    const i = s.indexOf('(');
    if (i < 0) return '';
    const inner = s.slice(i + 1).replace(/\)+$/, '').trim();
    return inner || '';
  }

  // 재수강 여부 (달성도가 "새(이전)" 형식)
  function isRetakeAchievement(value) {
    if (value === null || value === undefined || value === '') return false;
    return String(value).indexOf('(') > 0;
  }

  // 셀 표시: "5(하) → 9(상)" (현재 부분은 빨간색) 또는 "9(상)" 또는 "-"
  function formatCell(rawScore, rawAchievement) {
    const currScore = getDisplayScore(rawScore);
    const currAch = getDisplayAchievement(rawAchievement);
    const hasRetakeScore = isRetakeScore(rawScore);
    const hasRetakeAch = isRetakeAchievement(rawAchievement);
    const isRetake = hasRetakeScore || hasRetakeAch;

    const currStr =
      currScore && currAch ? currScore + '(' + currAch + ')' : (currScore || currAch || '');
    if (!currStr) return '-';
    if (!isRetake) return currStr;

    const prevScore = getPreviousScore(rawScore);
    const prevAch = getPreviousAchievement(rawAchievement);
    const prevStr =
      prevScore && prevAch ? prevScore + '(' + prevAch + ')' : (prevScore || prevAch || '');
    if (prevStr && currStr) {
      return prevStr + ' → <span class="retake-list-current">' + currStr + '</span>';
    }
    return currStr;
  }

  // 해당 레벨에서 재수강 이력이 하나라도 있는지
  function hasRetakeInLevel(rawData, level) {
    for (let idx = 0; idx < SUBJECTS.length; idx++) {
      const scoreKey = getSubjectKey(level, idx);
      const achKey = getAchievementKey(level, idx);
      if (isRetakeScore(rawData[scoreKey]) || isRetakeAchievement(rawData[achKey])) return true;
    }
    return false;
  }

  function filterRetakeRows(rows) {
    return rows.filter(function (row) {
      return row && row.rawData && hasRetakeInLevel(row.rawData, currentLevel);
    });
  }

  function renderTable(rows) {
    const thead = document.querySelector('#retake-list-table thead');
    const tbody = document.querySelector('#retake-list-table tbody');
    const statusEl = document.getElementById('retake-list-status');
    if (!thead || !tbody || !statusEl) return;

    thead.innerHTML =
      '<tr><th>학번</th><th>이름</th>' +
      SUBJECTS.map(function (_, index) {
        return '<th>' + getSubjectName(index + 1) + '</th>';
      }).join('') +
      '</tr>';

    if (!rows || rows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="20" style="text-align: center; padding: 20px; color: var(--text-muted);">재수강 이력이 있는 학생이 없습니다. (레벨: ' +
        currentLevel.toUpperCase() +
        ')</td></tr>';
      statusEl.textContent = '0건';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        const raw = row.rawData;
        const nameDisplay = raw && raw.student_name ? raw.student_name : '-';
        const cells = SUBJECTS.map(function (_, index) {
          const scoreKey = getSubjectKey(currentLevel, index);
          const achKey = getAchievementKey(currentLevel, index);
          const text = formatCell(raw[scoreKey], raw[achKey]);
          return '<td class="retake-list-cell">' + text + '</td>';
        }).join('');
        return '<tr><td>' + (row.student_id || '-') + '</td><td>' + nameDisplay + '</td>' + cells + '</tr>';
      })
      .join('');
    statusEl.textContent = rows.length + '건 (레벨: ' + currentLevel.toUpperCase() + ')';
  }

  async function fetchAll() {
    const statusEl = document.getElementById('retake-list-status');
    statusEl.textContent = '불러오는 중...';
    try {
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .order('student_id', { ascending: true });
      if (error) throw error;
      allRows = (data || []).map(function (row) {
        return { student_id: row.student_id, rawData: row };
      });
      const filtered = filterRetakeRows(allRows);
      renderTable(filtered);
    } catch (err) {
      console.error(err);
      statusEl.textContent = '불러오기 실패: ' + (err.message || err);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderTable([]);
    fetchAll();
    document.getElementById('retake-list-level').addEventListener('change', function (e) {
      currentLevel = e.target.value;
      var filtered = filterRetakeRows(allRows);
      renderTable(filtered);
    });
  });
})();
