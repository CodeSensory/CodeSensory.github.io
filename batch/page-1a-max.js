(function () {
  function readBatchConfig() {
    try { return JSON.parse(localStorage.getItem('batchConfig') || '{}'); } catch (_) { return {}; }
  }

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
  const isGrade3Semester2 = selectedSemesterInfo && selectedSemesterInfo.grade === 3 && selectedSemesterInfo.semester === 2;
  const isGrade4Semester1 = selectedSemesterInfo && selectedSemesterInfo.grade === 4 && selectedSemesterInfo.semester === 1;
  const isGrade4Semester2 = selectedSemesterInfo && selectedSemesterInfo.grade === 4 && selectedSemesterInfo.semester === 2;
  // 학기 토글을 숨겨야 하는 경우: 3학년 1학기, 3학년 2학기, 4학년 1학기, 4학년 2학기
  const hideSemesterToggle = isGrade3Semester1 || isGrade3Semester2 || isGrade4Semester1 || isGrade4Semester2;

  const cfg = readBatchConfig();
  const numPeriods = Number(cfg.numPeriods || 0);
  const assignments = Array.isArray(cfg.assignments) ? cfg.assignments : [];
  const periodSemester = (idx) => {
    const a = assignments[idx];
    return (a && a.semester) ? String(a.semester) : '';
  };

  const addRowBtn = document.getElementById('add-row');
  const rowsContainer = document.getElementById('max-rows');
  const rowsEmpty = document.getElementById('max-empty');
  const goMin = document.getElementById('go-min');
  const semToggle = document.getElementById('semester-toggle');
  const semToggleContainer = document.getElementById('semester-toggle-container');
  const instructionText = document.getElementById('instruction-text');
  const instructionTextGrade3 = document.getElementById('instruction-text-grade3');
  const instructionTextGrade4 = document.getElementById('instruction-text-grade4');

  // 학기 토글을 숨겨야 하는 경우 학기 토글 숨김 및 안내 문구 변경
  if (hideSemesterToggle) {
    if (semToggleContainer) {
      semToggleContainer.style.display = 'none';
    }
    if (instructionText) {
      instructionText.style.display = 'none';
    }
    if (instructionTextGrade3 && isGrade3Semester1) {
      instructionTextGrade3.style.display = 'block';
    }
    if (instructionTextGrade4 && isGrade4Semester1) {
      instructionTextGrade4.style.display = 'block';
    }
  }

  const selectedSemester = (localStorage.getItem('selectedSemesterOneA') || '1');

  // 학기 토글을 숨기는 경우(3학년 1학기, 3학년 2학기, 4학년 1학기, 4학년 2학기) 모든 기간을 표시
  // 그 외에는 선택된 학기의 기간만 표시
  const visiblePeriodIndexes = hideSemesterToggle
    ? Array.from({ length: numPeriods }, (_, i) => i)
    : Array.from({ length: numPeriods }, (_, i) => i).filter(i => periodSemester(i) === selectedSemester);

  function createTextInput(placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.className = 'row-input';
    return input;
  }

  function createDepartmentTypeSelect() {
    const select = document.createElement('select');
    select.className = 'select';
    select.style.width = '140px';
    
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '선택';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    
    const internal = document.createElement('option');
    internal.value = 'internal';
    internal.textContent = '내과';
    select.appendChild(internal);
    
    const external = document.createElement('option');
    external.value = 'external';
    external.textContent = '외과';
    select.appendChild(external);
    
    const both = document.createElement('option');
    both.value = 'both';
    both.textContent = '내과&외과';
    select.appendChild(both);
    
    return select;
  }

  function createBranchInput() {
    const input = createTextInput('분기 (예: 아동, 모성)');
    input.style.width = '150px';
    input.placeholder = '분기 (선택사항)';
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

  function createCheckbox(labelText) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '4px';
    container.style.minWidth = '90px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'duplicate-checkbox';
    checkbox.title = '중복 배치 허용: 체크 시 해당 병원에 같은 학생이 여러 번 배치될 수 있습니다';
    checkbox.style.cursor = 'pointer';
    checkbox.style.width = '16px';
    checkbox.style.height = '16px';
    
    const label = document.createElement('label');
    label.textContent = labelText || '';
    label.style.fontSize = '12px';
    label.style.color = '#666';
    label.style.cursor = 'pointer';
    label.style.userSelect = 'none';
    label.style.whiteSpace = 'nowrap';
    label.addEventListener('click', (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
    });
    
    container.appendChild(checkbox);
    container.appendChild(label);
    return { container, checkbox };
  }

  function createMaxRow(initial) {
    const row = document.createElement('div');
    row.className = 'row-grid-dynamic';

    if (isGrade3Semester1) {
      // 3학년 1학기: 체크박스, 병원명, 부서명, 내과/외과 선택
      const { container: checkboxContainer, checkbox: duplicateCheckbox } = createCheckbox('중복허용');
      duplicateCheckbox.checked = (initial && initial.allowDuplicate) || false;
      
      const hospital = createTextInput('병원명');
      const department = createTextInput('부서명');
      const deptType = createDepartmentTypeSelect();
      
      hospital.value = (initial && initial.hospital) || '';
      department.value = (initial && initial.department) || '';
      if (initial && initial.deptType) {
        deptType.value = initial.deptType;
      }

      row.appendChild(checkboxContainer);
      row.appendChild(hospital);
      row.appendChild(department);
      row.appendChild(deptType);

      const values = (initial && initial.values) || [];
      visiblePeriodIndexes.forEach(i => {
        const n = createNumberInput(`기간 ${i + 1}`, i);
        n.value = values[i] != null ? String(values[i]) : '';
        row.appendChild(n);
      })
    } else {
      // 일반 모드: 4학년 1학기일 때만 분기 필드 및 부서 필드 추가
      const subject = createTextInput('과목');
      const hospital = createTextInput('병원');
      subject.value = (initial && initial.subject) || '';
      hospital.value = (initial && initial.hospital) || '';

      row.appendChild(subject);
      
      // 4학년 1학기일 때만 분기 필드 및 부서 필드 추가 (순서: 과목, 분기, 병원, 부서)
      if (isGrade4Semester1) {
        const branch = createBranchInput();
        branch.value = (initial && initial.branch) || '';
        row.appendChild(branch);
        
        // 병원을 먼저 추가
        row.appendChild(hospital);
        
        // 부서는 병원 다음에 추가
        const department = createTextInput('부서');
        department.value = (initial && initial.department) || '';
        row.appendChild(department);
      } else {
        row.appendChild(hospital);
      }

      const values = (initial && initial.values) || [];
      visiblePeriodIndexes.forEach(i => {
        const n = createNumberInput(`기간 ${i + 1}`, i);
        n.value = values[i] != null ? String(values[i]) : '';
        row.appendChild(n);
      });
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn';
    removeBtn.textContent = '삭제';
    removeBtn.addEventListener('click', () => {
      row.remove();
      toggleEmptyState();
    });
    row.appendChild(removeBtn);

    return row;
  }

  function loadSavedData() {
    const store = readBatchConfig();
    // 3학년 1학기인 경우 max_sem1에서 데이터 로드
    const semKey = isGrade3Semester1 ? 'max_sem1' : `max_sem${selectedSemester}`;
    const savedData = store?.oneA?.[semKey] || [];
    return savedData;
  }

  function restoreRows() {
    const savedData = loadSavedData();
    rowsContainer.innerHTML = '';
    rowsEmpty.style.display = savedData.length === 0 ? 'block' : 'none';
    savedData.forEach(data => {
      rowsContainer.appendChild(createMaxRow(data));
    });
  }

  function toggleEmptyState() {
    const hasRows = rowsContainer.querySelector('.row-grid-dynamic');
    rowsEmpty.style.display = hasRows ? 'none' : 'block';
  }

  function clearErrors() {
    rowsContainer.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  function validateAndMark() {
    clearErrors();
    let ok = true;
    const rows = Array.from(rowsContainer.querySelectorAll('.row-grid-dynamic'));
    if (rows.length === 0) { ok = false; rowsEmpty.style.display = 'block'; }
    rows.forEach(row => {
      // 체크박스를 제외한 input만 선택
      const inputs = Array.from(row.querySelectorAll('input:not(.duplicate-checkbox)'));
      const selects = Array.from(row.querySelectorAll('select'));
      
      if (isGrade3Semester1) {
        // 3학년 1학기: 병원명, 부서명, 내과/외과 선택 검증
        const hospital = inputs[0];
        const department = inputs[1];
        const deptType = selects[0];
        const vals = inputs.slice(2);
        
        if (!hospital.value.trim()) { hospital.classList.add('input-error'); ok = false; }
        if (!department.value.trim()) { department.classList.add('input-error'); ok = false; }
        if (!deptType || !deptType.value) { 
          if (deptType) deptType.classList.add('input-error'); 
          ok = false; 
        }
        vals.forEach(v => {
          const raw = v.value.trim();
          const n = Number(raw);
          if (raw === '' || Number.isNaN(n) || n < 0) { v.classList.add('input-error'); ok = false; }
        });
      } else {
        // 일반 모드: 4학년 1학기일 때만 분기 필드 및 부서 필드 포함
        const subject = inputs[0];
        let hospital, vals;
        if (isGrade4Semester1) {
          // 4학년 1학기: 과목, 분기(선택사항), 병원, 부서(선택사항)
          const branch = inputs[1]; // 분기는 선택사항이므로 검증하지 않음
          hospital = inputs[2];
          const department = inputs[3]; // 부서는 선택사항이므로 검증하지 않음
          vals = inputs.slice(4);
        } else {
          // 일반 모드: 과목, 병원
          hospital = inputs[1];
          vals = inputs.slice(2);
        }
        if (!subject.value.trim()) { subject.classList.add('input-error'); ok = false; }
        if (!hospital.value.trim()) { hospital.classList.add('input-error'); ok = false; }
        vals.forEach(v => {
          const raw = v.value.trim();
          const n = Number(raw);
          if (raw === '' || Number.isNaN(n) || n < 0) { v.classList.add('input-error'); ok = false; }
        });
      }
    });
    return ok;
  }

  function collectData() {
    const rows = Array.from(rowsContainer.querySelectorAll('.row-grid-dynamic'));
    return rows.map(row => {
      const inputs = Array.from(row.querySelectorAll('input:not(.duplicate-checkbox)'));
      const selects = Array.from(row.querySelectorAll('select'));
      // 3학년 1학기일 때만 체크박스에서 allowDuplicate 읽기, 그 외에는 항상 false
      let allowDuplicate = false;
      if (isGrade3Semester1) {
        const duplicateCheckbox = row.querySelector('.duplicate-checkbox');
        allowDuplicate = duplicateCheckbox ? duplicateCheckbox.checked : false;
      }
      const values = Array.from({ length: numPeriods }, () => 0);
      
      if (isGrade3Semester1) {
        // 3학년 1학기: 병원명, 부서명, 내과/외과
        const hospital = inputs[0].value.trim();
        const department = inputs[1].value.trim();
        const deptType = selects[0] ? selects[0].value : '';
        inputs.slice(2).forEach(inp => {
          const idx = Number(inp.getAttribute('data-period-index'));
          if (!Number.isNaN(idx)) { values[idx] = Number(inp.value || '0'); }
        });
        return { hospital, department, deptType, values, allowDuplicate };
      } else {
        // 일반 모드: 4학년 1학기일 때만 분기 필드 및 부서 필드 포함
        const subject = inputs[0].value.trim();
        let hospital, valuesStartIndex;
        let branch = undefined;
        let department = undefined;
        
        if (isGrade4Semester1) {
          // 4학년 1학기: 과목, 분기(선택사항), 병원, 부서(선택사항)
          branch = inputs[1].value.trim() || undefined;
          hospital = inputs[2].value.trim();
          department = inputs[3].value.trim() || undefined;
          valuesStartIndex = 4;
        } else {
          // 일반 모드: 과목, 병원
          hospital = inputs[1].value.trim();
          valuesStartIndex = 2;
        }
        
        inputs.slice(valuesStartIndex).forEach(inp => {
          const idx = Number(inp.getAttribute('data-period-index'));
          if (!Number.isNaN(idx)) { values[idx] = Number(inp.value || '0'); }
        });
        return { subject, branch, department, hospital, values, allowDuplicate: false };
      }
    });
  }

  function persistMax(data) {
    const store = readBatchConfig();
    store.oneA = store.oneA || {};
    
    // 3학년 1학기인 경우 max_sem1에 저장하고 바로 max로 복사
    if (isGrade3Semester1) {
      store.oneA.max_sem1 = data;
      store.oneA.max = data;
    } else if (isGrade4Semester1) {
      // 4학년 1학기: 부서도 고려해서 합치지 않음 (각 행을 그대로 유지)
      store.oneA.max_sem1 = data;
      store.oneA.max = data;
    } else {
      // 일반 모드: 현재 학기 데이터 저장
      store.oneA[`max_sem${selectedSemester}`] = data;
      // 전체 데이터 병합 (다음 단계로 전달용)
      const sem1Data = store.oneA.max_sem1 || [];
      const sem2Data = store.oneA.max_sem2 || [];
      // 두 학기 데이터를 병합 (sem1 먼저, 그 다음 sem2)
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
      store.oneA.max = Array.from(allRows.values());
    }
    store.oneA.numPeriods = numPeriods;
    try { localStorage.setItem('batchConfig', JSON.stringify(store)); } catch (_) {}
  }

  // 토글 이벤트 리스너 설정 (함수 정의 후에)
  // 3학년 1학기가 아닌 경우에만 토글 이벤트 리스너 설정
  if (semToggle && !isGrade3Semester1) {
    semToggle.value = selectedSemester;
    semToggle.addEventListener('change', () => {
      // 토글 변경 전에 현재 입력된 데이터를 저장
      const currentData = collectData();
      const store = readBatchConfig();
      store.oneA = store.oneA || {};
      store.oneA[`max_sem${selectedSemester}`] = currentData;
      try { localStorage.setItem('batchConfig', JSON.stringify(store)); } catch (_) {}
      
      // 새 학기로 전환
      try { localStorage.setItem('selectedSemesterOneA', semToggle.value); } catch (_) {}
      location.reload();
    });
  }

  addRowBtn.addEventListener('click', () => {
    rowsContainer.appendChild(createMaxRow());
    toggleEmptyState();
  });

  goMin.addEventListener('click', (e) => {
    if (!validateAndMark()) { e.preventDefault(); return; }
    const data = collectData();
    persistMax(data);
    // 최소 인원은 빈 배열로 설정 (입력하지 않음)
    const store = readBatchConfig();
    store.oneA = store.oneA || {};
    if (isGrade3Semester1) {
      store.oneA.min_sem1 = [];
      store.oneA.min = [];
    } else {
      store.oneA.min_sem1 = store.oneA.min_sem1 || [];
      store.oneA.min_sem2 = store.oneA.min_sem2 || [];
      store.oneA.min = [];
    }
    try { localStorage.setItem('batchConfig', JSON.stringify(store)); } catch (_) {}
    goMin.setAttribute('href', 'page-1a-summary.html');
  });

  // 페이지 로드 시 저장된 데이터 복원
  if (numPeriods) {
    restoreRows();
  } else {
    rowsEmpty.textContent = '이전 페이지에서 기간 수를 설정하고 다시 이동해주세요.';
  }
})();


