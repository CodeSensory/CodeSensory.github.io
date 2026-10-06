/** 한국어 본문: MD `\n` + 컨테이너 폭에 맞춘 자동 줄바꿈 */
export const TEXT_KO_BODY =
  'w-full whitespace-pre-line break-keep [overflow-wrap:normal] text-base leading-[1.75] text-ink/85'

/** 영문 논문·저자 등 (lang="en" 과 함께) */
export const TEXT_EN_BODY =
  'w-full whitespace-pre-line break-normal [overflow-wrap:break-word] font-sans text-sm leading-[1.55] text-ink/75'

/** 논문 제목: 크기는 사용처에서 지정 */
export const TEXT_EN_TITLE =
  'font-sans font-semibold normal-case leading-snug tracking-[-0.01em] text-ink [overflow-wrap:anywhere]'

export const TEXT_MUTED = 'font-sans text-xs uppercase tracking-[0.1em] text-ink/65'

/** 게재지·학회명: 긴 고유명사라 대문자 변환 없이 표기 */
export const TEXT_VENUE = 'font-sans text-xs leading-[1.6] text-ink/65'

export const TEXT_PROFILE_LINE =
  'w-full whitespace-pre-line break-keep [overflow-wrap:normal] font-sans text-base leading-relaxed text-ink/65'

export const CARD_SURFACE = 'border border-ink bg-paper-elevated p-6 md:p-8'
