type KeyFn<T, K> = (item: T, index: number) => K
type ValFn<T, V> = (item: T, index: number) => V

export function toMap<K, V>(arr: V[], keyFn: KeyFn<V, K>): Map<K, V>
export function toMap<T, K, V>(
  arr: T[],
  keyFn: KeyFn<T, K>,
  valFn: ValFn<T, V>
): Map<K, V>

export function toMap<T, K, V>(
  arr: T[],
  keyFn: KeyFn<T, K>,
  valFn?: ValFn<T, V>
): Map<K, V> | Map<K, T> {
  if (valFn) {
    const map = new Map<K, V>()
    arr.forEach((item, index) =>
      map.set(keyFn(item, index), valFn(item, index))
    )
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
