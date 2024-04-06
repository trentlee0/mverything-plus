import { ContentType, SortOrderEnum } from '@/constant'
import * as icons from './icons'
import isNull from 'lodash/isNull'
import { BaseFileInfo, FindFileMetadata } from '@/models'
import { match } from 'pinyin-pro'
import { SearchTextPattern } from './query'
import { escapeRegExp } from 'lodash'
import { getBasename, getDirname, joinPath } from '@/preload'
import { isLegalIndex } from './collections'

/**
 * 根据自定义关键字，获取过滤正则表达式
 */
export function getCustomKeywordRegExp(customKeyword: string, keyMap: Map<string, string>) {
  if (customKeyword) {
    const pattern = keyMap.get(customKeyword)
    if (pattern) return new RegExp(pattern, 'i')
  }
  return null
}

/**
 * 映射到文件 Model 对象
 */
export function mapToFileInfo(item: FindFileMetadata) {
  const mappedItem: BaseFileInfo = {
    name: item.kMDItemDisplayName || getBasename(item.kMDItemPath),
    path: item.kMDItemPath,
    icon: icons.getIcon(item),
    size: isNull(item.kMDItemFSSize) ? null : parseInt(item.kMDItemFSSize),
    kind: item.kMDItemKind,
    type: item.kMDItemKind === '文件夹' ? ContentType.FOLDER : item.kMDItemContentType,
    createDate: item.kMDItemFSCreationDate ?? item.kMDItemContentCreationDate,
    updateDate: item.kMDItemFSContentChangeDate ?? item.kMDItemContentModificationDate,
    usedDate: item.kMDItemLastUsedDate
  }
  return mappedItem
}

type CompareFn<T> = (a: T, b: T) => number
export interface SortRule<T> {
  propName: keyof T
  sortOrder: SortOrderEnum
}

function compareFn<T>(obj1: T, obj2: T, propName: keyof T): number {
  const a = obj1[propName] ?? null
  const b = obj2[propName] ?? null
  let compare = 0
  if (a === null && b === null) compare = 0
  // a < b
  else if (a === null) compare = -1
  // a > b
  else if (b === null) compare = 1
  else if (a < b) compare = -1
  else if (a > b) compare = 1
  return compare
}

function createCompareFn<T>(...sortRules: Array<SortRule<T>>): CompareFn<T> {
  if (sortRules.length === 0) return () => 0
  return (a: T, b: T) => {
    for (const { propName, sortOrder } of sortRules) {
      const compare = compareFn(a, b, propName)
      if (compare !== 0) return compare * sortOrder
    }
    return 0
  }
}

/**
 * 排序文件 Model 数组
 */
export function sortFileInfos(
  data: Array<BaseFileInfo>,
  fieldName: keyof BaseFileInfo,
  sortOrder: SortOrderEnum
) {
  return data.sort(
    createCompareFn(
      { sortOrder, propName: fieldName },
      { sortOrder: SortOrderEnum.ASC, propName: 'name' }
    )
  )
}

/**
 * 获取拼音匹配的子串
 */
function getPinyinMatches(s: string, pinyins: string[]) {
  const mats: string[] = []
  for (const pinyin of pinyins) {
    let arr = match(s, pinyin, { continuous: true })
    if (!arr?.length) continue

    let lastPos = arr[0]
    for (let i = 1; i < arr.length - 1; i++) {
      if (arr[i] - arr[i - 1] === 1) continue
      mats.push(s.substring(lastPos, arr[i] + 1))
      lastPos = arr[i]
    }
    mats.push(s.substring(lastPos, arr[arr.length - 1] + 1))
  }
  return mats
}

function highlightString(
  pattern: SearchTextPattern,
  source: string,
  style: string,
  recordMatched: boolean = false
) {
  const preTag = `<span style="${style}">`
  const matchStrings = getPinyinMatches(source, pattern.words)
  const p =
    pattern.expression + (matchStrings.length ? '|' + matchStrings.map(escapeRegExp).join('|') : '')
  const matched: boolean[] = recordMatched ? new Array(pattern.words.length).fill(false) : []
  const highlight = source.replaceAll(new RegExp(p, 'ig'), (s, ...args) => {
    if (recordMatched) {
      const index = args.findIndex((value) => !!value)
      matched[index % matched.length] = true
    }
    return preTag + s + `</span>`
  })
  const allMatched: boolean | undefined = recordMatched
    ? matched.reduce((p, c) => p && c, true)
    : undefined
  return { highlight, allMatched }
}

/**
 * 高亮文件 Model 数组中的文件名
 */
export function highlightFileInfo(
  item: BaseFileInfo,
  pattern: SearchTextPattern,
  highlightStyle: string
) {
  const { highlight, allMatched } = highlightString(pattern, item.name, highlightStyle, true)
  item.highlightName = highlight
  if (!allMatched) {
    const { highlight } = highlightString(pattern, getBasename(item.path), highlightStyle)
    item.highlightPath = joinPath(getDirname(item.path), highlight)
  }
  return item
}

export function highlightFileInfos(
  data: Array<BaseFileInfo>,
  pattern: SearchTextPattern,
  highlightStyle: string
) {
  return data.map((item) => highlightFileInfo(item, pattern, highlightStyle))
}
