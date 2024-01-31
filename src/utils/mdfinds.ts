class CQueue<T> {
  private data: Array<T>
  private front = 0
  private rear = 0

  constructor(capacity: number) {
    this.data = new Array(capacity + 1)
  }

  isEmpty() {
    return this.front === this.rear
  }

  isFull() {
    return (this.rear + 1) % this.data.length === this.front
  }

  peekLast() {
    return this.isEmpty()
      ? null
      : this.data[(this.rear - 1 + this.data.length) % this.data.length]
  }

  peekFirst() {
    return this.isEmpty() ? null : this.data[this.front]
  }

  add(el: T) {
    if (this.isFull()) {
      this.front = (this.front + 1) % this.data.length
    }
    this.data[this.rear] = el
    this.rear = (this.rear + 1) % this.data.length
  }
}

export class FindTask {
  id: number
  interrupted: boolean
  end: boolean

  constructor() {
    this.id = Date.now()
    this.interrupted = false
    this.end = false
  }
}

export class MdfindProcessManager {
  private terminateFunc: Nullable<() => boolean> = null
  private window = new CQueue<FindTask>(10)

  add(mdfindReturn: { terminate: () => boolean }) {
    this.terminateFunc = mdfindReturn.terminate
    const task = new FindTask()
    this.window.add(task)
    return task
  }

  /**
   * 终止当前正在执行的任务
   * @returns 如果有任务正在执行，返回 `boolean`，否则返回 `null`
   */
  killCurrent() {
    if (this.window.isEmpty()) return null
    const res = this.kill()
    const last = this.window.peekLast()!
    if (!last.end) {
      last.interrupted = true
    }
    return res
  }

  private kill() {
    if (this.terminateFunc) {
      const res = this.terminateFunc()
      if (import.meta.env.DEV) {
        console.log('terminate mdfind')
      }
      this.terminateFunc = null
      return res
    }
    // 没有任务在执行，返回 null
    return null
  }

  markTaskAsEnd(task: FindTask) {
    task.end = true
  }

  isLastTask(task: FindTask) {
    return task.id === this.window.peekLast()?.id
  }

  isInterruptLastTask() {
    return this.terminateFunc === null
  }
}
