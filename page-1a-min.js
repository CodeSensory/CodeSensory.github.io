(function () {
  function readStore() { try { return JSON.parse(localStorage.getItem('batchConfig') || '{}'); } catch (_) { return {}; } }

  const store = readStore();
  const maxData = store?.oneA?.max || [];
  const numPeriods = Number(store?.oneA?.numPeriods || store?.numPeriods || 0);

  const rowsContainer = document.getElementById('min-rows');
  const rowsEmpty = document.getElementById('min-empty');
  const goSummary = document.getElementById('go-summary');
  const semToggle = document.getElementById('semester-toggle');

  const assignments = Array.isArray(store?.assignments) ? store.assignments : [];
  const periodSemester = (idx) => {
    const a = assignments[idx];
    return (a && a.semester) ? String(a.semester) : '';
  };
  const selectedSemester = (localStorage.getItem('selectedSemesterOneA') || '1');
  const visiblePeriodIndexes = Array.from({ length: numPeriods }, (_, i) => i).filter(i => periodSemester(i) === selectedSemester);

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
    row.appendChild(createReadonlyInput(maxRow.subject));
    row.appendChild(createReadonlyInput(maxRow.hospital));
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
    const savedData = s?.oneA?.[`min_sem${selectedSemester}`] || [];
    return savedData;
  }
  
  function render() {
    rowsContainer.innerHTML = '';
    if (!numPeriods || maxData.length === 0) { rowsEmpty.style.display = 'block'; return; }
    rowsEmpty.style.display = 'none';
    
    const savedMinData = loadSavedMinData();
    const savedMinMap = new Map();
    savedMinData.forEach(row => {
      const key = `${row.subject}|${row.hospital}`;
      savedMinMap.set(key, row);
    });
    
    maxData.forEach(m => {
      const key = `${m.subject}|${m.hospital}`;
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
      const subject = inputs[0].value;
      const hospital = inputs[1].value;
      const mins = Array.from({ length: numPeriods }, () => 0);
      inputs.slice(2).forEach((i) => {
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
      result.push({ subject, hospital, values: mins });
    });
    return { data: result, ok };
  }
  function persistMin(minData) {
    const s = readStore();
    s.oneA = s.oneA || {};
    // 현재 학기 데이터 저장
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
    s.oneA.numPeriods = numPeriods;
    try { localStorage.setItem('batchConfig', JSON.stringify(s)); } catch (_) {}
  }

  // 토글 이벤트 리스너 설정 (함수 정의 후에)
  if (semToggle) {
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


