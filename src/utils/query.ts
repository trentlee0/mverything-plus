import { ContentType } from '@/constant'
import { SimpleFilterEnum } from '@/constant'
import { KindFilterModel } from '@/models'
import { escapeRegExp } from 'lodash'

type BuildQueryFn = (builder: QueryBuilder) => QueryBuilder

enum LogicalOperator {
  AND = '&&',
  OR = '||'
}

export class QueryBuilder {
  private static readonly QUOTE = `"`

  protected ex = ''

  private endsWithLogical() {
    const trimEx = this.ex.trimEnd()
    return (
      trimEx.endsWith(LogicalOperator.OR) ||
      trimEx.endsWith(LogicalOperator.AND)
    )
  }

  private append(logicalOp: LogicalOperator, s: string) {
    if (this.ex && !this.endsWithLogical()) {
      this.ex += ` ${logicalOp} `
    }
    this.ex += s
    return this
  }

  // ================= Comparison =================

  private escape(s: string) {
    return s.replaceAll(QueryBuilder.QUOTE, '\\' + QueryBuilder.QUOTE)
  }

  private markValue(s: string, ignoreCase?: boolean) {
    // 转义引号
    s = this.escape(s)
    return (
      QueryBuilder.QUOTE + s + QueryBuilder.QUOTE + (ignoreCase ? 'cd' : '')
    )
  }

  private appendComparison(
    name: string,
    comparisonOp: string,
    val: string,
    ignoreCase?: boolean
  ) {
    return this.append(
      LogicalOperator.AND,
      `${name} ${comparisonOp} ${this.markValue(val, ignoreCase)}`
    )
  }

  eq(cond: boolean, attr: string, val: string, ignoreCase?: boolean) {
    return cond ? this.appendComparison(attr, '==', val, ignoreCase) : this
  }

  ne(cond: boolean, attr: string, val: string, ignoreCase?: boolean) {
    return cond ? this.appendComparison(attr, '!=', val, ignoreCase) : this
  }

  gt(attr: string, val: string) {
    return this.appendComparison(attr, '>', val)
  }

  ge(attr: string, val: string) {
    return this.appendComparison(attr, '>=', val)
  }

  lt(attr: string, val: string) {
    return this.appendComparison(attr, '<', val)
  }

  le(attr: string, val: string) {
    return this.appendComparison(attr, '<=', val)
  }

  // ================= Like =================

  likeStart(
    cond: boolean,
    attr: string,
    val: string,
    ignoreCase: boolean = true
  ) {
    return this.eq(cond, attr, `*${val}`, ignoreCase)
  }

  likeEnd(
    cond: boolean,
    attr: string,
    val: string,
    ignoreCase: boolean = true
  ) {
    return this.eq(cond, attr, `${val}*`, ignoreCase)
  }

  like(cond: boolean, attr: string, val: string, ignoreCase: boolean = true) {
    return this.eq(cond, attr, `*${val}*`, ignoreCase)
  }

  // ================= Logical =================

  private nested(logicalOp: LogicalOperator, queryFn?: BuildQueryFn) {
    const val = queryFn?.(new QueryBuilder()).ex
    if (val) this.append(logicalOp, `(${val})`)
    return this
  }

  and(queryFn: BuildQueryFn) {
    return this.nested(LogicalOperator.AND, queryFn)
  }

  or(queryFn: BuildQueryFn) {
    return this.nested(LogicalOperator.OR, queryFn)
  }

  build() {
    return this.ex
  }
}

/**
 * 处理条件自定义关键字
 */
export function splitKeyword(str: string, separator: string) {
  let keyIndex = str.indexOf(separator)
  if (keyIndex === -1) return { keyword: '', statement: str }

  const keyword = str.substring(0, keyIndex)
  return { keyword, statement: str.substring(keyIndex + 1) }
}

/**
 * 判断是文件、文件夹还是无筛选
 */
export function getSimpleFilter(searchText: string) {
  if (searchText.startsWith('  ')) return SimpleFilterEnum.FILE
  if (searchText.startsWith(' ')) return SimpleFilterEnum.FOLDER
  return SimpleFilterEnum.NONE
}

function parseKindExpression(kindExp: string) {
  const includes: string[] = []
  const excludes: string[] = []
  // include 0, exclude 1
  let symbol: 0 | 1 = 0
  let kind = ''
  const addKind = () => {
    if (!kind) return
    if (symbol === 1) excludes.push(kind)
    else includes.push(kind)
    kind = ''
  }
  for (const ch of kindExp) {
    if (ch === '!' || ch === '|') {
      addKind()
      symbol = ch === '!' ? 1 : 0
    } else {
      kind += ch
    }
  }
  addKind()
  return { includes, excludes }
}

function getQuoteContent(s: string, leftQuote: string, rightQuote: string) {
  if (
    s.length > leftQuote.length + rightQuote.length &&
    s.startsWith(leftQuote) &&
    s.endsWith(rightQuote)
  ) {
    return s.substring(leftQuote.length, s.length - rightQuote.length)
  }
  return ''
}

function parseQuoteContent(s: string) {
  return (
    getQuoteContent(s, `"`, `"`) ||
    getQuoteContent(s, `'`, `'`) ||
    getQuoteContent(s, `“`, `”`) ||
    getQuoteContent(s, `‘`, `’`)
  )
}

function splitSearchText(searchText: string) {
  return searchText.split(/ +/)
}

/**
 * 获取搜索匹配正则
 */
export function getSearchRegExp(searchText: string) {
  searchText = searchText.trim()
  const quoteContent = parseQuoteContent(searchText)
  if (quoteContent) {
    searchText = quoteContent
  }
  let n = searchText.length
  let l = 0
  let r = n - 1
  while (l < n && searchText.charAt(l) === '*') l++
  while (r > l && searchText.charAt(r) === '*') r--

  const words = splitSearchText(searchText.substring(l, r + 1))
  const locales = [
    [`“`, `”`, '"'],
    [`‘`, `’`, `'`, '`'],
    [`？`, '?'],
    [`：`, ':'],
    [`！`, '!'],
    [`（`, '('],
    [`）`, ')'],
    [`，`, ','],
    [`；`, ';'],
    [`｜`, '|'],
    [`＋`, '+']
  ]
  const regexp = new RegExp(
    words
      .map((word) => {
        let ans = ''
        let locale: string[] | undefined = undefined
        for (let i = 0; i < word.length; i++) {
          const ch = word[i]

          if (ch === '-') {
            ans += `[-]?`
          } else if ((locale = locales.find((item) => item.includes(ch)))) {
            ans += `[${locale.join('')}]`
          } else if (
            i === word.length - 1 ||
            i === 0 ||
            ch === '.' ||
            ch === '?'
          ) {
            ans += escapeRegExp(ch)
          } else {
            ans += `[${ch}.-]{1,2}`
          }
        }
        return `(${ans})`
      })
      .join('|'),
    'ig'
  )
  return { regexp, words }
}

/**
 * 构建 mdfind 查询表达式
 *
 * 参考文档：
 * - https://ss64.com/osx/mdfind.html
 * - https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html
 */
export function buildQuery(
  searchText: string,
  kindModel: KindFilterModel,
  isFindContent: boolean = false
) {
  const simpleFilter = getSimpleFilter(searchText)
  searchText = searchText.trim()

  let builder = new QueryBuilder()
  if (kindModel.id !== KindFilterModel.ANY.id) {
    const { includes, excludes } = parseKindExpression(kindModel.value)
    excludes.forEach((kind) => builder.ne(true, 'kMDItemContentTypeTree', kind))
    builder.and((b) => {
      includes.forEach((kind) =>
        b.or((b2) => b2.eq(true, 'kMDItemContentTypeTree', kind))
      )
      return b
    })
  }

  return builder
    .and((b) => {
      switch (simpleFilter) {
        case SimpleFilterEnum.FOLDER:
          return b.eq(true, 'kMDItemContentType', ContentType.FOLDER)
        case SimpleFilterEnum.FILE:
          return b.ne(true, 'kMDItemContentType', ContentType.FOLDER)
      }
      return b
    })
    .and((b) => {
      // 判断是否是模糊匹配
      if (searchText.startsWith('*') || searchText.endsWith('*')) {
        b.eq(true, 'kMDItemFSName', searchText, true)
      } else {
        const quoteContent = parseQuoteContent(searchText)
        if (quoteContent) {
          // 全匹配
          b.eq(true, 'kMDItemFSName', quoteContent, true)
        } else {
          // 默认为模糊匹配
          const words = splitSearchText(searchText)
          for (const word of words) {
            b.like(true, 'kMDItemFSName', word)
          }
        }
      }
      return b.or((b2) =>
        b2.like(isFindContent, 'kMDItemTextContent', searchText)
      )
    })
    .build()
}
