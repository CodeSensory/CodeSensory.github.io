const STATIC_RULE = 'mt-3 h-0.5 w-full bg-rule'
const DRAWN_RULE = 'mt-3 w-full bg-rule animate-rule-draw'

type SectionMarkProps = {
  title: string
  as?: 'h2' | 'h3'
  className: string
  drawsOnEnter?: boolean
}

export function SectionMark({
  title,
  as: Tag = 'h2',
  className,
  drawsOnEnter = false,
}: SectionMarkProps) {
  const ruleClass = drawsOnEnter ? DRAWN_RULE : STATIC_RULE
  return (
    <div className="w-fit max-w-full">
      <Tag className={className}>{title}</Tag>
      <div aria-hidden className={ruleClass} />
    </div>
  )
}
