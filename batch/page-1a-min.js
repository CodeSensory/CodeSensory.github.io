(function () {
  function readStore() { try { return JSON.parse(localStorage.getItem('batchConfig') || '{}'); } catch (_) { return {}; } }

  // 선택된 학기 정보 읽기
  function getSelectedSemester() {
    try {
      const sem = localStorage.getItem('selectedSemester');
      return sem ? JSON.parse(sem) : null;
    } catch (_) {
      return null;
    }
  }

  const selectedSemesterInfo = getSelectedSemester();
  const isGrade3Semester1 = selectedSemesterInfo && selectedSemesterInfo.grade === 3 && selectedSemesterInfo.semester === 1;
  const isGrade4Semester1 = selectedSemesterInfo && selectedSemesterInfo.grade === 4 && selectedSemesterInfo.semester === 1;

  const store = readStore();
  const maxData = store?.oneA?.max || [];
  const numPeriods = Number(store?.oneA?.numPeriods || store?.numPeriods || 0);

  const rowsContainer = document.getElementById('min-rows');
  const rowsEmpty = document.getElementById('min-empty');
  const goSummary = document.getElementById('go-summary');
  const semToggle = document.getElementById('semester-toggle');
  const semToggleContainer = document.getElementById('semester-toggle-container');

  // 3학년 1학기인 경우 학기 토글 숨김
  if (isGrade3Semester1 && semToggleContainer) {
    semToggleContainer.style.display = 'none';
  }

  const assignments = Array.isArray(store?.assignments) ? store.assignments : [];
  const periodSemester = (idx) => {
    const a = assignments[idx];
    return (a && a.semester) ? String(a.semester) : '';
  };
  const selectedSemester = (localStorage.getItem('selectedSemesterOneA') || '1');
  
  // 3학년 1학기인 경우 모든 기간을 표시, 그 외에는 선택된 학기의 기간만 표시
  const visiblePeriodIndexes = isGrade3Semester1
    ? Array.from({ length: numPeriods }, (_, i) => i)
    : Array.from({ length: numPeriods }, (_, i) => i).filter(i => periodSemester(i) === selectedSemester);

  function createReadonlyInput(value) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.className = 'row-input';
    input.readOnly = true;
    input.tabIndex = -1;
    return input;
  }
  function createNumberInput(placeholder, periodIdx) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.placeholder = placeholder;
    input.className = 'row-input period-input';
    input.setAttribute('data-period-index', String(periodIdx));
    return input;
  }
  function createMinRow(maxRow, savedMinRow) {
    const row = document.createElement('div');
    row.className = 'row-grid-dynamic';
    
    if (isGrade3Semester1) {
      // 3학년 1학기: 병원명, 부서명, 내과/외과 표시
      row.appendChild(createReadonlyInput(maxRow.hospital));
      row.appendChild(createReadonlyInput(maxRow.department));
      const deptTypeDisplay = createReadonlyInput(maxRow.deptType === 'internal' ? '내과' : (maxRow.deptType === 'external' ? '외과' : ''));
      row.appendChild(deptTypeDisplay);
    } else {
      // 일반 모드: 4학년 1학기일 때만 분기 필드 및 부서 필드 표시 (순서: 과목, 분기, 병원, 부서)
      row.appendChild(createReadonlyInput(maxRow.subject));
      if (isGrade4Semester1) {
        row.appendChild(createReadonlyInput(maxRow.branch || '')); // 분기는 선택사항
        row.appendChild(createReadonlyInput(maxRow.hospital));
        row.appendChild(createReadonlyInput(maxRow.department || '')); // 부서는 선택사항
      } else {
        row.appendChild(createReadonlyInput(maxRow.hospital));
      }
    }
    
    visiblePeriodIndexes.forEach(i => {
      const n = createNumberInput(`기간 ${i + 1}`, i);
      n.max = String(maxRow.values?.[i] ?? '');
      // 저장된 최소값이 있으면 복원
      if (savedMinRow && savedMinRow.values && savedMinRow.values[i] != null) {
        n.value = String(savedMinRow.values[i]);
      }
      row.appendChild(n);
    });
    return row;
  }
  
  function loadSavedMinData() {
    const s = readStore();
    // 3학년 1학기인 경우 min_sem1에서 데이터 로드
    const semKey = isGrade3Semester1 ? 'min_sem1' : `min_sem${selectedSemester}`;
    const savedData = s?.oneA?.[semKey] || [];
    return savedData;
  }
  
  function render() {
    rowsContainer.innerHTML = '';
    if (!numPeriods || maxData.length === 0) { rowsEmpty.style.display = 'block'; return; }
    rowsEmpty.style.display = 'none';
    
    const savedMinData = loadSavedMinData();
    const savedMinMap = new Map();
    savedMinData.forEach(row => {
      if (isGrade3Semester1) {
        const key = `${row.hospital}|${row.department}|${row.deptType}`;
        savedMinMap.set(key, row);
      } else {
        const key = `${row.subject}|${row.hospital}`;
        savedMinMap.set(key, row);
      }
    });
    
    maxData.forEach(m => {
      let key;
      if (isGrade3Semester1) {
        key = `${m.hospital}|${m.department}|${m.deptType}`;
      } else {
        key = `${m.subject}|${m.hospital}`;
      }
      const savedMinRow = savedMinMap.get(key);
      rowsContainer.appendChild(createMinRow(m, savedMinRow));
    });
  }
  function clearErrors() {
    rowsContainer.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }
  function collectDataAndMark() {
    clearErrors();
    const result = [];
    let ok = true;
    const rows = Array.from(rowsContainer.querySelectorAll('.row-grid-dynamic'));
    if (rows.length === 0) { ok = false; rowsEmpty.style.display = 'block'; }
    rows.forEach((row, idx) => {
      const inputs = Array.from(row.querySelectorAll('input'));
      const mins = Array.from({ length: numPeriods }, () => 0);
      
      if (isGrade3Semester1) {
        // 3학년 1학기: 병원명, 부서명, 내과/외과
        const hospital = inputs[0].value;
        const department = inputs[1].value;
        const deptType = maxData[idx]?.deptType || '';
        inputs.slice(3).forEach((i) => {
          const p = Number(i.getAttribute('data-period-index'));
          const raw = i.value.trim();
          const minVal = Number(raw || '0');
          const maxVal = Number(maxData[idx]?.values?.[p] ?? 0);
          if (raw === '' || Number.isNaN(minVal) || minVal < 0 || minVal > maxVal) {
            i.classList.add('input-error');
            ok = false;
          }
          if (!Number.isNaN(p)) mins[p] = minVal;
        });
        result.push({ hospital, department, deptType, values: mins });
      } else {
        // 일반 모드: 4학년 1학기일 때만 분기 필드 및 부서 필드 포함
        const subject = inputs[0].value;
        let hospital, valuesStartIndex;
        let branch = undefined;
        let department = undefined;
        
        if (isGrade4Semester1) {
          // 4학년 1학기: 과목, 분기(선택사항), 병원, 부서(선택사항)
          branch = inputs[1].value || undefined;
          hospital = inputs[2].value;
          department = inputs[3].value || undefined;
          valuesStartIndex = 4;
        } else {
          // 일반 모드: 과목, 병원
          hospital = inputs[1].value;
          valuesStartIndex = 2;
        }
        
        inputs.slice(valuesStartIndex).forEach((i) => {
          const p = Number(i.getAttribute('data-period-index'));
          const raw = i.value.trim();
          const minVal = Number(raw || '0');
          const maxVal = Number(maxData[idx]?.values?.[p] ?? 0);
          if (raw === '' || Number.isNaN(minVal) || minVal < 0 || minVal > maxVal) {
            i.classList.add('input-error');
            ok = false;
          }
          if (!Number.isNaN(p)) mins[p] = minVal;
        });
        result.push({ subject, branch: branch || undefined, department: department || undefined, hospital, values: mins });
      }
    });
    return { data: result, ok };
  }
  function persistMin(minData) {
    const s = readStore();
    s.oneA = s.oneA || {};
    
    // 3학년 1학기인 경우 min_sem1에 저장하고 바로 min으로 복사
    if (isGrade3Semester1) {
      s.oneA.min_sem1 = minData;
      s.oneA.min = minData;
    } else if (isGrade4Semester1) {
      // 4학년 1학기: 부서도 고려해서 합치지 않음 (각 행을 그대로 유지)
      s.oneA.min_sem1 = minData;
      s.oneA.min = minData;
    } else {
      // 일반 모드: 현재 학기 데이터 저장
      s.oneA[`min_sem${selectedSemester}`] = minData;
      // 전체 데이터 병합 (다음 단계로 전달용)
      const sem1Data = s.oneA.min_sem1 || [];
      const sem2Data = s.oneA.min_sem2 || [];
      // 두 학기 데이터를 병합
      const allRows = new Map();
      sem1Data.forEach(row => {
        const key = `${row.subject}|${row.hospital}`;
        if (!allRows.has(key)) {
          allRows.set(key, { ...row, values: [...row.values] });
        } else {
          const existing = allRows.get(key);
          row.values.forEach((val, idx) => {
            if (val > 0) existing.values[idx] = val;
          });
        }
      });
      sem2Data.forEach(row => {
        const key = `${row.subject}|${row.hospital}`;
        if (!allRows.has(key)) {
          allRows.set(key, { ...row, values: [...row.values] });
        } else {
          const existing = allRows.get(key);
          row.values.forEach((val, idx) => {
            if (val > 0) existing.values[idx] = val;
          });
        }
      });
      s.oneA.min = Array.from(allRows.values());
    }
    s.oneA.numPeriods = numPeriods;
    try { localStorage.setItem('batchConfig', JSON.stringify(s)); } catch (_) {}
  }

  // 토글 이벤트 리스너 설정 (함수 정의 후에)
  // 3학년 1학기가 아닌 경우에만 토글 이벤트 리스너 설정
  if (semToggle && !isGrade3Semester1) {
    semToggle.value = selectedSemester;
    semToggle.addEventListener('change', () => {
      // 토글 변경 전에 현재 입력된 데이터를 저장
      const { data } = collectDataAndMark();
      const s = readStore();
      s.oneA = s.oneA || {};
      s.oneA[`min_sem${selectedSemester}`] = data;
      try { localStorage.setItem('batchConfig', JSON.stringify(s)); } catch (_) {}
      
      // 새 학기로 전환
      try { localStorage.setItem('selectedSemesterOneA', semToggle.value); } catch (_) {}
      location.reload();
    });
  }

  goSummary.addEventListener('click', (e) => {
    const { data, ok } = collectDataAndMark();
    if (!ok) { e.preventDefault(); return; }
    persistMin(data);
    goSummary.setAttribute('href', 'page-1a-summary.html');
  });

  render();
})();


