import type { ReactNode } from 'react'

const TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|class|import|from|as|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|with|lambda|pass|raise|assert|yield|del|global|nonlocal)\b|\b(print|len|range|zip|round|sum|min|max|abs|sorted|enumerate|list|dict|set|tuple|str|int|float|bool|isinstance|type|open)\b|\b(\d+(?:\.\d+)?(?:e-?\d+)?)\b|\b([A-Za-z_]\w*)(?=\()|\b(pd|np|sns|plt|stats|df|ax|fig|ab|order_id|revenue)\b/g

export function highlightLine(line: string, keyPrefix = 'l'): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  TOKEN.lastIndex = 0

  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) {
      nodes.push(line.slice(last, match.index))
    }
    const [text, comment, str, keyword, builtin, num, fn, variable] = match
    const cls = comment
      ? 'tk-com'
      : str
        ? 'tk-str'
        : keyword
          ? 'tk-kw'
          : builtin
            ? 'tk-bi'
            : num
              ? 'tk-num'
              : fn
                ? 'tk-fn'
                : variable
                  ? 'tk-var'
                  : ''
    nodes.push(
      <span className={cls} key={`${keyPrefix}-${i++}`}>
        {text}
      </span>,
    )
    last = match.index + text.length
  }

  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}
