(function () {
  let currentStudentData = null; // 검색된 학생 원본 데이터 (student_grades row)

  // 재수강 페이지 전용: 표시용 점수 (맨 앞 숫자만, 중첩 괄호 대응)
  function getDisplayScore(value) {
    if (value === null || value === undefined || value === '') return '-';
    const m = String(value).match(/^\d+(?:\.\d+)?/);
    return m ? m[0] : '-';
  }

  // 저장된 점수 값 파싱 → 모달 pre-fill용 { score, year, subjectName }
  function parseScoreForRetake(value) {
    const out = { score: '', year: '', subjectName: '' };
    if (value === null || value === undefined || value === '') return out;
    const s = String(value).trim();
    const numMatch = s.match(/^(\d+(?:\.\d+)?)/);
    if (numMatch) out.score = numMatch[1];
    const innerMatch = s.match(/^\d+(?:\.\d+)?\((.*)\)$/s);
    if (!innerMatch) return out;
    // 최대 3개로 분리 (연도, 과목, 이전점수) — 이전점수에 쉼표가 있을 수 있음
    const parts = innerMatch[1].split(/\s*,\s*/, 3);
    if (parts[0]) out.year = parts[0].trim();
    if (parts[1]) out.subjectName = parts[1].trim();
    return out;
  }

  // 재수강 저장 시: 점수(수강 년도, 수강 과목, 이전 점수)
  function formatRetakeScore(score, year, subjectName, previousValue) {
    const prev = previousValue !== null && previousValue !== undefined && previousValue !== '' ? String(previousValue) : '';
    if (!prev) return `${score}(${year}, ${subjectName})`;
    return `${score}(${year}, ${subjectName}, ${prev})`;
  }

  // 표시용 성취도 (괄호 앞까지, 없으면 전체)
  function getDisplayAchievement(value) {
    if (value === null || value === undefined || value === '') return '-';
    const s = String(value).trim();
    const i = s.indexOf('(');
    return i > 0 ? s.slice(0, i) : s;
  }

  // 재수강 저장 시: 새성취도(이전 성취도)
  function formatRetakeAchievement(newAchievement, previousValue) {
    const prev = previousValue !== null && previousValue !== undefined && previousValue !== '' ? String(previousValue) : '';
    if (!prev) return newAchievement;
    return `${newAchievement}(${prev})`;
  }

  function setStatus(msg, isError) {
    const el = document.getElementById('retake-status');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? 'var(--text-muted)' : '';
  }

  function renderLevelTable(level, rawData) {
    const tbody = document.getElementById('retake-tbody-' + level);
    if (!tbody) return;
    tbody.innerHTML = SUBJECTS.map((_, index) => {
      const subjectKey = getSubjectKey(level, index);
      const achievementKey = getAchievementKey(level, index);
      const scoreVal = rawData[subjectKey];
      const achievementVal = rawData[achievementKey];
      // 점수 값이 없는 과목은 표시하지 않음 (수정 불가)
      if (scoreVal === null || scoreVal === undefined || String(scoreVal).trim() === '') {
        return '';
      }
      const scoreDisplay = getDisplayScore(scoreVal);
      const achievementDisplay = getDisplayAchievement(achievementVal);
      const subjectName = getSubjectName(index + 1);
      return `
        <tr data-level="${level}" data-subject-index="${index}" class="retake-row">
          <td>${subjectName}</td>
          <td>${scoreDisplay}</td>
          <td>${achievementDisplay}</td>
        </tr>
      `;
    }).join('');
  }

  function showResultSection(studentId, rawData) {
    currentStudentData = rawData;
    const section = document.getElementById('retake-result-section');
    const label = document.getElementById('retake-student-id-label');
    if (section) section.style.display = 'block';
    if (label) label.textContent = rawData.student_name ? `${studentId}(${rawData.student_name})` : studentId;
    LEVELS.forEach(level => renderLevelTable(level, rawData));

    document.querySelectorAll('.retake-row').forEach((row) => {
      row.addEventListener('click', function () {
        const level = this.getAttribute('data-level');
        const subjectIndex = parseInt(this.getAttribute('data-subject-index'), 10);
        openModal(level, subjectIndex);
      });
    });
  }

  function hideResultSection() {
    currentStudentData = null;
    const section = document.getElementById('retake-result-section');
    if (section) section.style.display = 'none';
  }

  function openModal(level, subjectIndex) {
    if (!currentStudentData) return;
    const subjectKey = getSubjectKey(level, subjectIndex);
    const achievementKey = getAchievementKey(level, subjectIndex);
    const scoreVal = currentStudentData[subjectKey];
    const achievementVal = currentStudentData[achievementKey];
    const parsed = parseScoreForRetake(scoreVal);
    const currentAchievement = getDisplayAchievement(achievementVal);

    document.getElementById('retake-modal-level').value = level;
    document.getElementById('retake-modal-subject-index').value = subjectIndex;
    document.getElementById('retake-modal-year').value = parsed.year || '';
    document.getElementById('retake-modal-subject-name').value = parsed.subjectName || getSubjectName(subjectIndex + 1);
    document.getElementById('retake-modal-score').value = parsed.score || '';
    document.getElementById('retake-modal-achievement').value = currentAchievement === '-' ? '' : currentAchievement;
    document.getElementById('retake-modal-status').textContent = '';
    document.getElementById('retake-modal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('retake-modal').style.display = 'none';
  }

  let pendingNameMatches = []; // 이름 검색 시 여러 명일 때 목록

  function showSelectStudentModal(matches) {
    pendingNameMatches = matches;
    const modal = document.getElementById('retake-select-student-modal');
    const listEl = document.getElementById('retake-select-student-list');
    if (!modal || !listEl) return;
    listEl.innerHTML = matches
      .map(function (row, index) {
        const name = row.student_name || '-';
        const sid = row.student_id || '-';
        return (
          '<li data-index="' +
          index +
          '" style="padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px; cursor: pointer; background: var(--bg-secondary);">' +
          '<strong>' + (name || '-') + '</strong> ' +
          '<span style="color: var(--text-muted);">' + sid + '</span>' +
          '</li>'
        );
      })
      .join('');
    listEl.querySelectorAll('li').forEach(function (li) {
      li.addEventListener('click', function () {
        const idx = parseInt(li.getAttribute('data-index'), 10);
        const row = pendingNameMatches[idx];
        if (row) {
          document.getElementById('retake-select-student-modal').style.display = 'none';
          showResultSection(row.student_id, row);
          setStatus('학생을 찾았습니다. 수정할 과목을 클릭하세요.');
        }
      });
    });
    modal.style.display = 'flex';
  }

  function hideSelectStudentModal() {
    const modal = document.getElementById('retake-select-student-modal');
    if (modal) modal.style.display = 'none';
    pendingNameMatches = [];
  }

  async function searchStudent() {
    const input = document.getElementById('retake-search-student');
    const keyword = (input && input.value.trim()) || '';
    if (!keyword) {
      setStatus('학번 또는 이름을 입력하세요.', true);
      hideResultSection();
      hideSelectStudentModal();
      return;
    }
    setStatus('검색 중...');
    hideResultSection();
    hideSelectStudentModal();
    try {
      // 1) 학번으로 정확히 검색
      const { data: byId, error: errId } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', keyword)
        .maybeSingle();
      if (errId) throw errId;
      if (byId) {
        showResultSection(keyword, byId);
        setStatus('학생을 찾았습니다. 수정할 과목을 클릭하세요.');
        return;
      }
      // 2) 이름으로 검색 (포함)
      const { data: byName, error: errName } = await supabase
        .from('student_grades')
        .select('*')
        .ilike('student_name', '%' + keyword + '%')
        .order('student_id', { ascending: true });
      if (errName) throw errName;
      const list = byName || [];
      if (list.length === 0) {
        setStatus('해당하는 학생이 없습니다. 학번 또는 이름을 확인하세요.', true);
        return;
      }
      if (list.length === 1) {
        showResultSection(list[0].student_id, list[0]);
        setStatus('학생을 찾았습니다. 수정할 과목을 클릭하세요.');
        return;
      }
      // 3) 동일 이름 여러 명 → 선택 팝업
      showSelectStudentModal(list);
      setStatus('동일한 이름의 학생이 여러 명 있습니다. 목록에서 선택하세요.');
    } catch (e) {
      console.error(e);
      setStatus('검색 중 오류가 발생했습니다.', true);
    }
  }

  async function saveRetakeEdit(event) {
    event.preventDefault();
    if (!currentStudentData) {
      closeModal();
      return;
    }
    const level = document.getElementById('retake-modal-level').value;
    const subjectIndex = parseInt(document.getElementById('retake-modal-subject-index').value, 10);
    const year = document.getElementById('retake-modal-year').value.trim();
    const subjectName = document.getElementById('retake-modal-subject-name').value.trim();
    const score = document.getElementById('retake-modal-score').value.trim();
    const achievement = document.getElementById('retake-modal-achievement').value.trim();
    const statusEl = document.getElementById('retake-modal-status');
    if (!score && !achievement) {
      statusEl.textContent = '점수 또는 성취도를 입력하세요.';
      return;
    }
    const subjectKey = getSubjectKey(level, subjectIndex);
    const achievementKey = getAchievementKey(level, subjectIndex);
    const previousScoreValue = currentStudentData[subjectKey];
    const previousAchievementValue = currentStudentData[achievementKey];

    let newScoreValue = previousScoreValue;
    let newAchievementValue = previousAchievementValue;

    if (score !== '') {
      newScoreValue = formatRetakeScore(score, year || '-', subjectName || '-', previousScoreValue);
    }
    if (achievement !== '') {
      newAchievementValue = formatRetakeAchievement(achievement, previousAchievementValue);
    }

    const payload = {
      ...currentStudentData,
      [subjectKey]: newScoreValue,
      [achievementKey]: newAchievementValue,
    };
    delete payload.id;
    delete payload.updated_at;

    statusEl.textContent = '저장 중...';
    try {
      const { error } = await supabase
        .from('student_grades')
        .update({
          [subjectKey]: newScoreValue,
          [achievementKey]: newAchievementValue,
        })
        .eq('student_id', currentStudentData.student_id);
      if (error) throw error;
      currentStudentData[subjectKey] = newScoreValue;
      currentStudentData[achievementKey] = newAchievementValue;
      renderLevelTable(level, currentStudentData);
      document.querySelectorAll('#retake-tbody-' + level + ' .retake-row').forEach((row) => {
        row.addEventListener('click', function () {
          const l = this.getAttribute('data-level');
          const idx = parseInt(this.getAttribute('data-subject-index'), 10);
          openModal(l, idx);
        });
      });
      statusEl.textContent = '저장되었습니다.';
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (e) {
      console.error(e);
      statusEl.textContent = '저장 실패: ' + (e.message || e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('retake-search-btn');
    const searchInput = document.getElementById('retake-search-student');
    if (searchBtn) searchBtn.addEventListener('click', searchStudent);
    if (searchInput) searchInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') searchStudent(); });
    document.getElementById('retake-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('retake-edit-form').addEventListener('submit', saveRetakeEdit);
    var selectModal = document.getElementById('retake-select-student-modal');
    var selectCancel = document.getElementById('retake-select-student-cancel');
    if (selectCancel) selectCancel.addEventListener('click', hideSelectStudentModal);
    if (selectModal) selectModal.addEventListener('click', function (e) { if (e.target === selectModal) hideSelectStudentModal(); });
  });
})();
