import type { ContentLink } from '../../content/types'
import { BTN_OUTLINE } from '../../styles/swissClasses'

type ExternalLinkProps = {
  link: ContentLink
}

export function ExternalLink({ link }: ExternalLinkProps) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={BTN_OUTLINE}
    >
      {link.label}
    </a>
  )
}
