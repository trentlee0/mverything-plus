import { FileConstant } from '@/constant'
import dayjs from 'dayjs'

export function formatDatetime(datetime?: Nullable<string | Date>) {
  if (!datetime) return ''
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

export function formatDecimal(num: number) {
  const fraction = num % 1
  if (fraction < 0.1) return Math.floor(num).toString()
  if (fraction > 0.9) return Math.ceil(num).toString()
  return num.toFixed(1)
}

export function formatBytesToHuman(bytes: number) {
  if (bytes > FileConstant.GB) return formatDecimal(bytes / FileConstant.GB) + ' GB'
  if (bytes > FileConstant.MB) return formatDecimal(bytes / FileConstant.MB) + ' MB'
  if (bytes > FileConstant.KB) return formatDecimal(Math.round(bytes / FileConstant.KB)) + ' KB'
  if (bytes >= 0) return bytes + ' B'
  return ''
}

export function formatNumberToThousands(num: number, separator = ',') {
  const s = num.toString()
  const n = s.length
  let res = ''
  let i = n - 3
  while (i >= 0) {
    res = s.slice(i, i + 3) + (i !== n - 3 ? separator : '') + res
    i -= 3
  }
  i += 3
  return s.slice(0, i) + (i > 0 && n - i > 0 ? separator : '') + res
}

export function formatBytesToThousands(bytes: number) {
  return formatNumberToThousands(bytes) + ' 字节'
}

export function formatArchitectures(architectures?: string[]) {
  if (!architectures?.length) return ''
  if (architectures.length === 1) {
    switch (architectures[0]) {
      case 'x86_64':
        return 'Intel'
      case 'arm64':
        return 'Apple 芯片'
    }
  }
  return '通用'
}

export function getFileExtension(filename: string) {
  if (!filename) return ''
  let index = filename.lastIndexOf('.') || 0
  if (index > 0) {
    return filename.substring(index + 1, filename.length).toLowerCase()
  }
  return ''
}

export function decodeUnicode(s: string) {
  return String.fromCharCode(
    ...s
      .split(/\\[uU]/)
      .slice(1)
      .map((code) => parseInt(code, 16))
  )
}

export function escapeQuote(s: string) {
  return s.replace(/"/g, '\\"')
}
