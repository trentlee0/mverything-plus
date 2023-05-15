import { SortTypeEnum } from '@/constant'
import * as icons from './icons'
import { isNull } from 'lodash'
import { BaseFileInfo, FindFileMetadata } from '@/models'

/**
 * 根据自定义关键字过滤，并映射到文件 Model 数组
 */
export function mapToFileInfos(
  items: Array<FindFileMetadata>,
  customKeyword: string,
  keyMap: Map<string, string>
): Array<BaseFileInfo> {
  // 处理自定义关键字过滤
  if (customKeyword) {
    const regex = keyMap.get(customKeyword)
    if (regex) {
      const re = new RegExp(regex, 'i')
      items = items.filter((item) => {
        return item.kMDItemPath.search(re) > 0
      })
    }
  }

  const ans: Array<BaseFileInfo> = []
  for (const item of items) {
    if (!item) continue

    const mappedItem: BaseFileInfo = {
      name: item.kMDItemFSName,
      path: item.kMDItemPath,
      icon: icons.getIcon(item),
      size: isNull(item.kMDItemFSSize) ? null : parseInt(item.kMDItemFSSize),
      kind: item.kMDItemKind,
      type: item.kMDItemContentType,
      createDate: item.kMDItemFSCreationDate,
      updateDate: item.kMDItemFSContentChangeDate,
      usedDate: item.kMDItemLastUsedDate
    }
    ans.push(mappedItem)
  }

  return ans
}

function compareByPropFn(propName: string, sortType: SortTypeEnum) {
  return (obj1: any, obj2: any) => {
    const a = obj1[propName]
    const b = obj2[propName]
    let compare = 0
    if (a < b) compare = -1
    else if (a > b) compare = 1
    return compare * sortType
  }
}

/**
 * 排序文件 Model 数组
 */
export function sortFileInfos(
  data: Array<BaseFileInfo>,
  fieldName: keyof BaseFileInfo,
  sortType: SortTypeEnum
) {
  return data.sort(compareByPropFn(fieldName, sortType))
}

/**
 * 高亮文件 Model 数组中的文件名
 */
export function highlightFileInfos(
  searchRegExp: RegExp,
  data: Array<BaseFileInfo>,
  highlightStyle: string
) {
  const preTag = `<span style="${highlightStyle}">`
  return data.map((item) => {
    const { name } = item
    item.nameHighlight = name.replaceAll(
      searchRegExp,
      (s) => preTag + s + `</span>`
    )
    return item
  })
}
