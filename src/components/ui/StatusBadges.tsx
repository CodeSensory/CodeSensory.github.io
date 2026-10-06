import type { ResearchItem } from '../../content/types'
import { pageCopy } from '../../content/pageCopy'

import { statusLabel } from '../../content/statusLabel'

import { TAG_CHIP, TAG_CHIP_EN } from '../../styles/swissClasses'



type StatusBadgesProps = {

  item: ResearchItem

}



export function StatusBadges({ item }: StatusBadgesProps) {

  return (

    <div className="flex flex-wrap gap-2">

      <span className={TAG_CHIP}>{statusLabel(item.status)}</span>

      {item.showBestPaper ? (

        <span className={`${TAG_CHIP_EN} border-accent text-accent`}>
          {pageCopy.publications.bestPaperLabel}
        </span>

      ) : null}

    </div>

  )

}

