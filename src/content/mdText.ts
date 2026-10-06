/** MD 본문에 적은 리터럴 `\n`만 줄바꿈으로 변환합니다. 파일 안의 실제 줄바꿈은 공백으로 합칩니다. */
export function unescapeMdLineBreaks(text: string): string {
  return text.replace(/\\n/g, '\n')
}

export function formatMdField(raw: string): string {
  const flattened = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim()
  return unescapeMdLineBreaks(flattened).replace(/[ \t]*\n[ \t]*/g, '\n')
}

export function splitMdFieldParts(raw: string, separator: string): string[] {
  const formatted = formatMdField(raw)
  if (!formatted) {
    return []
  }
  return formatted
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean)
}
