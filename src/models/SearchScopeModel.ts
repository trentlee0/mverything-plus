import { getOsUserInfo, getVolumes } from '@/preload'

export class SearchScopeModel {
  public static readonly ROOT_ID = 'root'
  public static readonly USER_ID = 'user'
  public static readonly COMMON_ID = 'common'

  id: string
  label: string
  paths: string[]

  constructor(id: string, label: string, paths: string[]) {
    this.id = id
    this.label = label
    this.paths = paths
  }

  public static readonly ROOT = new SearchScopeModel(SearchScopeModel.ROOT_ID, '这台 Mac', ['/'])

  public static readonly USER = new SearchScopeModel(SearchScopeModel.USER_ID, '', [])

  public static readonly COMMON = new SearchScopeModel(SearchScopeModel.COMMON_ID, '常用', [])

  static {
    const info = getOsUserInfo()
    SearchScopeModel.USER.label = info.username
    SearchScopeModel.USER.paths = [info.homedir]

    SearchScopeModel.COMMON.paths = [
      '/Applications',
      '/System/Applications',
      '/System/Library/CoreServices',
      '/Library/Developer',
      info.homedir
    ]
  }

  private static DEFAULT_SCOPES: SearchScopeModel[] = [
    SearchScopeModel.ROOT,
    SearchScopeModel.USER,
    SearchScopeModel.COMMON
  ]

  public static defaultSearchScopes() {
    return SearchScopeModel.DEFAULT_SCOPES
  }

  public static async refreshDefaultSearchScopes() {
    const scopes = [SearchScopeModel.ROOT]
    const volumes = await getVolumes()
    volumes.forEach((v, index) => {
      scopes.push(new SearchScopeModel(index + v.name, v.name, [v.path]))
    })
    SearchScopeModel.ROOT.paths = ['/', ...volumes.map((v) => v.path)]
    scopes.push(SearchScopeModel.USER)
    scopes.push(SearchScopeModel.COMMON)
    SearchScopeModel.DEFAULT_SCOPES = scopes
    return SearchScopeModel.DEFAULT_SCOPES
  }
}

export default SearchScopeModel
