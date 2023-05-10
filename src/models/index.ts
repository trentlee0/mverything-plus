import { FilePreviewType } from '@/constant'

export * from './KindFilterModel'
export * from './SearchScopeModel'
export * from './SettingModel'

// ========================= Raw File Metadata =========================

export interface PrimaryFileMetadata {
  kMDItemContentType: string
  kMDItemKind: string
  kMDItemFSName: string
  kMDItemFSSize: string | null
  kMDItemFSCreationDate: string
  kMDItemFSContentChangeDate: string
  kMDItemLastUsedDate: string | null
}

export interface FindFileMetadata extends PrimaryFileMetadata {
  kMDItemPath: string
}

export interface ExtraFileMetadata {
  contentCreationDate: Date
  contentModificationDate?: Date
  contentType: string
  contentTypeTree: string[]
  fsName: string
  fsNodeCount?: number
  fsSize: number
  kind: string
  lastUsedDate?: Date
  pixelHeight?: number
  pixelWidth?: number
  userTags?: string[]
}

// ========================= File Info =========================

export interface BaseFileInfo {
  name: string
  nameHighlight?: string
  path: string
  icon: string
  size: number | null
  type: string
  kind: string
  createDate: string
  updateDate: string | null
  usedDate: string | null
}

export interface PreviewFileInfo extends BaseFileInfo {
  thumbnail?: string
  typeTree: string[]
  previewType: FilePreviewType
  itemCount?: number
  pixelWidth?: number
  pixelHeight?: number
  fileText?: string
  files?: Array<SimpleFileInfo>
}

export interface SimpleFileInfo {
  name: string
  isFile: boolean
}
