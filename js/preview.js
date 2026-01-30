let previewData = [];
let existingStudentIds = new Set();
let selectedRowIndex = null;
let displayedSubjectKeys = []; // 현재 테이블에 표시된 과목 키들
let savedLevel = 'l1'; // 엑셀 업로드 시 선택된 레벨
let criteriaData = {}; // 각 과목별 기준점 저장 { subject_1: { high: 80, mid: 60 }, ... }

document.addEventListener('DOMContentLoaded', async () => {
  // localStorage에서 데이터 가져오기
  const savedData = localStorage.getItem('excelPreviewData');
  if (!savedData) {
    alert('미리보기 데이터가 없습니다. 입력 페이지로 돌아갑니다.');
    window.location.href = 'input.html';
    return;
  }

  previewData = JSON.parse(savedData);
  
  // 레벨 정보 가져오기
  savedLevel = localStorage.getItem('excelPreviewLevel') || 'l1';
  
  // DB에서 기존 학번 목록 가져오기
  await loadExistingStudentIds();
  
  // 수정 폼 초기화
  initEditForm();
  
  // 기준점 테이블 렌더링
  renderCriteriaTable();
  
  // 테이블 렌더링
  renderPreviewTable();
  
  // 이벤트 리스너
  document.getElementById('back-btn').addEventListener('click', () => {
    localStorage.removeItem('excelPreviewData');
    localStorage.removeItem('excelPreviewLevel');
    window.location.href = 'input.html';
  });
  
  document.getElementById('apply-criteria-btn').addEventListener('click', applyCriteriaAndCalculate);
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('edit-preview-form').addEventListener('submit', handleEditSave);
  document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
});

function initEditForm() {
  // 폼 초기화는 editRow에서 동적으로 처리
}

// 기준점 테이블 렌더링
function renderCriteriaTable() {
  // 졸업연도만 업데이트하는 경우는 건너뛰기
  if (savedLevel === 'graduate_year') {
    return;
  }
  
  // 입력된 과목만 표시하기 위해 먼저 previewData에서 과목 확인
  const allSubjectKeys = new Set();
  previewData.forEach(row => {
    SUBJECTS.forEach((key, index) => {
      const levelSubjectKey = getSubjectKey(savedLevel, index);
      const hasScore = row[levelSubjectKey] !== undefined && row[levelSubjectKey] !== null && row[levelSubjectKey] !== '';
      if (hasScore) {
        allSubjectKeys.add(key);
      }
    });
  });
  
  const sortedSubjectKeys = Array.from(allSubjectKeys).sort((a, b) => {
    const numA = parseInt(a.replace('subject_', ''));
    const numB = parseInt(b.replace('subject_', ''));
    return numA - numB;
  });
  
  const tbody = document.getElementById('criteria-tbody');
  if (!tbody) return;
  
  if (sortedSubjectKeys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">입력된 과목이 없습니다.</td></tr>';
    return;
  }
  
  tbody.innerHTML = sortedSubjectKeys.map((key) => {
    const num = parseInt(key.replace('subject_', ''));
    const subjectName = getSubjectName(num);
    const criteria = criteriaData[key] || { high: '', mid: '' };
    
    return `
      <tr>
        <td style="font-weight: 600;">${subjectName}</td>
        <td>
          <input 
            type="number" 
            min="0" 
            max="100" 
            step="0.1" 
            id="criteria-high-${key}" 
            value="${criteria.high || ''}" 
            placeholder="예: 80"
            style="width: 100px; padding: 4px;"
          />
        </td>
        <td>
          <input 
            type="number" 
            min="0" 
            max="100" 
            step="0.1" 
            id="criteria-mid-${key}" 
            value="${criteria.mid || ''}" 
            placeholder="예: 60"
            style="width: 100px; padding: 4px;"
          />
        </td>
        <td>
          <button 
            type="button" 
            class="secondary" 
            onclick="applySingleCriteria('${key}')"
            style="padding: 4px 8px; font-size: 12px;"
          >
            적용
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 단일 과목 기준점 적용
window.applySingleCriteria = function(subjectKey) {
  const highInput = document.getElementById(`criteria-high-${subjectKey}`);
  const midInput = document.getElementById(`criteria-mid-${subjectKey}`);
  
  const high = parseFloat(highInput.value);
  const mid = parseFloat(midInput.value);
  
  if (isNaN(high) || isNaN(mid)) {
    alert('기준점을 모두 입력해주세요.');
    return;
  }
  
  if (high <= mid) {
    alert('상/중 기준점은 중/하 기준점보다 커야 합니다.');
    return;
  }
  
  criteriaData[subjectKey] = { high, mid };
  calculateAchievementForSubject(subjectKey);
  renderPreviewTable();
  
  const statusEl = document.getElementById('criteria-status');
  const num = parseInt(subjectKey.replace('subject_', ''));
  const subjectName = getSubjectName(num);
  statusEl.textContent = `${subjectName} 기준점 적용 완료 (상/중: ${high}점, 중/하: ${mid}점)`;
  statusEl.style.color = '';
};

// 모든 기준점 적용 및 달성도 계산
function applyCriteriaAndCalculate() {
  const allSubjectKeys = new Set();
  previewData.forEach(row => {
    SUBJECTS.forEach((key, index) => {
      const levelSubjectKey = getSubjectKey(savedLevel, index);
      const hasScore = row[levelSubjectKey] !== undefined && row[levelSubjectKey] !== null && row[levelSubjectKey] !== '';
      if (hasScore) {
        allSubjectKeys.add(key);
      }
    });
  });
  
  const sortedSubjectKeys = Array.from(allSubjectKeys).sort((a, b) => {
    const numA = parseInt(a.replace('subject_', ''));
    const numB = parseInt(b.replace('subject_', ''));
    return numA - numB;
  });
  
  let allValid = true;
  const missingSubjects = [];
  
  sortedSubjectKeys.forEach(key => {
    const highInput = document.getElementById(`criteria-high-${key}`);
    const midInput = document.getElementById(`criteria-mid-${key}`);
    
    const high = parseFloat(highInput?.value);
    const mid = parseFloat(midInput?.value);
    
    if (isNaN(high) || isNaN(mid)) {
      allValid = false;
      const num = parseInt(key.replace('subject_', ''));
      missingSubjects.push(getSubjectName(num));
      return;
    }
    
    if (high <= mid) {
      allValid = false;
      const num = parseInt(key.replace('subject_', ''));
      alert(`${getSubjectName(num)}: 상/중 기준점은 중/하 기준점보다 커야 합니다.`);
      return;
    }
    
    criteriaData[key] = { high, mid };
  });
  
  if (!allValid) {
    const statusEl = document.getElementById('criteria-status');
    statusEl.textContent = `다음 과목의 기준점을 입력해주세요: ${missingSubjects.join(', ')}`;
    statusEl.style.color = 'var(--text-muted)';
    return;
  }
  
  // 모든 과목에 대해 달성도 계산
  sortedSubjectKeys.forEach(key => {
    calculateAchievementForSubject(key);
  });
  
  renderPreviewTable();
  
  const statusEl = document.getElementById('criteria-status');
  statusEl.textContent = `모든 기준점 적용 완료! 총 ${sortedSubjectKeys.length}개 과목의 달성도가 계산되었습니다.`;
  statusEl.style.color = '';
}

// 특정 과목의 달성도 계산
function calculateAchievementForSubject(subjectKey) {
  const criteria = criteriaData[subjectKey];
  if (!criteria) return;
  
  const subjectIndex = SUBJECTS.indexOf(subjectKey);
  const levelSubjectKey = getSubjectKey(savedLevel, subjectIndex);
  const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
  
  previewData.forEach(row => {
    const score = parseFloat(row[levelSubjectKey]);
    if (isNaN(score)) return;
    
    let achievement = null;
    if (score >= criteria.high) {
      achievement = '상';
    } else if (score >= criteria.mid) {
      achievement = '중';
    } else {
      achievement = '하';
    }
    
    row[levelAchievementKey] = achievement;
  });
}

async function loadExistingStudentIds() {
  try {
    const { data, error } = await supabase
      .from('student_grades')
      .select('student_id');
    
    if (error) throw error;
    
    // 학번을 정규화하여 저장 (문자열로 변환하고 공백 제거)
    existingStudentIds = new Set(data.map(row => String(row.student_id || '').trim()).filter(id => id));
  } catch (err) {
    console.error('기존 학번 로드 실패:', err);
  }
}

function renderPreviewTable() {
  if (!previewData.length) {
    document.getElementById('preview-table').innerHTML = '<tr><td colspan="100">데이터가 없습니다.</td></tr>';
    return;
  }

  // 졸업연도만 업데이트하는 경우
  if (savedLevel === 'graduate_year') {
    const thead = document.querySelector('#preview-table thead');
    thead.innerHTML = `
      <tr>
        <th style="width: 80px;">수정</th>
        <th>학번</th>
        <th>졸업연도</th>
      </tr>
    `;
    
    const tbody = document.querySelector('#preview-table tbody');
    tbody.innerHTML = previewData.map((row, index) => {
      const studentId = (row.student_id || row.studentId || '').toString().trim();
      const isExisting = existingStudentIds.has(studentId);
      const rowClass = isExisting ? 'existing-student' : 'new-student';
      const graduateYear = row.graduate_year !== null && row.graduate_year !== undefined ? row.graduate_year : '-';
      
      return `
        <tr class="${rowClass}" data-row-index="${index}">
          <td>
            <button class="secondary" type="button" onclick="editRow(${index})" style="padding: 4px 8px; font-size: 12px;">수정</button>
          </td>
          <td>${studentId}</td>
          <td>${graduateYear}</td>
        </tr>
      `;
    }).join('');
    
    // 상태 업데이트
    const existingCount = previewData.filter(row => {
      const studentId = (row.student_id || row.studentId || '').toString().trim();
      return existingStudentIds.has(studentId);
    }).length;
    
    const newCount = previewData.length - existingCount;
    let statusText = `총 ${previewData.length}건 (기존: ${existingCount}건, 신규: ${newCount}건)`;
    document.getElementById('preview-status').textContent = statusText;
    
    // 기준점 설정 섹션 숨기기
    const criteriaPanel = document.getElementById('criteria-panel');
    if (criteriaPanel) {
      criteriaPanel.style.display = 'none';
    }
    
    return;
  }

  // 기준점 설정 섹션 표시
  const criteriaPanel = document.getElementById('criteria-panel');
  if (criteriaPanel) {
    criteriaPanel.style.display = 'block';
  }

  // 모든 행에서 입력된 과목 키 수집 (점수 또는 달성도가 있는 과목만) - 레벨별로
  const allSubjectKeys = new Set();
  previewData.forEach(row => {
    SUBJECTS.forEach((key, index) => {
      const levelSubjectKey = getSubjectKey(savedLevel, index);
      const levelAchievementKey = getAchievementKey(savedLevel, index);
      
      // 점수가 있거나 달성도가 있으면 포함
      const hasScore = row[levelSubjectKey] !== undefined && row[levelSubjectKey] !== null && row[levelSubjectKey] !== '';
      const hasAchievement = row[levelAchievementKey] !== undefined && row[levelAchievementKey] !== null && row[levelAchievementKey] !== '';
      
      if (hasScore || hasAchievement) {
        allSubjectKeys.add(key);
      }
    });
  });
  
  const sortedSubjectKeys = Array.from(allSubjectKeys).sort((a, b) => {
    const numA = parseInt(a.replace('subject_', ''));
    const numB = parseInt(b.replace('subject_', ''));
    return numA - numB;
  });
  
  // 현재 표시된 과목 키 저장 (수정 폼에서 사용)
  displayedSubjectKeys = sortedSubjectKeys;

  // 헤더 렌더링 - 입력된 과목만 표시
  const thead = document.querySelector('#preview-table thead');
  thead.innerHTML = `
    <tr>
      <th style="width: 80px;">수정</th>
      <th>학번</th>
      ${sortedSubjectKeys.map(key => {
        const num = parseInt(key.replace('subject_', ''));
        const subjectName = getSubjectName(num);
        return `<th>${subjectName}</th><th>${subjectName} 달성도</th>`;
      }).join('')}
    </tr>
  `;

  // 중복 학번 찾기 (previewData 내에서)
  const studentIdCounts = new Map();
  previewData.forEach(row => {
    const studentId = (row.student_id || row.studentId || '').toString().trim();
    if (studentId) {
      studentIdCounts.set(studentId, (studentIdCounts.get(studentId) || 0) + 1);
    }
  });
  
  // 디버깅: 중복 학번 확인
  const duplicateIds = Array.from(studentIdCounts.entries())
    .filter(([id, count]) => count > 1)
    .map(([id]) => id);
  if (duplicateIds.length > 0) {
    console.log('중복 학번 발견:', duplicateIds);
  }
  
  // 바디 렌더링
  const tbody = document.querySelector('#preview-table tbody');
  tbody.innerHTML = previewData.map((row, index) => {
    const studentId = (row.student_id || row.studentId || '').toString().trim();
    const isExisting = existingStudentIds.has(studentId);
    const count = studentIdCounts.get(studentId) || 0;
    const isDuplicate = count > 1; // previewData 내에서 중복
    const rowClass = (isExisting || isDuplicate) ? 'existing-student' : 'new-student';
    
    // 디버깅: 각 행의 상태 확인
    if (isDuplicate) {
      console.log(`학번 ${studentId}는 중복입니다 (${count}회)`);
    }
    
    const subjectCells = sortedSubjectKeys.map((key, idx) => {
      const subjectIndex = SUBJECTS.indexOf(key);
      const levelSubjectKey = getSubjectKey(savedLevel, subjectIndex);
      const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
      
      // 점수 값 찾기 (점수만 추출하여 표시)
      const scoreValue = row[levelSubjectKey];
      let displayScore = '-';
      if (scoreValue !== undefined && scoreValue !== null && scoreValue !== '') {
        const strValue = String(scoreValue);
        // "점수(연도, 과목명)" 형식에서 점수만 추출 (소수점 포함)
        // \d+(?:\.\d+)? 는 정수 또는 소수점을 포함한 숫자를 매칭
        const match = strValue.match(/^(\d+(?:\.\d+)?)(?:\([^)]*\))?$/);
        displayScore = match ? match[1] : strValue;
      }
      
      // 달성도 값 찾기
      const achievementValue = row[levelAchievementKey] || '';
      const displayAchievement = achievementValue || '-';
      
      return `<td>${displayScore}</td><td>${displayAchievement}</td>`;
    }).join('');
    
    return `
      <tr class="${rowClass}" data-row-index="${index}">
        <td>
          <button class="secondary" type="button" onclick="editRow(${index})" style="padding: 4px 8px; font-size: 12px;">수정</button>
        </td>
        <td>${studentId}</td>
        ${subjectCells}
      </tr>
    `;
  }).join('');
  
  // 상태 업데이트
  const existingCount = previewData.filter(row => {
    const studentId = (row.student_id || row.studentId || '').toString().trim();
    return existingStudentIds.has(studentId);
  }).length;
  
  const newCount = previewData.length - existingCount;
  const duplicateRowsCount = previewData.filter(row => {
    const studentId = (row.student_id || row.studentId || '').toString().trim();
    return (studentIdCounts.get(studentId) || 0) > 1;
  }).length;
  
  let statusText = `총 ${previewData.length}건 (기존: ${existingCount}건, 신규: ${newCount}건)`;
  if (duplicateIds.length > 0) {
    statusText += ` | ⚠️ 중복 학번: ${duplicateIds.length}개 (${duplicateRowsCount}건)`;
  }
  document.getElementById('preview-status').textContent = statusText;
}

// 최종 저장 정보 미리보기
function showFinalPreview() {
  // 졸업연도만 업데이트하는 경우는 바로 저장
  if (savedLevel === 'graduate_year') {
    performSave();
    return;
  }
  
  // 최종 저장될 정보를 보여주는 모달 또는 섹션 생성
  const finalPreviewSection = document.createElement('section');
  finalPreviewSection.className = 'panel';
  finalPreviewSection.id = 'final-preview-section';
  finalPreviewSection.style.marginTop = '16px';
  finalPreviewSection.innerHTML = `
    <h2 style="margin-top: 0;">최종 저장 정보 미리보기</h2>
    <div class="table-container" style="max-height: 50vh; overflow-y: auto;">
      <table id="final-preview-table">
        <thead></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="toolbar" style="margin-top: 16px;">
      <button class="secondary" id="close-final-preview-btn" type="button">닫기</button>
      <button class="primary" id="confirm-save-btn" type="button">확인하고 저장</button>
    </div>
  `;
  
  // 기존 섹션 뒤에 추가
  const main = document.querySelector('main.content-grid');
  const existingFinalPreview = document.getElementById('final-preview-section');
  if (existingFinalPreview) {
    existingFinalPreview.remove();
  }
  main.appendChild(finalPreviewSection);
  
  // 최종 미리보기 테이블 렌더링
  const allSubjectKeys = new Set();
  previewData.forEach(row => {
    SUBJECTS.forEach((key, index) => {
      const levelSubjectKey = getSubjectKey(savedLevel, index);
      const hasScore = row[levelSubjectKey] !== undefined && row[levelSubjectKey] !== null && row[levelSubjectKey] !== '';
      if (hasScore) {
        allSubjectKeys.add(key);
      }
    });
  });
  
  const sortedSubjectKeys = Array.from(allSubjectKeys).sort((a, b) => {
    const numA = parseInt(a.replace('subject_', ''));
    const numB = parseInt(b.replace('subject_', ''));
    return numA - numB;
  });
  
  const thead = finalPreviewSection.querySelector('#final-preview-table thead');
  thead.innerHTML = `
    <tr>
      <th>학번</th>
      ${sortedSubjectKeys.map(key => {
        const num = parseInt(key.replace('subject_', ''));
        const subjectName = getSubjectName(num);
        return `<th>${subjectName}<br/>점수</th><th>${subjectName}<br/>달성도</th>`;
      }).join('')}
    </tr>
  `;
  
  const tbody = finalPreviewSection.querySelector('#final-preview-table tbody');
  tbody.innerHTML = previewData.map((row) => {
    const studentId = (row.student_id || row.studentId || '').toString().trim();
    
    const subjectCells = sortedSubjectKeys.map((key) => {
      const subjectIndex = SUBJECTS.indexOf(key);
      const levelSubjectKey = getSubjectKey(savedLevel, subjectIndex);
      const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
      
      const scoreValue = row[levelSubjectKey];
      const displayScore = (scoreValue !== undefined && scoreValue !== null && scoreValue !== '') ? scoreValue : '-';
      const achievementValue = row[levelAchievementKey] || '-';
      
      return `<td>${displayScore}</td><td>${achievementValue}</td>`;
    }).join('');
    
    return `
      <tr>
        <td>${studentId}</td>
        ${subjectCells}
      </tr>
    `;
  }).join('');
  
  // 이벤트 리스너
  document.getElementById('close-final-preview-btn').addEventListener('click', () => {
    finalPreviewSection.remove();
  });
  
  document.getElementById('confirm-save-btn').addEventListener('click', () => {
    finalPreviewSection.remove();
    performSave();
  });
}

async function handleSave() {
  // 졸업연도만 업데이트하는 경우
  if (savedLevel === 'graduate_year') {
    performSave();
    return;
  }
  
  // 달성도가 계산되었는지 확인
  const allSubjectKeys = new Set();
  previewData.forEach(row => {
    SUBJECTS.forEach((key, index) => {
      const levelSubjectKey = getSubjectKey(savedLevel, index);
      const hasScore = row[levelSubjectKey] !== undefined && row[levelSubjectKey] !== null && row[levelSubjectKey] !== '';
      if (hasScore) {
        allSubjectKeys.add(key);
      }
    });
  });
  
  let hasUncalculatedAchievement = false;
  allSubjectKeys.forEach(key => {
    const subjectIndex = SUBJECTS.indexOf(key);
    const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
    const hasAchievement = previewData.some(row => {
      const achievement = row[levelAchievementKey];
      return achievement && (achievement === '상' || achievement === '중' || achievement === '하');
    });
    if (!hasAchievement) {
      hasUncalculatedAchievement = true;
    }
  });
  
  if (hasUncalculatedAchievement) {
    if (!confirm('일부 과목의 달성도가 계산되지 않았습니다. 기준점을 적용하고 달성도를 계산하시겠습니까?')) {
      return;
    }
    applyCriteriaAndCalculate();
    setTimeout(() => {
      showFinalPreview();
    }, 500);
    return;
  }
  
  showFinalPreview();
}

async function performSave() {
  const statusEl = document.getElementById('preview-status');
  statusEl.textContent = 'DB에 저장 중...';
  
  try {
    // 기존 학생 데이터 가져오기
    const { data: existingData, error: fetchError } = await supabase
      .from('student_grades')
      .select('*');
    
    if (fetchError) throw fetchError;
    
    const existingDataMap = new Map();
    existingData.forEach(row => {
      // 학번을 정규화하여 저장 (문자열로 변환하고 공백 제거)
      const normalizedId = String(row.student_id || '').trim();
      if (normalizedId) {
        existingDataMap.set(normalizedId, row);
      }
    });
    
    console.log(`DB에 존재하는 학번 수: ${existingDataMap.size}`);
    
    // 중복 학번 처리: 같은 학번이 여러 개 있으면 마지막 데이터로 통합
    const processedDataMap = new Map();
    previewData.forEach(row => {
      const studentId = (row.student_id || row.studentId || '').toString().trim();
      if (!studentId) return;
      
      // 같은 학번이 이미 있으면 데이터 병합 (나중 것이 우선)
      if (processedDataMap.has(studentId)) {
        const existingRow = processedDataMap.get(studentId);
        // 나중 행의 데이터로 덮어쓰기 (값이 있는 경우만)
        Object.keys(row).forEach(key => {
          if (key !== 'student_id' && key !== 'studentId' && row[key] !== undefined && row[key] !== null && row[key] !== '') {
            existingRow[key] = row[key];
          }
        });
      } else {
        processedDataMap.set(studentId, { ...row, student_id: studentId });
      }
    });
    
    console.log(`처리된 고유 학번 수: ${processedDataMap.size}`);
    
    // 데이터 변환 및 처리
    const newPayloads = [];
    const updatePayloads = [];
    const processedStudentIds = new Set(); // 중복 방지용
    
    // processedDataMap의 각 항목을 처리 (이미 중복 제거됨)
    Array.from(processedDataMap.entries()).forEach(([studentId, row]) => {
      // 안전장치: 같은 학번이 두 번 처리되는 것을 방지
      if (processedStudentIds.has(studentId)) {
        console.warn(`학번 ${studentId}가 이미 처리되었습니다. 건너뜁니다.`);
        return;
      }
      processedStudentIds.add(studentId);
      
      // 정규화된 학번으로 DB에서 기존 데이터 찾기
      const normalizedId = String(studentId).trim();
      const existingRow = existingDataMap.get(normalizedId);
      
      if (existingRow) {
        // DB에 이미 존재하는 학번: 입력된 성적과 달성도 값만 수정
        const updatePayload = {};
        let hasUpdateData = false;
        
        // 졸업연도만 업데이트하는 경우
        if (savedLevel === 'graduate_year') {
          if (row.graduate_year !== undefined && row.graduate_year !== null && row.graduate_year !== '') {
            updatePayload.graduate_year = parseInt(row.graduate_year);
            hasUpdateData = true;
          }
        } else {
          // 입력된 과목만 찾아서 업데이트 (모든 레벨 확인)
          LEVELS.forEach(level => {
            const subjectKeys = getSubjectKeysForLevel(level);
            const achievementKeys = getAchievementKeysForLevel(level);
            
            subjectKeys.forEach((levelSubjectKey, index) => {
              const value = row[levelSubjectKey];
              
              // 값이 입력된 경우에만 업데이트
              // "점수(연도, 과목명)" 형식이거나 숫자 문자열인 경우 그대로 저장 (TEXT 타입)
              if (value !== undefined && value !== null && value !== '') {
                updatePayload[levelSubjectKey] = String(value);
                hasUpdateData = true;
              }
              
              // 달성도 처리
              const levelAchievementKey = achievementKeys[index];
              const achievementValue = row[levelAchievementKey];
              
              // 달성도가 입력된 경우에만 업데이트
              if (achievementValue !== undefined && achievementValue !== null && achievementValue !== '') {
                updatePayload[levelAchievementKey] = achievementValue;
                hasUpdateData = true;
              }
            });
          });
        }
        
        // 졸업연도 처리 (모든 경우)
        if (row.graduate_year !== undefined && row.graduate_year !== null && row.graduate_year !== '') {
          updatePayload.graduate_year = parseInt(row.graduate_year);
          hasUpdateData = true;
        }
        
        // 비고 처리 (입력된 경우에만 업데이트)
        if (row[NOTE_FIELD] !== undefined && row[NOTE_FIELD] !== null && row[NOTE_FIELD] !== '') {
          updatePayload[NOTE_FIELD] = row[NOTE_FIELD];
          hasUpdateData = true;
        }
        
        // 업데이트할 데이터가 있는 경우에만 추가
        if (hasUpdateData) {
          updatePayloads.push({
            student_id: studentId,
            ...updatePayload
          });
        }
      } else {
        // 신규 학생: 새로 삽입
        const newPayload = {
          student_id: studentId,
        };
        
        // 졸업연도만 업데이트하는 경우
        if (savedLevel === 'graduate_year') {
          // 졸업연도만 저장
          if (row.graduate_year !== undefined && row.graduate_year !== null && row.graduate_year !== '') {
            newPayload.graduate_year = parseInt(row.graduate_year);
          } else {
            newPayload.graduate_year = null;
          }
        } else {
          // 모든 레벨의 과목 필드 처리
          LEVELS.forEach(level => {
            const subjectKeys = getSubjectKeysForLevel(level);
            const achievementKeys = getAchievementKeysForLevel(level);
            
            subjectKeys.forEach((levelSubjectKey, index) => {
              const value = row[levelSubjectKey];
              // "점수(연도, 과목명)" 형식이거나 숫자 문자열인 경우 그대로 저장 (TEXT 타입)
              if (value === '' || value === null || value === undefined) {
                newPayload[levelSubjectKey] = null;
              } else {
                // 이미 문자열 형식이면 그대로 저장, 숫자면 문자열로 변환
                newPayload[levelSubjectKey] = String(value);
              }
              
              // 달성도 처리
              const levelAchievementKey = achievementKeys[index];
              const achievementValue = row[levelAchievementKey];
              newPayload[levelAchievementKey] = achievementValue === '' || achievementValue === null || achievementValue === undefined ? null : achievementValue;
            });
          });
        }
        
        // 졸업연도 처리 (모든 경우)
        if (row.graduate_year !== undefined && row.graduate_year !== null && row.graduate_year !== '') {
          newPayload.graduate_year = parseInt(row.graduate_year);
        } else {
          newPayload.graduate_year = null;
        }
        
        // 비고 처리
        if (row[NOTE_FIELD] !== undefined && row[NOTE_FIELD] !== null) {
          newPayload[NOTE_FIELD] = row[NOTE_FIELD];
        } else {
          newPayload[NOTE_FIELD] = null;
        }
        
        newPayloads.push(newPayload);
      }
    });
    
    if (newPayloads.length === 0 && updatePayloads.length === 0) {
      statusEl.textContent = '저장할 유효한 데이터가 없습니다.';
      return;
    }
    
    // 최종 중복 제거 및 검증
    const updateStudentIds = new Set(updatePayloads.map(p => String(p.student_id).trim()));
    const existingStudentIdSet = new Set(Array.from(existingDataMap.keys()).map(id => String(id).trim()));
    
    console.log(`신규: ${newPayloads.length}건, 업데이트: ${updatePayloads.length}건`);
    
    // newPayloads에서 DB에 이미 존재하는 학번 제거 (안전장치)
    const filteredNewPayloads = newPayloads.filter(payload => {
      const studentId = String(payload.student_id).trim();
      if (updateStudentIds.has(studentId) || existingStudentIdSet.has(studentId)) {
        console.warn(`학번 ${studentId}는 DB에 이미 존재하므로 신규 추가에서 제외됩니다.`);
        return false;
      }
      return true;
    });
    
    // newPayloads 내부 중복 제거 (Map 사용)
    const newPayloadsMap = new Map();
    filteredNewPayloads.forEach(payload => {
      const studentId = String(payload.student_id).trim();
      if (!newPayloadsMap.has(studentId)) {
        newPayloadsMap.set(studentId, payload);
      } else {
        console.warn(`중복된 신규 학번이 제거되었습니다: ${studentId}`);
      }
    });
    const finalNewPayloads = Array.from(newPayloadsMap.values());
    
    // updatePayloads 내부 중복 제거 (Map 사용)
    const updatePayloadsMap = new Map();
    updatePayloads.forEach(payload => {
      const studentId = String(payload.student_id).trim();
      if (!updatePayloadsMap.has(studentId)) {
        updatePayloadsMap.set(studentId, payload);
      } else {
        console.warn(`중복된 업데이트 학번이 제거되었습니다: ${studentId}`);
        // 중복된 경우 나중 것을 사용 (더 많은 데이터가 있을 수 있음)
        updatePayloadsMap.set(studentId, payload);
      }
    });
    const finalUpdatePayloads = Array.from(updatePayloadsMap.values());
    
    console.log(`최종 신규: ${finalNewPayloads.length}건, 최종 업데이트: ${finalUpdatePayloads.length}건`);
    
    // 최종 검증: newPayloads와 updatePayloads 사이에 중복이 없는지 확인
    const finalNewIds = new Set(finalNewPayloads.map(p => String(p.student_id).trim()));
    const finalUpdateIds = new Set(finalUpdatePayloads.map(p => String(p.student_id).trim()));
    const intersection = [...finalNewIds].filter(id => finalUpdateIds.has(id));
    if (intersection.length > 0) {
      console.error('심각한 오류: newPayloads와 updatePayloads에 중복된 학번이 있습니다:', intersection);
      throw new Error(`중복된 학번이 발견되었습니다: ${intersection.join(', ')}`);
    }
    
    // 신규 데이터 삽입 (개별 처리로 오류 추적 용이)
    if (finalNewPayloads.length > 0) {
      // 배치 삽입 시도
      const { error: insertError } = await supabase
        .from('student_grades')
        .insert(finalNewPayloads);
      
      if (insertError) {
        // 배치 삽입 실패 시 개별 삽입으로 재시도
        console.warn('배치 삽입 실패, 개별 삽입으로 재시도:', insertError);
        for (const newPayload of finalNewPayloads) {
          const { error: singleInsertError } = await supabase
            .from('student_grades')
            .insert([newPayload]);
          
          if (singleInsertError) {
            console.error(`학번 ${newPayload.student_id} 삽입 실패:`, singleInsertError);
            throw singleInsertError;
          }
        }
      }
    }
    
    // 기존 데이터 업데이트 (각각 개별 업데이트로 처리)
    if (finalUpdatePayloads.length > 0) {
      for (const updatePayload of finalUpdatePayloads) {
        const studentId = String(updatePayload.student_id).trim();
        // student_id를 제외한 업데이트 데이터만 추출
        const { student_id, ...updateData } = updatePayload;
        
        const { error: updateError } = await supabase
          .from('student_grades')
          .update(updateData)
          .eq('student_id', studentId);
        
        if (updateError) {
          console.error(`학번 ${studentId} 업데이트 실패:`, updateError);
          throw updateError;
        }
      }
    }
    
    const totalCount = finalNewPayloads.length + finalUpdatePayloads.length;
    statusEl.textContent = `${totalCount}건의 성적이 저장되었습니다. (신규: ${finalNewPayloads.length}건, 수정: ${finalUpdatePayloads.length}건)`;
    
    localStorage.setItem('excelPreviewData', JSON.stringify(previewData));
    
    statusEl.textContent = `${totalCount}건의 성적이 저장되었습니다. (신규: ${finalNewPayloads.length}건, 수정: ${finalUpdatePayloads.length}건)`;
    
    setTimeout(() => {
      window.location.href = 'view.html';
    }, 2000);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `저장 실패: ${err.message}`;
  }
}

// 전역 함수로 등록 (onclick에서 사용)
window.editRow = function(index) {
  selectedRowIndex = index;
  const row = previewData[index];
  
  if (!row) return;
  
  // 폼에 데이터 채우기
  document.getElementById('edit-student-id').value = row.student_id || '';
  
  // 졸업연도만 업데이트하는 경우
  if (savedLevel === 'graduate_year') {
    const tbody = document.getElementById('edit-subjects-tbody');
    const graduateYear = row.graduate_year !== null && row.graduate_year !== undefined ? row.graduate_year : '';
    tbody.innerHTML = `
      <tr>
        <td>졸업연도</td>
        <td colspan="2">
          <input 
            type="number" 
            min="2000" 
            max="2100" 
            step="1" 
            name="graduate_year" 
            value="${graduateYear}"
            placeholder="예: 2025"
            style="width: 150px;"
          />
        </td>
      </tr>
    `;
  } else {
    // 수정 테이블 생성 - 현재 테이블에 표시된 과목만 표시
    const tbody = document.getElementById('edit-subjects-tbody');
    
    if (displayedSubjectKeys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">수정할 과목이 없습니다.</td></tr>';
    } else {
      tbody.innerHTML = displayedSubjectKeys.map((key) => {
        const subjectIndex = SUBJECTS.indexOf(key);
        const subjectNum = subjectIndex + 1;
        const levelSubjectKey = getSubjectKey(savedLevel, subjectIndex);
        const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
        
        // 현재 값 가져오기
        const value = row[levelSubjectKey] || '';
        
        // 달성도 값 가져오기
        const achievementValue = row[levelAchievementKey] || '';
        
        return `
          <tr>
            <td>${getSubjectName(subjectNum)}</td>
            <td>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                name="${levelSubjectKey}" 
                value="${value || ''}"
                placeholder="점수 입력"
                style="width: 100px;"
              />
            </td>
            <td>
              <select name="${levelAchievementKey}" style="width: 100px;">
                <option value="">선택 안 함</option>
                <option value="상" ${achievementValue === '상' ? 'selected' : ''}>상</option>
                <option value="중" ${achievementValue === '중' ? 'selected' : ''}>중</option>
                <option value="하" ${achievementValue === '하' ? 'selected' : ''}>하</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
  
  // 수정 폼 표시
  document.getElementById('edit-form-panel').style.display = 'block';
  document.getElementById('edit-status').textContent = '';
  
  // 수정 폼으로 스크롤
  document.getElementById('edit-form-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

function cancelEdit() {
  selectedRowIndex = null;
  document.getElementById('edit-form-panel').style.display = 'none';
  document.getElementById('edit-preview-form').reset();
  document.getElementById('edit-status').textContent = '';
}

function handleEditSave(event) {
  event.preventDefault();
  
  if (selectedRowIndex === null) {
    document.getElementById('edit-status').textContent = '수정할 행을 선택해주세요.';
    return;
  }
  
  const statusEl = document.getElementById('edit-status');
  statusEl.textContent = '수정 중...';
  
  const formData = new FormData(event.target);
  const row = previewData[selectedRowIndex];
  
  // 졸업연도만 업데이트하는 경우
  if (savedLevel === 'graduate_year') {
    const graduateYear = formData.get('graduate_year');
    if (graduateYear !== '' && graduateYear !== null && graduateYear !== undefined) {
      row.graduate_year = parseInt(graduateYear);
    } else {
      row.graduate_year = null;
    }
  } else {
    // 점수 업데이트 (현재 표시된 과목만 업데이트)
    displayedSubjectKeys.forEach((key) => {
      const subjectIndex = SUBJECTS.indexOf(key);
      const levelSubjectKey = getSubjectKey(savedLevel, subjectIndex);
      const levelAchievementKey = getAchievementKey(savedLevel, subjectIndex);
      
      const value = formData.get(levelSubjectKey);
      // "점수(연도, 과목명)" 형식이거나 숫자 문자열인 경우 그대로 저장 (TEXT 타입)
      if (value !== '' && value !== null && value !== undefined) {
        row[levelSubjectKey] = String(value);
      }
      
      // 달성도 업데이트
      const achievementValue = formData.get(levelAchievementKey);
      if (achievementValue !== '' && achievementValue !== null && achievementValue !== undefined) {
        row[levelAchievementKey] = achievementValue;
      }
    });
  }
  
  // previewData 업데이트
  previewData[selectedRowIndex] = row;
  
  // localStorage 업데이트
  localStorage.setItem('excelPreviewData', JSON.stringify(previewData));
  
  // 테이블 다시 렌더링
  renderPreviewTable();
  
  statusEl.textContent = '수정이 완료되었습니다.';
  statusEl.style.color = '';
  
  // 수정 폼 숨기기
  setTimeout(() => {
    cancelEdit();
  }, 1000);
}

