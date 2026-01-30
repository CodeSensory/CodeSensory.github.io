let allGradeData = [];
let selectedGraduateYear = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchGrades();
  
  document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchGrades();
  });
  
  document.getElementById('graduate-year-select').addEventListener('change', (e) => {
    selectedGraduateYear = e.target.value === '' ? null : parseInt(e.target.value);
    renderSummaryTable();
  });
});

async function fetchGrades() {
  const statusEl = document.getElementById('summary-status');
  statusEl.textContent = '데이터를 불러오는 중...';

  try {
    const { data, error } = await supabase
      .from('student_grades')
      .select('*')
      .order('student_id', { ascending: true });

    if (error) throw error;

    allGradeData = data || [];
    
    // 졸업 연도 목록 추출 및 드롭다운 채우기
    const graduateYears = new Set();
    allGradeData.forEach(row => {
      if (row.graduate_year !== null && row.graduate_year !== undefined) {
        graduateYears.add(parseInt(row.graduate_year));
      }
    });
    
    const sortedYears = Array.from(graduateYears).sort((a, b) => a - b);
    const yearSelect = document.getElementById('graduate-year-select');
    
    // 기존 옵션 유지 (전체 옵션)
    const existingOptions = yearSelect.querySelectorAll('option');
    existingOptions.forEach(opt => {
      if (opt.value !== '') opt.remove();
    });
    
    sortedYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
    
    // 통계 테이블 렌더링
    renderSummaryTable();
    
    statusEl.textContent = `총 ${allGradeData.length}건의 데이터를 불러왔습니다.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `불러오기 실패: ${err.message}`;
  }
}

function renderSummaryTable() {
  // 선택된 졸업 연도에 해당하는 데이터 필터링
  let filteredData = allGradeData;
  if (selectedGraduateYear !== null) {
    filteredData = allGradeData.filter(row => {
      return row.graduate_year !== null && row.graduate_year !== undefined && 
             parseInt(row.graduate_year) === selectedGraduateYear;
    });
  }
  
  // 총 인원수 계산
  const totalCount = filteredData.length;
  
  // 상태 업데이트
  const statusEl = document.getElementById('summary-status');
  const yearText = selectedGraduateYear !== null ? `${selectedGraduateYear}년 졸업` : '전체';
  statusEl.textContent = `${yearText} 기준 총 ${totalCount}명`;
  
  // 각 레벨별로 테이블 렌더링
  renderLevelTable('l1', 'L1', filteredData, totalCount);
  renderLevelTable('l2', 'L2', filteredData, totalCount);
  renderLevelTable('l3', 'L3', filteredData, totalCount);
}

function renderLevelTable(levelId, levelName, filteredData, totalCount) {
  const tbody = document.querySelector(`#${levelId}-summary-table tbody`);
  const statusEl = document.getElementById(`${levelId}-status`);
  
  if (!tbody || !statusEl) return;
  
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">데이터가 없습니다.</td></tr>';
    statusEl.textContent = '0건';
    return;
  }
  
  const level = levelName.toLowerCase();
  const rows = [];
  
  // 먼저 각 과목별로 데이터 수집 (연도별로 분류)
  SUBJECTS.forEach((subjectKey, index) => {
    const subjectNum = index + 1;
    const subjectName = getSubjectName(subjectNum);
    const achievementKey = getAchievementKey(level, index);
    const levelSubjectKey = getSubjectKey(level, index);
    
    // 연도별로 데이터 분류: { 연도: { 과목명, 상, 중, 하 } }
    const yearDataMap = new Map(); // key: "연도_과목명", value: { year, subjectName, high, mid, low }
    const subjectNames = new Set();
    
    filteredData.forEach(row => {
      const scoreValue = row[levelSubjectKey];
      const achievement = row[achievementKey];
      
      if (scoreValue !== null && scoreValue !== undefined && scoreValue !== '') {
        const strValue = String(scoreValue);
        // "점수(연도, 과목명)" 형식에서 연도와 과목명 추출
        const match = strValue.match(/^\d+(?:\.\d+)?(?:\(([^,]*),\s*([^)]*)\))?$/);
        
        let year = null;
        let extractedSubjectName = null;
        
        if (match) {
          if (match[1]) {
            year = match[1].trim();
          }
          if (match[2]) {
            extractedSubjectName = match[2].trim();
            if (extractedSubjectName) {
              subjectNames.add(extractedSubjectName);
            }
          }
        }
        
        // 연도와 과목명을 키로 사용
        const yearKey = year || '-';
        const subjectNameKey = extractedSubjectName || '-';
        const mapKey = `${yearKey}_${subjectNameKey}`;
        
        if (!yearDataMap.has(mapKey)) {
          yearDataMap.set(mapKey, {
            year: year || '-',
            subjectName: extractedSubjectName || '-',
            high: 0,
            mid: 0,
            low: 0
          });
        }
        
        const yearData = yearDataMap.get(mapKey);
        if (achievement === '상') {
          yearData.high++;
        } else if (achievement === '중') {
          yearData.mid++;
        } else if (achievement === '하') {
          yearData.low++;
        }
      }
    });
    
    // 과목명 표시 (여러 개가 있으면 첫 번째 것만, 없으면 빈 문자열)
    const displaySubjectName = subjectNames.size > 0 ? Array.from(subjectNames)[0] : '-';
    
    // 연도별로 행 생성
    if (yearDataMap.size === 0) {
      // 데이터가 없으면 기본 행 하나만 추가
      rows.push({
        level: levelName,
        subjectName: displaySubjectName,
        subject: subjectName,
        year: '-',
        high: '0(0)',
        mid: '0(0)',
        low: '0(0)'
      });
    } else {
      // 연도별로 정렬하여 행 생성
      const yearDataArray = Array.from(yearDataMap.values()).sort((a, b) => {
        if (a.year === '-' && b.year !== '-') return 1;
        if (a.year !== '-' && b.year === '-') return -1;
        if (a.year === '-' && b.year === '-') return 0;
        return parseInt(b.year) - parseInt(a.year); // 내림차순 (최신 연도 먼저)
      });
      
      yearDataArray.forEach((yearData, yearIndex) => {
        const totalCount = yearData.high + yearData.mid + yearData.low;
        const highPercent = totalCount > 0 ? Math.round((yearData.high / totalCount) * 100) : 0;
        const midPercent = totalCount > 0 ? Math.round((yearData.mid / totalCount) * 100) : 0;
        const lowPercent = totalCount > 0 ? Math.round((yearData.low / totalCount) * 100) : 0;
        
        // 각 연도 데이터의 과목명 사용 (없으면 전체 과목명 사용)
        const rowSubjectName = yearData.subjectName !== '-' ? yearData.subjectName : displaySubjectName;
        
        rows.push({
          level: levelName,
          subjectName: rowSubjectName, // 각 연도 데이터의 과목명 사용
          subject: subjectName, // 원본 과목 저장 (표시 여부는 그룹화에서 결정)
          year: yearData.year === '-' ? '-' : `${yearData.year}년`,
          high: `${yearData.high}(${highPercent})`,
          mid: `${yearData.mid}(${midPercent})`,
          low: `${yearData.low}(${lowPercent})`
        });
      });
    }
  });
  
  // 과목명별로 그룹화 (과목명은 합치되, 과목과 연도는 각각 별도 행으로 유지)
  // 먼저 과목명 -> 과목 -> 연도 순으로 정렬
  const sortedRows = [...rows].sort((a, b) => {
    // 1. 과목명으로 정렬
    const nameA = a.subjectName || '-';
    const nameB = b.subjectName || '-';
    if (nameA !== nameB) {
      if (nameA === '-') return 1;
      if (nameB === '-') return -1;
      const nameCompare = nameA.localeCompare(nameB, 'ko');
      if (nameCompare !== 0) return nameCompare;
    }
    
    // 2. 과목으로 정렬
    const subjectA = a.subject || '';
    const subjectB = b.subject || '';
    if (subjectA !== subjectB) {
      return subjectA.localeCompare(subjectB, 'ko');
    }
    
    // 3. 연도로 정렬 (내림차순 - 최신 연도 먼저)
    const yearA = a.year || '-';
    const yearB = b.year || '-';
    if (yearA === '-' && yearB !== '-') return 1;
    if (yearA !== '-' && yearB === '-') return -1;
    if (yearA === '-' && yearB === '-') return 0;
    const yearNumA = parseInt(yearA.replace('년', ''));
    const yearNumB = parseInt(yearB.replace('년', ''));
    return yearNumB - yearNumA;
  });
  
  const groupedRows = [];
  let previousSubjectName = null;
  let previousSubject = null;
  let previousYear = null;
  
  sortedRows.forEach((row, index) => {
    const currentSubjectName = row.subjectName || '-';
    const currentSubject = row.subject || '';
    const currentYear = row.year || '-';
    
    // 과목명이 바뀌면 새 그룹
    const isNewGroup = index === 0 || previousSubjectName !== currentSubjectName;
    
    // 같은 과목명 내에서 과목이 바뀌면 과목을 표시
    const isNewSubject = isNewGroup || previousSubject !== currentSubject;
    
    // 같은 과목 내에서 연도가 바뀌면 과목명과 과목을 표시하지 않음 (이미 처리됨)
    
    // 표시할 값 결정
    let showSubjectName = '';
    let showSubject = '';
    
    if (isNewGroup) {
      // 새 그룹이면 과목명 표시
      showSubjectName = currentSubjectName !== '-' ? currentSubjectName : '';
    }
    
    if (isNewSubject) {
      // 새 과목이면 과목 표시
      showSubject = currentSubject;
    }
    
    if (isNewGroup) {
      previousSubjectName = currentSubjectName;
    }
    previousSubject = currentSubject;
    previousYear = currentYear;
    
    groupedRows.push({
      level: row.level,
      subjectName: showSubjectName,
      subject: showSubject,
      year: currentYear,
      high: row.high,
      mid: row.mid,
      low: row.low,
      isFirstInGroup: isNewGroup,
      isNewGroup: isNewGroup // 새 그룹 시작 행에만 true
    });
  });
  
  // 테이블 렌더링 (과목명은 합쳐지고, 과목과 연도는 각각 별도 행)
  tbody.innerHTML = groupedRows.map((row, rowIndex) => {
    // 그룹 시작 행 스타일 (굵은 선만)
    const rowStyle = row.isNewGroup 
      ? `style="border-top: 3px solid #ff8000;"` 
      : '';
    
    // 과목명 셀 스타일 (색상과 굵은 글씨만)
    const subjectNameStyle = row.isFirstInGroup && row.subjectName && row.subjectName !== '-'
      ? `style="font-weight: 700; color: #ff8000;"`
      : '';
    
    return `
      <tr ${rowStyle}>
        <td>${row.level}</td>
        <td ${subjectNameStyle}>${row.subjectName || ''}</td>
        <td>${row.subject || ''}</td>
        <td>${row.year || '-'}</td>
        <td>${row.high}</td>
        <td>${row.mid}</td>
        <td>${row.low}</td>
      </tr>
    `;
  }).join('');
  
  statusEl.textContent = `${totalCount}건`;
}

