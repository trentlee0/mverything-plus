import { FileConstant } from '@/constant'
import dayjs from 'dayjs'

export function formatDatetime(datetime: string) {
  if (!datetime) return ''
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

export function normalDecimal(num: number) {
  return num.toFixed(2)
}

export function handleBytesToHuman(byteSize: number) {
  if (byteSize > FileConstant.GB)
    return normalDecimal(byteSize / FileConstant.GB) + ' GB'
  if (byteSize > FileConstant.MB)
    return normalDecimal(byteSize / FileConstant.MB) + ' MB'
  if (byteSize > FileConstant.KB)
    return normalDecimal(byteSize / FileConstant.KB) + ' KB'
  if (byteSize >= 0) return byteSize + ' B'
  return ''
}

export function getFileExtension(filename: string) {
  if (!filename) return ''
  let index = filename.lastIndexOf('.') || 0
  if (index > 0) {
    return filename.substring(index + 1, filename.length).toLowerCase()
  }
  return ''
}
