import { ContentType } from '@/constant'

/**
 * 文件类型筛选
 */
export class KindFilterModel {
  id: string
  label: string
  // 规则：多个文件类型用 `|` 分隔开，排除用 `!`
  value: string
  enabled: boolean

  constructor(id: string, label: string, value: string) {
    this.id = id
    this.label = label
    this.value = value
    this.enabled = true
  }

  public static readonly ANY = new KindFilterModel('0', '不筛选', '')

  public static DEFAULT_KINDS = this.defaultKindFilters()

  public static defaultKindFilters() {
    return [
      new KindFilterModel('0', '不筛选', ''),
      new KindFilterModel('1', '图片', ContentType.IMAGE),
      new KindFilterModel('2', '音频', ContentType.AUDIO),
      new KindFilterModel(
        '3',
        '视频',
        `${ContentType.MOVIE}!${ContentType.MPEG2_TS}`
      ),
      new KindFilterModel('4', 'PDF', ContentType.PDF),
      new KindFilterModel(
        '5',
        'WORD',
        [ContentType.PAGES, ContentType.DOC, ContentType.DOCX].join('|')
      ),
      new KindFilterModel('6', 'EXCEL', ContentType.SPREADSHEET),
      new KindFilterModel('7', 'PPT', ContentType.PRESENTATION)
    ]
  }
}

export default KindFilterModel
