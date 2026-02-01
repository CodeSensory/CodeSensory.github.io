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
    if (label) label.textContent = studentId;
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

  async function searchStudent() {
    const input = document.getElementById('retake-search-student');
    const keyword = (input && input.value.trim()) || '';
    if (!keyword) {
      setStatus('학번을 입력하세요.', true);
      hideResultSection();
      return;
    }
    setStatus('검색 중...');
    hideResultSection();
    try {
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', keyword)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        showResultSection(keyword, data);
        setStatus('학생을 찾았습니다. 수정할 과목을 클릭하세요.');
      } else {
        setStatus('해당 학번의 학생이 없습니다. 학번을 확인하세요.', true);
      }
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
  });
})();
