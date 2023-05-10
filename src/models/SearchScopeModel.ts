import { getOsUserInfo, getVolumes } from '@/preload'

export class SearchScopeModel {
  public static readonly ROOT_ID = 'root'
  public static readonly USER_ID = 'user'

  id: string
  label: string
  paths: string[]

  constructor(id: string, label: string, paths: string[]) {
    this.id = id
    this.label = label
    this.paths = paths
  }

  public static readonly ROOT = new SearchScopeModel(
    SearchScopeModel.ROOT_ID,
    '这台 Mac',
    ['/']
  )

  public static readonly USER = new SearchScopeModel(
    SearchScopeModel.USER_ID,
    '',
    []
  )

  static {
    const info = getOsUserInfo()
    SearchScopeModel.USER.label = info.username
    SearchScopeModel.USER.paths = [info.homedir]
  }

  private static DEFAULT_SCOPES: SearchScopeModel[] = []

  public static defaultSearchScopes(refresh?: boolean) {
    if (!SearchScopeModel.DEFAULT_SCOPES.length || refresh) {
      const scopes = [SearchScopeModel.ROOT]
      getVolumes().forEach((v, index) => {
        scopes.push(new SearchScopeModel(index + v.name, v.name, [v.path]))
      })
      scopes.push(SearchScopeModel.USER)
      SearchScopeModel.DEFAULT_SCOPES = scopes
    }
    return SearchScopeModel.DEFAULT_SCOPES
  }
}

export default SearchScopeModel
