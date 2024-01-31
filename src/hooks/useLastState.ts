export function useLastState<T>(compareFn: (a: T, b: T) => boolean = (a: T, b: T) => a === b) {
  const lastState = { value: <Nullable<T>>null }
  return {
    lastState,
    isEqualLast(newValue: T) {
      const ret = lastState.value === null ? false : compareFn(newValue, lastState.value)
      lastState.value = newValue
      return ret
    }
  }
}
