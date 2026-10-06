export type LabNewsItem = {
  id: string
  date: string
  category: string
  title: string
  body: string
}

export const labNews: LabNewsItem[] = [
  {
    id: 'ckaia-2026',
    date: '2026',
    category: '학회',
    title: 'CKAIA 2026 채택 · 포스터 발표',
    body: 'CIELAB chroma 강조로 의료 영상 분류의 라벨 효율을 다룬 연구가 채택되어 포스터와 발표를 마쳤습니다.',
  },
  {
    id: 'ksmi-2026',
    date: '2026',
    category: '투고',
    title: '한국의료정보학회 추계학술대회 심사 중',
    body: '웨어러블 시계열 CNN의 colormap shortcut을 공개 데이터로 감사한 원고가 심사 중입니다.',
  },
  {
    id: 'cbm-draft',
    date: '2026',
    category: '원고',
    title: 'Colon H&E self-supervised 비교 원고 작성 중',
    body: 'NCT-CRC 학습과 CRC-VAL 외부 검증을 담은 한국어 초고를 마쳤고, 영어본을 교정하고 있습니다.',
  },
]
