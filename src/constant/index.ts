export * from './enums'

export namespace StoreKey {
  export const SETTING = 'setting'
  export const DISPLAY_MODE = 'displayItemIndex'
  export const IS_PREVIEW_CONTENT = 'enablePreviewContent'
  export const IS_SHOW_RECENT = 'enableShowRecent'
}

export namespace FileConstant {
  export const KB = 1000
  export const MB = KB * 1000
  export const GB = MB * 1000

  export const KiB = 1 << 10
  export const MiB = 1 << 20
  export const GiB = 1 << 30
}

export namespace ContentType {
  export const FOLDER = 'public.folder'

  export const IMAGE = 'public.image'
  export const AUDIO = 'public.audio'

  export const MOVIE = 'public.movie'
  export const MPEG2_TS = 'public.mpeg-2-transport-stream'

  export const PDF = 'com.adobe.pdf'
  export const PRESENTATION = 'public.presentation'

  export const PAGES = 'com.apple.iwork.pages.sfftemplate'
  export const DOC = 'com.microsoft.word.doc'
  export const DOCX = 'org.openxmlformats.wordprocessingml.document'

  export const SPREADSHEET = 'public.spreadsheet'
  export const XLS = 'com.microsoft.excel.xls'
  export const XLSX = 'org.openxmlformats.spreadsheetml.sheet'

  export const TEXT = 'public.text'
  export const PLAIN_TEXT = 'public.plain-text'
  export const MARKDOWN = 'net.daringfireball.markdown'
  export const SOURCE_CODE = 'public.source-code'

  export const ARCHIVE = 'public.archive'

  export const APPLICATION = 'com.apple.application'

  export const EXECUTABLE = 'public.unix-executable'

  export const VOLUME = 'public.volume'

  export const DIRECTORY = 'public.directory'

  export const ITEM = 'public.item'
}

export namespace ScopeName {
  export const HOME = 'home'
  export const SETTING = 'setting'
}
