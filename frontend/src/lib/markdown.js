/**
 * A deliberately small markdown-to-React converter.
 *
 * The model answers in light markdown — headings, lists, bold, inline code.
 * Rendering that with a full parser would mean pulling in a parser plus a
 * sanitiser; instead this walks the text and returns React elements, so no
 * HTML is ever constructed and there is nothing to sanitise.
 */
import { createElement, Fragment } from 'react'

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g

function renderInline(text, keyPrefix) {
  const parts = text.split(INLINE).filter(Boolean)
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return createElement('strong', { key }, part.slice(2, -2))
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return createElement('em', { key }, part.slice(1, -1))
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return createElement('code', { key }, part.slice(1, -1))
    }
    return createElement(Fragment, { key }, part)
  })
}

/**
 * @param {string} source
 * @returns {import('react').ReactNode[]}
 */
export function renderMarkdown(source) {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    const text = paragraph.join(' ')
    blocks.push(createElement('p', { key: `p${blocks.length}` }, renderInline(text, `p${blocks.length}`)))
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    const items = list.items.map((item, index) =>
      createElement('li', { key: index }, renderInline(item, `li${blocks.length}-${index}`))
    )
    blocks.push(createElement(list.ordered ? 'ol' : 'ul', { key: `l${blocks.length}` }, items))
    list = null
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      flushParagraph()
      flushList()
      const level = Math.min(heading[1].length + 2, 6)
      blocks.push(
        createElement(`h${level}`, { key: `h${blocks.length}` }, renderInline(heading[2], `h${blocks.length}`))
      )
      continue
    }

    const bullet = trimmed.match(/^[-*•]\s+(.*)$/)
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/)

    if (bullet || numbered) {
      flushParagraph()
      const ordered = Boolean(numbered)
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push((bullet || numbered)[1])
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  return blocks
}
