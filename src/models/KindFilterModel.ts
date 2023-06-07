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

  constructor(
    id: string | number,
    label: string,
    value: string,
    enabled: boolean = true
  ) {
    this.id = typeof id === 'number' ? id.toString() : id
    this.label = label
    this.value = value
    this.enabled = enabled
  }

  public static readonly ANY = new KindFilterModel(0, '不筛选', '')

  public static DEFAULT_KINDS = this.defaultKindFilters()

  public static defaultKindFilters() {
    let id = 0
    const movieFilter = `${ContentType.MOVIE}!${ContentType.MPEG2_TS}`
    const wordFilter = [
      ContentType.PAGES,
      ContentType.DOC,
      ContentType.DOCX
    ].join('|')
    return [
      new KindFilterModel(id++, '不筛选', ''),
      new KindFilterModel(id++, '图片', ContentType.IMAGE),
      new KindFilterModel(id++, '音频', ContentType.AUDIO),
      new KindFilterModel(id++, '视频', movieFilter),
      new KindFilterModel(id++, 'PDF', ContentType.PDF),
      new KindFilterModel(id++, 'WORD', wordFilter),
      new KindFilterModel(id++, 'EXCEL', ContentType.SPREADSHEET),
      new KindFilterModel(id++, 'PPT', ContentType.PRESENTATION),
      new KindFilterModel(id++, '应用程序', ContentType.APPLICATION, false),
      new KindFilterModel(id++, '文件夹', ContentType.FOLDER, false),
      new KindFilterModel(id++, '压缩包', ContentType.ARCHIVE, false),
      new KindFilterModel(id++, 'MD', ContentType.MARKDOWN, false)
    ]
  }
}

export default KindFilterModel
