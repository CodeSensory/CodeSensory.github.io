(function () {
  function readBatchConfig() {
    try { return JSON.parse(localStorage.getItem('batchConfig') || '{}'); } catch (_) { return {}; }
  }

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

  const selectedSemester = (localStorage.getItem('selectedSemesterOneA') || '1');

  const visiblePeriodIndexes = Array.from({ length: numPeriods }, (_, i) => i).filter(i => periodSemester(i) === selectedSemester);

  function createTextInput(placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.className = 'row-input';
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

  function createMaxRow(initial) {
    const row = document.createElement('div');
    row.className = 'row-grid-dynamic';

    const subject = createTextInput('과목');
    const hospital = createTextInput('병원');
    subject.value = (initial && initial.subject) || '';
    hospital.value = (initial && initial.hospital) || '';

    row.appendChild(subject);
    row.appendChild(hospital);

    const values = (initial && initial.values) || [];
    visiblePeriodIndexes.forEach(i => {
      const n = createNumberInput(`기간 ${i + 1}`, i);
      n.value = values[i] != null ? String(values[i]) : '';
      row.appendChild(n);
    });

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
    const savedData = store?.oneA?.[`max_sem${selectedSemester}`] || [];
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
      const inputs = Array.from(row.querySelectorAll('input'));
      const subject = inputs[0];
      const hospital = inputs[1];
      const vals = inputs.slice(2);
      if (!subject.value.trim()) { subject.classList.add('input-error'); ok = false; }
      if (!hospital.value.trim()) { hospital.classList.add('input-error'); ok = false; }
      vals.forEach(v => {
        const raw = v.value.trim();
        const n = Number(raw);
        if (raw === '' || Number.isNaN(n) || n < 0) { v.classList.add('input-error'); ok = false; }
      });
    });
    return ok;
  }

  function collectData() {
    const rows = Array.from(rowsContainer.querySelectorAll('.row-grid-dynamic'));
    return rows.map(row => {
      const inputs = Array.from(row.querySelectorAll('input'));
      const subject = inputs[0].value.trim();
      const hospital = inputs[1].value.trim();
      const values = Array.from({ length: numPeriods }, () => 0);
      inputs.slice(2).forEach(inp => {
        const idx = Number(inp.getAttribute('data-period-index'));
        if (!Number.isNaN(idx)) { values[idx] = Number(inp.value || '0'); }
      });
      return { subject, hospital, values };
    });
  }

  function persistMax(data) {
    const store = readBatchConfig();
    store.oneA = store.oneA || {};
    // 현재 학기 데이터 저장
    store.oneA[`max_sem${selectedSemester}`] = data;
    // 전체 데이터 병합 (다음 단계로 전달용)
    const allMaxData = [];
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
    store.oneA.numPeriods = numPeriods;
    try { localStorage.setItem('batchConfig', JSON.stringify(store)); } catch (_) {}
  }

  // 토글 이벤트 리스너 설정 (함수 정의 후에)
  if (semToggle) {
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
    goMin.setAttribute('href', 'page-1a-min.html');
  });

  // 페이지 로드 시 저장된 데이터 복원
  if (numPeriods) {
    restoreRows();
  } else {
    rowsEmpty.textContent = '이전 페이지에서 기간 수를 설정하고 다시 이동해주세요.';
  }
})();


