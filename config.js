// Supabase 클라이언트 초기화 설정
// 실제 프로젝트 값을 입력한 뒤 사용하세요.
const SUPABASE_URL = 'https://pyidizfnrnoqplclekun.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3rPJ17sh_tLWavZbMSx2DA_Kay-hUiq';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Edge Function 호출용 (요청 알림 이메일 등)
if (typeof window !== 'undefined') {
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
}

// 레벨 정의
const LEVELS = ['l1', 'l2', 'l3'];

// 18개 과목 필드 이름을 공통으로 관리 (레벨 접두사 없이)
const SUBJECTS = Array.from({ length: 18 }, (_, idx) => `subject_${idx + 1}`);
// 비고 필드
const NOTE_FIELD = 'note';

// 레벨별 과목 키 생성 (예: L1_subject_1)
function getSubjectKey(level, subjectIndex) {
  return `${level}_subject_${subjectIndex + 1}`;
}

// 레벨별 달성도 키 생성 (예: L1_subject_1_achievement)
function getAchievementKey(level, subjectIndex) {
  return `${level}_subject_${subjectIndex + 1}_achievement`;
}

// 레벨별 모든 과목 키 배열 생성
function getSubjectKeysForLevel(level) {
  return Array.from({ length: 18 }, (_, idx) => getSubjectKey(level, idx));
}

// 레벨별 모든 달성도 키 배열 생성
function getAchievementKeysForLevel(level) {
  return Array.from({ length: 18 }, (_, idx) => getAchievementKey(level, idx));
}

// 과목 이름 매핑 (인덱스는 0부터 시작, 과목 번호는 1부터)
const SUBJECT_NAMES = {
  1: '1_활력징후',
  2: '2_경구투약',
  3: '3_근육주사',
  4: '4_피하주사',
  5: '5_피내주사',
  6: '6_정맥수액주입',
  7: '7_수혈요법',
  8: '8_간헐적 위관영양',
  9: '9_단순도뇨',
  10: '10_유치도뇨',
  11: '11_배출관장',
  12: '12_말초산소포화도 심전도',
  13: '13_비강캐뉼라',
  14: '14_입원관리',
  15: '15_격리실출입',
  16: '16_통증관리',
  17: '17_욕창관리 및 낙상예방간호',
  18: '18_배액관 관리'
};

// 과목 번호(1-18)로 이름 가져오기
function getSubjectName(subjectNumber) {
  return SUBJECT_NAMES[subjectNumber] || `과목 ${subjectNumber}`;
}

// 과목 키(subject_1 등)로 이름 가져오기
function getSubjectNameByKey(subjectKey) {
  const num = parseInt(subjectKey.replace('subject_', ''));
  return getSubjectName(num);
}

// 과목 이름(예: "1_활력징후")으로 과목 번호 찾기
function getSubjectNumberByName(subjectName) {
  if (!subjectName) return null;
  
  // 정확히 일치하는 경우
  for (const [num, name] of Object.entries(SUBJECT_NAMES)) {
    if (name === subjectName) {
      return parseInt(num);
    }
  }
  
  // "1_활력징후" 형식에서 숫자 추출
  const match = subjectName.match(/^(\d+)_/);
  if (match) {
    return parseInt(match[1]);
  }
  
  return null;
}

// 공통 유틸: 폼 데이터를 Supabase 컬럼 구조로 변환 (레벨별)
function buildGradePayload({ studentId, level, subjects, achievements = null, note = null }) {
  const payload = {
    student_id: studentId,
  };

  SUBJECTS.forEach((subjectKey, index) => {
    const levelSubjectKey = getSubjectKey(level, index);
    payload[levelSubjectKey] = subjects[index] ?? null;
    
    // 달성도 추가 (있을 경우)
    if (achievements && achievements[index] !== undefined) {
      const achievementKey = getAchievementKey(level, index);
      payload[achievementKey] = achievements[index] ?? null;
    }
  });
  
  // 비고 추가
  if (note !== undefined) {
    payload[NOTE_FIELD] = note || null;
  }

  return payload;
}

// 공통 유틸: Supabase row를 화면용 데이터로 변환 (레벨별)
function normalizeGradeRow(row, level = 'l1') {
  const subjectKeys = getSubjectKeysForLevel(level);
  return {
    id: row.id,
    student_id: row.student_id,
    subjects: subjectKeys.map((key) => row[key]),
    note: row[NOTE_FIELD] || null,
    updated_at: row.updated_at,
  };
}

// 모든 레벨의 성적을 포함한 정규화 (학번 검색 시 사용)
function normalizeGradeRowAllLevels(row) {
  return {
    id: row.id,
    student_id: row.student_id,
    l1: {
      subjects: getSubjectKeysForLevel('l1').map((key) => row[key]),
      achievements: getAchievementKeysForLevel('l1').map((key) => row[key]),
    },
    l2: {
      subjects: getSubjectKeysForLevel('l2').map((key) => row[key]),
      achievements: getAchievementKeysForLevel('l2').map((key) => row[key]),
    },
    l3: {
      subjects: getSubjectKeysForLevel('l3').map((key) => row[key]),
      achievements: getAchievementKeysForLevel('l3').map((key) => row[key]),
    },
    note: row[NOTE_FIELD] || null,
    updated_at: row.updated_at,
  };
}

