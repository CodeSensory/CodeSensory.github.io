(function () {
  // 선택된 학기 정보 읽기
  function getSelectedSemester() {
    try {
      const sem = localStorage.getItem('selectedSemester');
      return sem ? JSON.parse(sem) : null;
    } catch (_) {
      return null;
    }
  }

  const selectedSemester = getSelectedSemester();
  const isGrade3Semester1 = selectedSemester && selectedSemester.grade === 3 && selectedSemester.semester === 1;
  const isGrade3Semester2 = selectedSemester && selectedSemester.grade === 3 && selectedSemester.semester === 2;
  const isGrade4Semester1 = selectedSemester && selectedSemester.grade === 4 && selectedSemester.semester === 1;
  const isGrade4Semester2 = selectedSemester && selectedSemester.grade === 4 && selectedSemester.semester === 2;
  // 학기 선택 드롭다운을 숨겨야 하는 경우: 3학년 1학기, 3학년 2학기, 4학년 1학기, 4학년 2학기
  const hideSemesterSelect = isGrade3Semester1 || isGrade3Semester2 || isGrade4Semester1 || isGrade4Semester2;

  // 선택된 학기 정보 표시
  const semesterInfoEl = document.getElementById('selected-semester-info');
  if (semesterInfoEl && selectedSemester) {
    semesterInfoEl.textContent = `선택된 학기: ${selectedSemester.label}`;
  }

  const form = document.getElementById('config-form');
  const numAEl = document.getElementById('num-a');
  const numBEl = document.getElementById('num-b');
  const numPeriodsEl = document.getElementById('num-periods');
  const buildBtn = document.getElementById('build-periods');
  const periodContainer = document.getElementById('period-assignments');
  const go1a = document.getElementById('go-1a');

  const FIXED_OPTIONS = [
    { value: 'A', label: 'A반' },
    { value: 'B', label: 'B반' },
    { value: 'A&B', label: '두 반 모두 가능' }
  ];

  function createClassSelect(id) {
    const select = document.createElement('select');
    select.className = 'select';
    if (id) select.id = id;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '반 선택';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    FIXED_OPTIONS.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    });

    return select;
  }

  function createSemesterSelect(id) {
    const select = document.createElement('select');
    select.className = 'select';
    if (id) select.id = id;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '학기 선택';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    const s1 = document.createElement('option'); s1.value = '1'; s1.textContent = '1학기';
    const s2 = document.createElement('option'); s2.value = '2'; s2.textContent = '2학기';
    select.appendChild(s1); select.appendChild(s2);
    return select;
  }


  function rebuildPeriodRows() {
    const numPeriods = Math.max(0, Number(numPeriodsEl.value) || 0);

    periodContainer.innerHTML = '';

    if (numPeriods === 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = '기간 수를 1 이상으로 입력하고 생성 버튼을 눌러주세요.';
      periodContainer.appendChild(p);
      return;
    }

    for (let i = 1; i <= numPeriods; i++) {
      const row = document.createElement('div');
      row.className = 'period-row';

      const label = document.createElement('label');
      label.className = 'period-label';
      label.textContent = `기간 ${i}`;

      const classSelect = createClassSelect(`period-${i}-class`);
      
      // 학기 선택 드롭다운을 숨겨야 하는 경우
      if (!hideSemesterSelect) {
        const semSelect = createSemesterSelect(`period-${i}-semester`);
        row.appendChild(label);
        row.appendChild(classSelect);
        row.appendChild(semSelect);
      } else {
        // 학기 선택 드롭다운을 숨기는 경우: 선택된 학기로 자동 설정
        row.appendChild(label);
        row.appendChild(classSelect);
        // 숨겨진 입력으로 선택된 학기 값 저장
        const hiddenSem = document.createElement('input');
        hiddenSem.type = 'hidden';
        hiddenSem.id = `period-${i}-semester`;
        // 선택된 학기의 학기 번호 사용 (3학년 1학기면 '1', 3학년 2학기면 '2' 등)
        hiddenSem.value = selectedSemester ? String(selectedSemester.semester) : '1';
        row.appendChild(hiddenSem);
      }
      
      periodContainer.appendChild(row);
    }
  }

  function buildConfig() {
    const numA = Number(numAEl.value);
    const numB = Number(numBEl.value);
    const numPeriods = Number(numPeriodsEl.value);

    const assignments = [];
    for (let i = 1; i <= numPeriods; i++) {
      const clsSel = document.getElementById(`period-${i}-class`);
      const semSel = document.getElementById(`period-${i}-semester`);
      const selectedClass = clsSel ? clsSel.value : '';
      // 학기 선택 드롭다운을 숨기는 경우: 숨겨진 입력에서 학기 값 가져오기
      const selectedSemesterValue = hideSemesterSelect 
        ? (semSel ? semSel.value : (selectedSemester ? String(selectedSemester.semester) : '1'))
        : (semSel ? semSel.value : '');
      assignments.push({ period: i, class: selectedClass || null, semester: selectedSemesterValue || null });
    }

    return { numA, numB, numPeriods, assignments };
  }

  function clearErrors() {
    [numAEl, numBEl, numPeriodsEl, ...periodContainer.querySelectorAll('select')]
      .forEach(el => el && el.classList && el.classList.remove('input-error'));
  }

  function validateAndMark() {
    clearErrors();
    let ok = true;
    if (!numAEl.value.trim()) { numAEl.classList.add('input-error'); ok = false; }
    if (!numBEl.value.trim()) { numBEl.classList.add('input-error'); ok = false; }
    if (!numPeriodsEl.value.trim() || Number(numPeriodsEl.value) < 1) { numPeriodsEl.classList.add('input-error'); ok = false; }

    const numPeriods = Number(numPeriodsEl.value || '0');
    for (let i = 1; i <= numPeriods; i++) {
      const clsSel = document.getElementById(`period-${i}-class`);
      const semSel = document.getElementById(`period-${i}-semester`);
      if (!clsSel || !clsSel.value) { if (clsSel) clsSel.classList.add('input-error'); ok = false; }
      // 학기 선택 드롭다운이 표시되는 경우에만 학기 선택 검증
      if (!hideSemesterSelect) {
        if (!semSel || !semSel.value) { if (semSel) semSel.classList.add('input-error'); ok = false; }
      }
    }
    return ok;
  }

  buildBtn.addEventListener('click', () => {
    rebuildPeriodRows();
  });

  if (go1a) {
    go1a.addEventListener('click', (e) => {
      if (!validateAndMark()) { e.preventDefault(); return; }
      const data = buildConfig();
      try { localStorage.setItem('batchConfig', JSON.stringify(data)); } catch (_) {}
    });
  }
})();














