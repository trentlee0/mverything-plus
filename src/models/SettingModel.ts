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
  isUseSubInput: boolean

  constructor() {
    // default setting
    this.databaseVersion = 6
    this.isFindFileContent = false
    this.searchRoot = SearchScopeModel.COMMON_ID
    this.searchScopes = []
    this.searchKey = ':'
    this.keyList = [
      {
        key: 'notlibrary',
        regex: '^((?!Library).)*$'
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
    this.isUseSubInput = true
  }

  public static migrateDatabase(setting: SettingModel): boolean {
    let needed = false
    const check = (version: number) => {
      if (!setting.databaseVersion || setting.databaseVersion < version) {
        setting.databaseVersion = version
        needed = true
        return true
      }
      return false
    }

    const defaultSetting = new SettingModel()
    if (check(1)) {
      setting.fileExtension = defaultSetting.fileExtension
      setting.pictureExtension = defaultSetting.pictureExtension
    }
    if (check(3)) {
      setting.videoExtension = defaultSetting.videoExtension
      setting.audioExtension = defaultSetting.audioExtension
    }
    if (check(4)) {
      setting.isAutoSearch = defaultSetting.isAutoSearch
      setting.isShowFilesInTempDir = defaultSetting.isShowFilesInTempDir
      setting.isUseSystemFileIcon = defaultSetting.isUseSystemFileIcon
    }
    if (check(5)) {
      setting.searchScopes = defaultSetting.searchScopes
      setting.isShowFilesInKind = defaultSetting.isShowFilesInKind
      setting.nameHighlight = defaultSetting.nameHighlight
      setting.kindFilters = defaultSetting.kindFilters
      setting.isOpenAsShortcutting = defaultSetting.isOpenAsShortcutting
    }
    if (check(6)) {
      setting.isUseSubInput = defaultSetting.isUseSubInput
    }
    return needed
  }
}

export default SettingModel
