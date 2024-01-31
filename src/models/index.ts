import { FilePreviewType } from '@/constant'

export * from './KindFilterModel'
export * from './SearchScopeModel'
export * from './SettingModel'

// ========================= Raw File Metadata =========================

export interface PrimaryFileMetadata {
  kMDItemContentType: string
  kMDItemKind: string
  kMDItemDisplayName: string
  kMDItemFSSize: string | null
  kMDItemContentCreationDate: string | null
  kMDItemContentModificationDate: string | null
  kMDItemFSCreationDate: string | null
  kMDItemFSContentChangeDate: string | null
  kMDItemLastUsedDate: string | null
  kMDItemUserTags: string[]
}

export interface FindFileMetadata extends PrimaryFileMetadata {
  kMDItemPath: string
}

export interface ExtraFileMetadata {
  kMDItemContentCreationDate?: Date
  kMDItemContentModificationDate?: Date
  kMDItemContentType?: string
  kMDItemContentTypeTree?: string[]
  kMDItemCopyright?: string
  kMDItemExecutableArchitectures?: string[]
  kMDItemFSName?: string
  kMDItemFSNodeCount?: number
  kMDItemFSSize?: number
  kMDItemKind?: string
  kMDItemLastUsedDate?: Date
  kMDItemPixelHeight?: number
  kMDItemPixelWidth?: number
  kMDItemUserTags?: string[]
  kMDItemVersion?: string
}

// ========================= File Info =========================

export interface BaseFileInfo {
  name: string
  highlightName?: string
  path: string
  highlightPath?: string
  icon: string
  size: number | null
  type: string
  kind: string
  createDate?: string | Date | null
  updateDate?: string | Date | null
  usedDate?: string | Date | null
}

export interface PreviewFileInfo extends BaseFileInfo {
  thumbnail?: string
  typeTree: string[]
  previewType: FilePreviewType
  itemCount?: number
  pixelWidth?: number
  pixelHeight?: number
  fileText?: string
  readTextSize?: number
  textEncoding?: string
  files?: Array<SimpleFileInfo>
  tags?: string[]
  version?: string
  architectures?: string[]
  copyright?: string
}

export interface SimpleFileInfo {
  name: string
  isDirectory: boolean
}
