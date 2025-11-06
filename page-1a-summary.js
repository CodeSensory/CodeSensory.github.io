(function () {
  function readStore() { try { return JSON.parse(localStorage.getItem('batchConfig') || '{}'); } catch (_) { return {}; } }
  const store = readStore();
  const numA = store.numA || 0;
  const numB = store.numB || 0;
  const numPeriods = Number(store.numPeriods || store?.oneA?.numPeriods || 0);
  const assignments = Array.isArray(store.assignments) ? store.assignments : [];
  const maxData = store?.oneA?.max || [];
  const minData = store?.oneA?.min || [];

  const basicTbody = document.getElementById('basic-tbody');
  const maxminHead = document.getElementById('maxmin-head');
  const maxminBody = document.getElementById('maxmin-body');
  const exportBtn = document.getElementById('export-config');
  const exportImageBtn = document.getElementById('export-image');
  const maxminTable = maxminBody.closest('table');

  function td(text) { const el = document.createElement('td'); el.textContent = text; return el; }
  function th(text) { const el = document.createElement('th'); el.textContent = text; return el; }

  // Basic table
  const basicRows = [
    ['A반 학생 수', String(numA)],
    ['B반 학생 수', String(numB)],
    ['기간 수', String(numPeriods)]
  ];
  basicRows.forEach(([k, v]) => {
    const tr = document.createElement('tr');
    tr.appendChild(td(k));
    tr.appendChild(td(v));
    basicTbody.appendChild(tr);
  });

  // Build lookup for assignments by period
  const periodToAssign = new Map();
  assignments.forEach(a => { if (a && a.period != null) periodToAssign.set(Number(a.period), a); });

  // Combined Max/Min table with an extra assignment header row above
  maxminHead.innerHTML = '';

  // First header row: assignment per period
  const topAssignRow = document.createElement('tr');
  topAssignRow.appendChild(th(''));
  topAssignRow.appendChild(th(''));
  topAssignRow.appendChild(th(''));
  for (let i = 1; i <= numPeriods; i++) {
    const assign = periodToAssign.get(i) || {};
    const cls = assign.class || '';
    const sem = assign.semester === '1' ? '1학기' : (assign.semester === '2' ? '2학기' : '');
    const text = cls && sem ? `${cls} (${sem})` : (cls || sem || '');
    topAssignRow.appendChild(th(text));
  }
  maxminHead.appendChild(topAssignRow);

  // Second header row: standard period columns
  const headRow = document.createElement('tr');
  headRow.appendChild(th('과목'));
  headRow.appendChild(th('병원'));
  headRow.appendChild(th('총계'));
  for (let i = 1; i <= numPeriods; i++) headRow.appendChild(th(`기간 ${i}`));
  maxminHead.appendChild(headRow);

  // Body rows
  const rowsLen = Math.max(maxData.length, minData.length);
  const periodTotalsMax = Array(numPeriods).fill(0);
  const periodTotalsMin = Array(numPeriods).fill(0);
  
  for (let r = 0; r < rowsLen; r++) {
    const maxRow = maxData[r] || {};
    const minRow = minData[r] || {};
    const tr = document.createElement('tr');
    tr.appendChild(td(maxRow.subject || minRow.subject || ''));
    tr.appendChild(td(maxRow.hospital || minRow.hospital || ''));
    
    // 총계 계산
    let rowTotalMax = 0;
    let rowTotalMin = 0;
    for (let p = 1; p <= numPeriods; p++) {
      const maxVal = Array.isArray(maxRow.values) ? (maxRow.values[p - 1] || 0) : 0;
      const minVal = Array.isArray(minRow.values) ? (minRow.values[p - 1] || 0) : 0;
      rowTotalMax += maxVal;
      rowTotalMin += minVal;
    }
    tr.appendChild(td(`${rowTotalMax} / ${rowTotalMin}`));
    
    // 기간별 값 표시 및 합계 계산
    for (let p = 1; p <= numPeriods; p++) {
      const maxVal = Array.isArray(maxRow.values) ? maxRow.values[p - 1] : undefined;
      const minVal = Array.isArray(minRow.values) ? minRow.values[p - 1] : undefined;
      const text = `${maxVal ?? ''} / ${minVal ?? ''}`;
      tr.appendChild(td(text));
      
      // 기간별 합계 계산
      if (maxVal != null) periodTotalsMax[p - 1] += maxVal;
      if (minVal != null) periodTotalsMin[p - 1] += minVal;
    }
    maxminBody.appendChild(tr);
  }
  
  // 합계 행 추가
  const totalRow = document.createElement('tr');
  totalRow.style.fontWeight = 'bold';
  totalRow.style.backgroundColor = '#f5f5f5';
  const grandTotalMax = periodTotalsMax.reduce((a, b) => a + b, 0);
  const grandTotalMin = periodTotalsMin.reduce((a, b) => a + b, 0);
  totalRow.appendChild(td('합계'));
  totalRow.appendChild(td(''));
  totalRow.appendChild(td(`${grandTotalMax} / ${grandTotalMin}`));
  for (let p = 0; p < numPeriods; p++) {
    totalRow.appendChild(td(`${periodTotalsMax[p]} / ${periodTotalsMin[p]}`));
  }
  maxminBody.appendChild(totalRow);

  // Download web_config.json for manual notebook run
  function downloadJSON(filename, dataObj) {
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const payload = {
        numA: Number(numA || 0),
        numB: Number(numB || 0),
        numPeriods: Number(numPeriods || 0),
        assignments: assignments,
        oneA: { max: maxData, min: minData }
      };
      downloadJSON('web_config.json', payload);
    });
  }

  // 이미지 저장 기능
  async function downloadTableAsImage() {
    // html2canvas가 로드되었는지 확인
    const html2canvasFn = window.html2canvas;
    if (!html2canvasFn) {
      alert('이미지 저장 기능을 사용할 수 없습니다. html2canvas 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    if (!maxminTable) {
      alert('테이블을 찾을 수 없습니다.');
      return;
    }

    try {
      exportImageBtn.disabled = true;
      exportImageBtn.textContent = '생성 중...';

      // 테이블을 포함한 전체 패널 가져오기
      const panel = maxminTable.closest('.panel');
      const tableWrap = maxminTable.closest('.table-wrap');
      
      // 원래 패널의 스타일 저장
      const originalPanelStyle = {
        overflow: panel.style.overflow || '',
        height: panel.style.height || '',
        maxHeight: panel.style.maxHeight || ''
      };
      
      const originalTableWrapStyle = tableWrap ? {
        overflow: tableWrap.style.overflow || '',
        height: tableWrap.style.height || '',
        maxHeight: tableWrap.style.maxHeight || '',
        scrollTop: tableWrap.scrollTop,
        scrollLeft: tableWrap.scrollLeft
      } : null;
      
      // 패널과 테이블 래퍼의 스타일을 임시로 변경하여 전체 내용이 보이도록
      // !important를 사용하여 CSS 규칙을 우회
      panel.style.setProperty('overflow', 'visible', 'important');
      panel.style.setProperty('height', 'auto', 'important');
      panel.style.setProperty('max-height', 'none', 'important');
      panel.style.setProperty('display', 'block', 'important');
      
      if (tableWrap) {
        tableWrap.style.setProperty('overflow', 'visible', 'important');
        tableWrap.style.setProperty('height', 'auto', 'important');
        tableWrap.style.setProperty('max-height', 'none', 'important');
        tableWrap.style.setProperty('display', 'block', 'important');
        tableWrap.scrollTop = 0;
        tableWrap.scrollLeft = 0;
      }
      
      // 레이아웃 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 패널의 실제 높이와 너비 계산
      const panelHeight = panel.scrollHeight;
      const panelWidth = panel.scrollWidth;
      
      // onclone 콜백에서 복제된 DOM의 스타일을 확실하게 조정
      const canvas = await window.html2canvas(panel, {
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도를 위해 2배 확대
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: panelWidth,
        height: panelHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // 복제된 문서에서 패널과 테이블 래퍼 찾기
          const clonedPanel = clonedDoc.querySelector('.panel');
          if (clonedPanel) {
            clonedPanel.style.setProperty('overflow', 'visible', 'important');
            clonedPanel.style.setProperty('height', 'auto', 'important');
            clonedPanel.style.setProperty('max-height', 'none', 'important');
            clonedPanel.style.setProperty('position', 'relative', 'important');
            clonedPanel.style.setProperty('display', 'block', 'important');
            
            const clonedTableWrap = clonedPanel.querySelector('.table-wrap');
            if (clonedTableWrap) {
              clonedTableWrap.style.setProperty('overflow', 'visible', 'important');
              clonedTableWrap.style.setProperty('height', 'auto', 'important');
              clonedTableWrap.style.setProperty('max-height', 'none', 'important');
              clonedTableWrap.style.setProperty('display', 'block', 'important');
            }
            
            // 테이블 자체도 확인
            const clonedTable = clonedPanel.querySelector('.table');
            if (clonedTable) {
              clonedTable.style.setProperty('display', 'table', 'important');
            }
          }
        }
      });
      
      // 원래 스타일 복원
      panel.style.removeProperty('overflow');
      panel.style.removeProperty('height');
      panel.style.removeProperty('max-height');
      panel.style.removeProperty('display');
      if (originalPanelStyle.overflow) panel.style.overflow = originalPanelStyle.overflow;
      if (originalPanelStyle.height) panel.style.height = originalPanelStyle.height;
      if (originalPanelStyle.maxHeight) panel.style.maxHeight = originalPanelStyle.maxHeight;
      
      if (tableWrap && originalTableWrapStyle) {
        tableWrap.style.removeProperty('overflow');
        tableWrap.style.removeProperty('height');
        tableWrap.style.removeProperty('max-height');
        tableWrap.style.removeProperty('display');
        if (originalTableWrapStyle.overflow) tableWrap.style.overflow = originalTableWrapStyle.overflow;
        if (originalTableWrapStyle.height) tableWrap.style.height = originalTableWrapStyle.height;
        if (originalTableWrapStyle.maxHeight) tableWrap.style.maxHeight = originalTableWrapStyle.maxHeight;
        tableWrap.scrollTop = originalTableWrapStyle.scrollTop;
        tableWrap.scrollLeft = originalTableWrapStyle.scrollLeft;
      }

      // Canvas를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `최대최소인원표_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      alert('이미지 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      exportImageBtn.disabled = false;
      exportImageBtn.textContent = '최대/최소 인원 표 이미지 저장';
    }
  }

  if (exportImageBtn) {
    exportImageBtn.addEventListener('click', downloadTableAsImage);
  }
})();
