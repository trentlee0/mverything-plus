type KeyFn<T, K> = (item: T, index: number) => K
type ValFn<T, V> = (item: T, index: number) => V

export function toMap<K, V>(arr: V[], keyFn: KeyFn<V, K>): Map<K, V>
export function toMap<T, K, V>(arr: T[], keyFn: KeyFn<T, K>, valFn: ValFn<T, V>): Map<K, V>

export function toMap<T, K, V>(arr: T[], keyFn: KeyFn<T, K>, valFn?: ValFn<T, V>): Map<K, V> | Map<K, T> {
  if (valFn) {
    const map = new Map<K, V>()
    arr.forEach((item, index) => map.set(keyFn(item, index), valFn(item, index)))
    return map
  }
  const map = new Map<K, T>()
  arr.forEach((item, index) => map.set(keyFn(item, index), item))
  return map
}

export function isIllegalIndex(arr: any[], index: number) {
  return index < 0 || index >= arr.length
}

export function isLegalIndex(arr: any[], index: number) {
  return !isIllegalIndex(arr, index)
}

export function limitArray<T>(arr: T[], limit?: number) {
  return limit !== undefined && arr.length > limit ? arr.slice(0, limit) : arr
}

export function getFinalIndex<T>(arr: T[], index: number) {
  return arr.length ? Math.min(index, arr.length - 1) : undefined
}

export class SortedSet<T> {
  private list: Array<T>
  private map: Map<T, number>

  constructor() {
    this.list = new Array()
    this.map = new Map()
  }

  add(value: T) {
    this.list.push(value)
    this.map.set(value, this.list.length - 1)
  }

  remove(value: T) {
    const index = this.map.get(value)
    if (index !== undefined) {
      this.list.splice(index, 1)
      for (let i = index; i < this.list.length; i++) {
        this.map.set(this.list[i], i)
      }
      return this.map.delete(value)
    }
    return false
  }

  clear() {
    this.list = new Array()
    this.map.clear()
  }

  has(value: T) {
    return this.map.has(value)
  }

  first() {
    return this.list[0]
  }

  last() {
    return this.list[this.list.length - 1]
  }

  getList() {
    return this.list
  }

  size() {
    return this.list.length
  }

  isEmpty() {
    return this.list.length === 0
  }
}
