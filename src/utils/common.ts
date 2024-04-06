import { copyImage, copyFile } from 'utools-api'

export function copyFromPath(path: string, isImage: boolean = false) {
  if (isImage) {
    copyImage(path)
  } else {
    copyFile(path)
  }
}
