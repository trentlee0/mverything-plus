import { ContentType, kMDItem } from '@/constant'
import { SimpleFilterEnum } from '@/constant'
import { KindFilterModel } from '@/models'
import escapeRegExp from 'lodash/escapeRegExp'

type BuildQueryFn = (builder: QueryBuilder) => QueryBuilder

enum Logic {
  AND = '&&',
  OR = '||'
}

enum Comparison {
  EQ = '==',
  NE = '!=',
  GT = '>',
  GE = '>=',
  LT = '<',
  LE = '<='
}

class QueryHelper {
  static readonly QUOTE = '"'

  // ================= Comparison =================

  static expression(attr: string, comparison: string, val: string) {
    return `${attr} ${comparison} ${val}`
  }

  static mark(val: string, ignoreCase?: boolean) {
    // 转义引号
    val = val.replaceAll(this.QUOTE, '\\' + this.QUOTE)
    return this.QUOTE + val + this.QUOTE + (ignoreCase ? 'cd' : '')
  }

  static enclose(exp: string) {
    return `(${exp})`
  }

  static inRange(attr: string, min: number, max: number) {
    return `InRange(${attr},${min},${max})`
  }

  static like(val: string) {
    return `*${val}*`
  }

  static likeStart(val: string) {
    return `*${val}`
  }

  static likeEnd(val: string) {
    return `${val}*`
  }

  // ================= Time and Date =================

  private static offset(offset?: number) {
    return offset ? `(${offset})` : ''
  }

  static now(offset?: number) {
    return '$time.now' + this.offset(offset)
  }

  static today(offset?: number) {
    return '$time.today' + this.offset(offset)
  }

  static thisWeek(offset?: number) {
    return '$time.this_week' + this.offset(offset)
  }

  static thisMonth(offset?: number) {
    return '$time.this_month' + this.offset(offset)
  }

  static thisYear(offset?: number) {
    return '$time.this_year' + this.offset(offset)
  }

  static datetime(date: Date) {
    return `$time.iso(${date.toISOString()})`
  }
}

export class QueryBuilder {
  protected exp = ''

  private endsWithLogic() {
    const trim = this.exp.trimEnd()
    return trim.endsWith(Logic.OR) || trim.endsWith(Logic.AND)
  }

  private append(logic: Logic, s: string) {
    if (this.exp && !this.endsWithLogic()) {
      this.exp = QueryHelper.expression(this.exp, logic, '')
    }
    this.exp += s
    return this
  }

  // ================= Comparison =================

  private comparison(attr: kMDItem, comparison: Comparison, val: string, ignoreCase?: boolean) {
    val = QueryHelper.mark(val, ignoreCase)
    return this.append(Logic.AND, QueryHelper.expression(attr, comparison, val))
  }

  eq(cond: boolean, attr: kMDItem, val: string, ignoreCase?: boolean) {
    return cond ? this.comparison(attr, Comparison.EQ, val, ignoreCase) : this
  }

  ne(cond: boolean, attr: kMDItem, val: string, ignoreCase?: boolean) {
    return cond ? this.comparison(attr, Comparison.NE, val, ignoreCase) : this
  }

  gt(attr: kMDItem, val: string) {
    return this.comparison(attr, Comparison.GT, val)
  }

  ge(attr: kMDItem, val: string) {
    return this.comparison(attr, Comparison.GE, val)
  }

  lt(attr: kMDItem, val: string) {
    return this.comparison(attr, Comparison.LT, val)
  }

  le(attr: kMDItem, val: string) {
    return this.comparison(attr, Comparison.LE, val)
  }

  // ================= Like =================

  like(cond: boolean, attr: kMDItem, val: string, ignoreCase: boolean = true) {
    return this.eq(cond, attr, QueryHelper.like(val), ignoreCase)
  }

  notLike(cond: boolean, attr: kMDItem, val: string, ignoreCase: boolean = true) {
    return this.ne(cond, attr, QueryHelper.like(val), ignoreCase)
  }

  likeStart(cond: boolean, attr: kMDItem, val: string, ignoreCase: boolean = true) {
    return this.eq(cond, attr, QueryHelper.likeStart(val), ignoreCase)
  }

  likeEnd(cond: boolean, attr: kMDItem, val: string, ignoreCase: boolean = true) {
    return this.eq(cond, attr, QueryHelper.likeEnd(val), ignoreCase)
  }

  // ================= Logical =================

  private nested(logic: Logic, builder?: BuildQueryFn | QueryBuilder) {
    let exp: string | undefined
    exp = typeof builder === 'function' ? builder?.(new QueryBuilder()).exp : builder?.exp
    if (exp) this.append(logic, QueryHelper.enclose(exp))
    return this
  }

  and(builder: BuildQueryFn | QueryBuilder) {
    return this.nested(Logic.AND, builder)
  }

  or(builder: BuildQueryFn | QueryBuilder) {
    return this.nested(Logic.OR, builder)
  }

  // ================= Build =================

  build() {
    return this.exp
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

function unescapeQueryWord(word: string) {
  // 反转义开头的 \- 为 -
  if (word.startsWith('\\-')) return word.substring(1)
  return word
}

function escapeMdfindQuery(q: string) {
  // 只转义 \ 和 *
  return q.replaceAll(/[\\*]/g, (s) => '\\' + s)
}

function getQuoteContent(s: string, leftQuote: string, rightQuote: string) {
  if (s.length > leftQuote.length + rightQuote.length && s.startsWith(leftQuote) && s.endsWith(rightQuote)) {
    return s.substring(leftQuote.length, s.length - rightQuote.length)
  }
  return ''
}

function parseQuoteContent(s: string) {
  const quoteContent =
    getQuoteContent(s, `"`, `"`) ||
    getQuoteContent(s, `'`, `'`) ||
    getQuoteContent(s, `“`, `”`) ||
    getQuoteContent(s, `‘`, `’`)
  const hasQuote = !!quoteContent
  let escapedContent = ''
  if (hasQuote) {
    escapedContent = escapeMdfindQuery(quoteContent)
  }
  return { hasQuote, escapedContent }
}

enum QueryTermType {
  EXACT,
  PARTLY_FUZZY,
  FULLY_FUZZY,
  EXCLUDED
}

interface QueryTerm {
  type: QueryTermType
  word: string
}

function parseQueryByWord(word: string): QueryTerm {
  const { hasQuote, escapedContent } = parseQuoteContent(word)
  // 精确匹配
  if (hasQuote) {
    return { word: escapedContent, type: QueryTermType.EXACT }
  }

  // 判断是否是部分模糊匹配
  if (word.startsWith('*') || word.endsWith('*')) {
    return { word, type: QueryTermType.PARTLY_FUZZY }
  }

  // 判断是否是排除匹配
  if (word.startsWith('-')) {
    let excludeWord = escapeMdfindQuery(word.replace('-', ''))
    const { hasQuote, escapedContent } = parseQuoteContent(excludeWord)
    if (hasQuote) {
      excludeWord = escapedContent
    }
    return { word: excludeWord, type: QueryTermType.EXCLUDED }
  }

  // 默认为模糊匹配
  const queryWord = unescapeQueryWord(word)
  return { word: queryWord, type: QueryTermType.FULLY_FUZZY }
}

function splitSearchText(searchText: string) {
  // 以空格分割，由引号括起来的内容不分割
  const words: string[] = []
  const n = searchText.length
  const quoteMap = new Map<string, string>([
    [`"`, `"`],
    [`'`, `'`],
    [`“`, `”`],
    [`‘`, `’`]
  ])
  let p = -1
  const getRightQuoteIndex = (i: number, leftQuote: string) => {
    let j = i + 1
    const rightQuote = quoteMap.get(leftQuote)
    while (j < n && searchText[j] !== rightQuote) j++
    if (j === n) return i
    return j
  }
  for (let i = 0; i < n; i++) {
    if (searchText[i] === `"`) {
      i = getRightQuoteIndex(i, `"`)
    } else if (searchText[i] === `'`) {
      i = getRightQuoteIndex(i, `'`)
    } else if (searchText[i] === `“`) {
      i = getRightQuoteIndex(i, `“`)
    } else if (searchText[i] === `‘`) {
      i = getRightQuoteIndex(i, `‘`)
    } else {
      if (searchText[i] === ' ') {
        words.push(searchText.substring(p + 1, i))
        p = i
      }
    }
  }
  if (p + 1 < n) {
    words.push(searchText.substring(p + 1))
  }

  return words.map((text) => {
    // 奇数个 \ 就移除最后一个
    let n = text.length
    let i = n - 1
    while (i >= 0 && text[i] === '\\') i--
    return (n - 1 - i) % 2 === 0 ? text : text.substring(0, n - 1)
  })
}

export interface SearchTextPattern {
  expression: string
  // 使用空格隔开的搜索词
  words: string[]
}

/**
 * 获取搜索匹配正则
 */
export function getSearchTextPattern(searchText: string): SearchTextPattern {
  searchText = searchText.trim()
  const { hasQuote, escapedContent } = parseQuoteContent(searchText)
  if (hasQuote) {
    searchText = escapedContent
  }
  let n = searchText.length
  let l = 0
  let r = n - 1

  const words = splitSearchText(searchText.substring(l, r + 1)).filter((word) => !word.startsWith('-'))
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

  const expression = words
    .map((word) => {
      let ans = ''
      let locale: string[] | undefined = undefined
      let isEscape = false
      for (let i = 0; i < word.length; i++) {
        const ch = word[i]

        if (ch === '\\') {
          if (isEscape) {
            ans += '\\\\'
            isEscape = false
          } else {
            isEscape = true
          }
          continue
        }

        if (ch === '-') {
          ans += `[-]?`
        } else if (ch === '*') {
          ans += isEscape ? '\\*' : ''
          ans += i !== word.length - 1 && i !== 0 ? '|' : ''
        } else if ((locale = locales.find((item) => item.includes(ch)))) {
          ans += `[${locale.join('')}]`
        } else if ((i === word.length - 1 || i === 0 || isEscape) && (ch === '.' || ch === '?')) {
          ans += escapeRegExp(ch)
        } else {
          ans += `[${ch}][.-]?`
        }
        isEscape = false
      }
      return ans ? `(${ans})` : ''
    })
    .filter((item) => !!item)
    .join('|')
  return { expression, words }
}

export function buildRecentUsedQuery(recentMonth: number) {
  return new QueryBuilder()
    .ne(true, kMDItem.SupportFileType, 'MDSystemFile')
    .ge(kMDItem.LastUsedDate, QueryHelper.thisMonth(recentMonth))
    .build()
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
  isFindContent: boolean,
  isFindSystemFile: boolean
) {
  const simpleFilter = getSimpleFilter(searchText)
  searchText = searchText.trim()

  let builder = new QueryBuilder()
  if (kindModel.id !== KindFilterModel.ANY.id) {
    const { includes, excludes } = parseKindExpression(kindModel.value)
    excludes.forEach((kind) => builder.ne(true, kMDItem.ContentTypeTree, kind))
    builder.and((b) => {
      includes.forEach((kind) => b.or((b2) => b2.eq(true, kMDItem.ContentTypeTree, kind)))
      return b
    })
  }

  switch (simpleFilter) {
    case SimpleFilterEnum.FOLDER:
      builder.eq(true, kMDItem.ContentType, ContentType.FOLDER)
      break
    case SimpleFilterEnum.FILE:
      builder.ne(true, kMDItem.ContentType, ContentType.FOLDER)
      break
  }
  return builder
    .ne(!isFindSystemFile, kMDItem.SupportFileType, 'MDSystemFile')
    .and((b) => {
      const words = splitSearchText(searchText)
      const contentQuery = new QueryBuilder()

      for (const word of words) {
        const queryTerm = parseQueryByWord(word)
        b.and((b2) => {
          switch (queryTerm.type) {
            case QueryTermType.EXACT:
              return b2
                .eq(true, kMDItem.FSName, queryTerm.word, true)
                .or((b3) => b3.eq(true, kMDItem.DisplayName, queryTerm.word, true))
            case QueryTermType.PARTLY_FUZZY:
              return b2
                .eq(true, kMDItem.FSName, queryTerm.word, true)
                .or((b3) => b3.eq(true, kMDItem.DisplayName, queryTerm.word, true))
            case QueryTermType.EXCLUDED:
              const hasExclude = !!queryTerm.word
              return b2
                .notLike(hasExclude, kMDItem.FSName, queryTerm.word)
                .notLike(hasExclude, kMDItem.DisplayName, queryTerm.word)
            case QueryTermType.FULLY_FUZZY:
              return b2
                .like(true, kMDItem.FSName, queryTerm.word)
                .or((b3) => b3.like(true, kMDItem.DisplayName, queryTerm.word))
          }
        })

        if (isFindContent) {
          switch (queryTerm.type) {
            case QueryTermType.EXCLUDED:
              contentQuery.notLike(true, kMDItem.TextContent, queryTerm.word)
              break
            default:
              contentQuery.like(true, kMDItem.TextContent, queryTerm.word)
              break
          }
        }
      }
      return b.or(contentQuery)
    })
    .build()
}
