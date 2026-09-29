import pageCopyMarkdown from '../../03_페이지_문구.md?raw'
import { parsePageCopy } from './parsePageCopy'

export const pageCopy = parsePageCopy(pageCopyMarkdown)
