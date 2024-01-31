export enum DisplayModeEnum {
  LIST = 0,
  PREVIEW = 1
}

export enum SortOrderEnum {
  ASC = 1,
  DESC = -1
}

export enum FilePreviewType {
  NONE,
  FOLDER,
  TEXT,
  PICTURE,
  AUDIO,
  VIDEO
}

export enum SimpleFilterEnum {
  NONE,
  FILE,
  FOLDER
}

export enum FindEndingStatus {
  NORMAL,
  INTERRUPTED
}

// 可通过命令 `mdimport -X` 查看
export enum kMDItem {
  ContentCreationDate = 'kMDItemContentCreationDate',
  ContentModificationDate = 'kMDItemContentModificationDate',
  ContentType = 'kMDItemContentType',
  ContentTypeTree = 'kMDItemContentTypeTree',
  DateAdded = 'kMDItemDateAdded',
  DisplayName = 'kMDItemDisplayName',
  FSContentChangeDate = 'kMDItemFSContentChangeDate',
  FSCreationDate = 'kMDItemFSCreationDate',
  FSCreatorCode = 'kMDItemFSCreatorCode',
  FSFinderFlags = 'kMDItemFSFinderFlags',
  FSHasCustomIcon = 'kMDItemFSHasCustomIcon',
  FSInvisible = 'kMDItemFSInvisible',
  FSIsExtensionHidden = 'kMDItemFSIsExtensionHidden',
  FSIsStationery = 'kMDItemFSIsStationery',
  FSLabel = 'kMDItemFSLabel',
  FSName = 'kMDItemFSName',
  FSNodeCount = 'kMDItemFSNodeCount',
  FSOwnerGroupID = 'kMDItemFSOwnerGroupID',
  FSOwnerUserID = 'kMDItemFSOwnerUserID',
  FSSize = 'kMDItemFSSize',
  FSTypeCode = 'kMDItemFSTypeCode',
  Kind = 'kMDItemKind',
  LogicalSize = 'kMDItemLogicalSize',
  PhysicalSize = 'kMDItemPhysicalSize',
  LastUsedDate = 'kMDItemLastUsedDate',
  TextContent = 'kMDItemTextContent',
  TextContentLanguage = 'kMDItemTextContentLanguage',
  Version = 'kMDItemVersion',
  WhereFroms = 'kMDItemWhereFroms',
  UserTags = 'kMDItemUserTags',
  SupportFileType = 'kMDItemSupportFileType'
}
