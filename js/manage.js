let allRows = [];
let currentLowLevel = 'l1';
let currentMidLevel = 'l1';

document.addEventListener('DOMContentLoaded', () => {
  // 초기 빈 테이블 렌더링
  renderLowAchievementTable([]);
  renderMidAchievementTable([]);
  
  // 레벨 선택 변경 이벤트
  document.getElementById('low-level-select').addEventListener('change', (e) => {
    currentLowLevel = e.target.value;
    const filtered = filterLowAchievement(allRows);
    renderLowAchievementTable(filtered);
  });
  
  document.getElementById('mid-level-select').addEventListener('change', (e) => {
    currentMidLevel = e.target.value;
    const filtered = filterMidAchievement(allRows);
    renderMidAchievementTable(filtered);
  });
  
  // 데이터 로드
  fetchAllRows();
});

function renderLowAchievementTable(rows) {
  const thead = document.querySelector('#low-achievement-table thead');
  const tbody = document.querySelector('#low-achievement-table tbody');
  const statusEl = document.getElementById('low-status');
  
  if (!thead || !tbody || !statusEl) {
    console.error('테이블 요소를 찾을 수 없습니다.');
    return;
  }
  
  // 헤더 렌더링 (항상 표시)
  thead.innerHTML = `
    <tr>
      <th>학번</th>
      ${SUBJECTS.map((key, index) => `<th>${getSubjectName(index + 1)}</th>`).join('')}
    </tr>
  `;
  
  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="19" style="text-align: center; padding: 20px; color: var(--text-muted);">달성도 '하'가 있는 학생이 없습니다. (레벨: ${currentLowLevel})</td></tr>`;
    statusEl.textContent = '0건';
    return;
  }
  
  // 바디 렌더링 (현재 레벨 기준)
  tbody.innerHTML = rows.map((row) => {
    if (!row || !row.rawData) {
      console.warn('row 또는 rawData가 없습니다:', row);
      return '';
    }
    
    const achievementCells = SUBJECTS.map((key, index) => {
      const achievementKey = getAchievementKey(currentLowLevel, index);
      const achievement = row.rawData[achievementKey] || '-';
      // '하'가 있는 경우 연한 주황색 배경 적용
      const cellClass = achievement === '하' ? 'low-achievement-cell' : '';
      return `<td class="${cellClass}">${achievement}</td>`;
    }).join('');
    
    return `
      <tr>
        <td>${row.student_id || '-'}</td>
        ${achievementCells}
      </tr>
    `;
  }).join('');
  
  statusEl.textContent = `${rows.length}건 (레벨: ${currentLowLevel})`;
}

function renderMidAchievementTable(rows) {
  const thead = document.querySelector('#mid-achievement-table thead');
  const tbody = document.querySelector('#mid-achievement-table tbody');
  const statusEl = document.getElementById('mid-status');
  
  if (!thead || !tbody || !statusEl) {
    console.error('테이블 요소를 찾을 수 없습니다.');
    return;
  }
  
  // 헤더 렌더링 (항상 표시)
  thead.innerHTML = `
    <tr>
      <th>학번</th>
      ${SUBJECTS.map((key, index) => `<th>${getSubjectName(index + 1)}</th>`).join('')}
    </tr>
  `;
  
  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="19" style="text-align: center; padding: 20px; color: var(--text-muted);">달성도 '중'이 있는 학생이 없습니다. (레벨: ${currentMidLevel})</td></tr>`;
    statusEl.textContent = '0건';
    return;
  }
  
  // 바디 렌더링 (현재 레벨 기준)
  tbody.innerHTML = rows.map((row) => {
    if (!row || !row.rawData) {
      console.warn('row 또는 rawData가 없습니다:', row);
      return '';
    }
    
    const achievementCells = SUBJECTS.map((key, index) => {
      const achievementKey = getAchievementKey(currentMidLevel, index);
      const achievement = row.rawData[achievementKey] || '-';
      // '중' 또는 '하'가 있는 경우 연한 주황색 배경 적용
      const cellClass = (achievement === '중' || achievement === '하') ? 'low-achievement-cell' : '';
      return `<td class="${cellClass}">${achievement}</td>`;
    }).join('');
    
    return `
      <tr>
        <td>${row.student_id || '-'}</td>
        ${achievementCells}
      </tr>
    `;
  }).join('');
  
  statusEl.textContent = `${rows.length}건 (레벨: ${currentMidLevel})`;
}

function filterLowAchievement(rows) {
  return rows.filter((row) => {
    // 현재 레벨의 달성도에 '하'가 하나라도 있는지 확인
    return SUBJECTS.some((key, index) => {
      const achievementKey = getAchievementKey(currentLowLevel, index);
      return row.rawData[achievementKey] === '하';
    });
  });
}

function filterMidAchievement(rows) {
  return rows.filter((row) => {
    // 현재 레벨의 달성도에 '중' 또는 '하'가 하나라도 있는지 확인
    return SUBJECTS.some((key, index) => {
      const achievementKey = getAchievementKey(currentMidLevel, index);
      const achievement = row.rawData[achievementKey];
      return achievement === '중' || achievement === '하';
    });
  });
}

async function fetchAllRows() {
  const lowStatusEl = document.getElementById('low-status');
  const midStatusEl = document.getElementById('mid-status');
  
  if (!lowStatusEl || !midStatusEl) {
    console.error('상태 요소를 찾을 수 없습니다.');
    return;
  }
  
  lowStatusEl.textContent = '불러오는 중...';
  midStatusEl.textContent = '불러오는 중...';
  
  try {
    console.log('데이터를 불러오는 중...');
    const { data, error } = await supabase
      .from('student_grades')
      .select('*')
      .order('student_id', { ascending: true });

    if (error) {
      console.error('Supabase 오류:', error);
      throw error;
    }

    console.log(`총 ${data ? data.length : 0}건의 데이터를 불러왔습니다.`);

    if (!data || data.length === 0) {
      console.log('데이터가 없습니다.');
      renderLowAchievementTable([]);
      renderMidAchievementTable([]);
      lowStatusEl.textContent = '0건 (데이터 없음)';
      midStatusEl.textContent = '0건 (데이터 없음)';
      return;
    }

    allRows = data.map((row) => {
      // 원본 데이터만 보관 (레벨별 정규화는 필요 없음)
      return {
        id: row.id,
        student_id: row.student_id,
        rawData: row, // 원본 데이터 보관 (모든 레벨의 달성도 포함)
      };
    });
    
    console.log(`정규화된 데이터: ${allRows.length}건`);
    
    // 달성도 '하'가 있는 학생 필터링 (현재 레벨 기준)
    const lowAchievementRows = filterLowAchievement(allRows);
    console.log(`달성도 '하'가 있는 학생: ${lowAchievementRows.length}건 (레벨: ${currentLowLevel})`);
    renderLowAchievementTable(lowAchievementRows);
    
    // 달성도 '중'이 있는 학생 필터링 (현재 레벨 기준)
    const midAchievementRows = filterMidAchievement(allRows);
    console.log(`달성도 '중'이 있는 학생: ${midAchievementRows.length}건 (레벨: ${currentMidLevel})`);
    renderMidAchievementTable(midAchievementRows);
    
  } catch (err) {
    console.error('fetchAllRows 오류:', err);
    if (lowStatusEl) lowStatusEl.textContent = `오류: ${err.message}`;
    if (midStatusEl) midStatusEl.textContent = `오류: ${err.message}`;
    
    // 오류 발생 시에도 빈 테이블은 표시
    renderLowAchievementTable([]);
    renderMidAchievementTable([]);
  }
}
