import KindFilterModel from './KindFilterModel'
import SearchScopeModel from './SearchScopeModel'

export interface KeyRegexItem {
  key: string
  regex: string
}

export interface HighlightConfig {
  enabled: boolean
  style: string
}

export class SettingModel {
  databaseVersion: number
  isFindFileContent: boolean
  searchRoot: string
  searchScopes: Array<SearchScopeModel>
  searchKey: ':'
  keyList: Array<KeyRegexItem>
  fileExtension: string
  pictureExtension: string
  audioExtension: string
  videoExtension: string
  isAutoSearch: boolean
  isShowFilesInTempDir: boolean
  isUseSystemFileIcon: boolean
  isShowFilesInKind: boolean
  nameHighlight: HighlightConfig
  kindFilters: Array<KindFilterModel>
  isOpenAsShortcutting: boolean

  constructor() {
    this.databaseVersion = 5
    this.isFindFileContent = false
    this.searchRoot = SearchScopeModel.USER_ID
    this.searchScopes = []
    this.searchKey = ':'
    this.keyList = [
      {
        key: 'zip',
        regex: '\\.zip$|\\.rar$|\\.7z$|\\.gz$|\\.bz2$'
      }
    ]
    this.fileExtension = 'vue,ts,jsx,dart,ps1'
    this.pictureExtension = 'png,jpg,jpeg,webp,gif,svg,ico,bmp'
    this.audioExtension = 'mp3,ogg,wav,m4a'
    this.videoExtension = 'mp4,flv,mov,webm'
    this.isAutoSearch = true
    this.isShowFilesInTempDir = true
    this.isUseSystemFileIcon = false
    this.isShowFilesInKind = true
    this.nameHighlight = {
      enabled: false,
      style: 'color: red;'
    }
    this.kindFilters = KindFilterModel.defaultKindFilters()
    this.isOpenAsShortcutting = false
  }

  public static migrateDatabase(setting: SettingModel): boolean {
    const defaultSetting = new SettingModel()
    let needed = false
    if (!setting.databaseVersion || setting.databaseVersion < 1) {
      setting.databaseVersion = 1
      setting.fileExtension = defaultSetting.fileExtension
      setting.pictureExtension = defaultSetting.pictureExtension
      needed = true
    }
    if (!setting.databaseVersion || setting.databaseVersion < 2) {
      setting.databaseVersion = 2
      needed = true
    }
    if (!setting.databaseVersion || setting.databaseVersion < 3) {
      setting.databaseVersion = 3
      setting.videoExtension = defaultSetting.videoExtension
      setting.audioExtension = defaultSetting.audioExtension
      needed = true
    }
    if (!setting.databaseVersion || setting.databaseVersion < 4) {
      setting.databaseVersion = 4
      setting.isAutoSearch = defaultSetting.isAutoSearch
      setting.isShowFilesInTempDir = defaultSetting.isShowFilesInTempDir
      setting.isUseSystemFileIcon = defaultSetting.isUseSystemFileIcon
      needed = true
    }
    if (!setting.databaseVersion || setting.databaseVersion < 5) {
      setting.databaseVersion = 5
      setting.searchScopes = defaultSetting.searchScopes
      setting.isShowFilesInKind = defaultSetting.isShowFilesInKind
      setting.nameHighlight = defaultSetting.nameHighlight
      setting.kindFilters = defaultSetting.kindFilters
      setting.isOpenAsShortcutting = defaultSetting.isOpenAsShortcutting
      needed = true
    }
    return needed
  }
}

export default SettingModel
