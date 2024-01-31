import { XMLParser } from 'fast-xml-parser'

interface TextTag {
  [prop: string]: Array<{ '#text': string }>
}

interface ArrayTag {
  array: Array<TextTag>
}

interface DictTag {
  [prop: string]: any
}

type TagObject = TextTag | ArrayTag | DictTag

function tagText<T extends TextTag>(tagObject: T, key: string) {
  const arr = tagObject[key]
  return arr.length >= 1 ? arr[0]['#text'] : ''
}

export type TagValue = string | number | Date | boolean | object | { type: string }

function parseTagValue(tagObject: TagObject): TagValue | TagValue[] {
  const key = Object.keys(tagObject)[0]
  if (key === 'array') {
    return (tagObject as ArrayTag).array.map(parseTagValue) as TagValue[]
  }

  if (key === 'dict') {
    const obj: any = {}
    const dict = (tagObject as DictTag)[key]
    for (let i = 0; i < dict?.length; i += 2) {
      const key = tagText(dict[i], 'key')
      const value = parseTagValue(dict[i + 1])
      obj[key] = value
    }
    return obj
  }

  if (key === 'true') return true
  if (key === 'false') return false

  const text = tagText(tagObject as TextTag, key)
  if (key === 'string') return text
  if (key === 'integer') return parseInt(text)
  if (key === 'date') return new Date(text)
  return { type: key }
}

export function parsePlist<T extends TagValue>(data: string): T {
  const parser = new XMLParser({
    parseTagValue: false,
    ignoreDeclaration: true,
    preserveOrder: true
  })
  const obj = parser.parse(data)
  return parseTagValue(obj[0]?.['plist'][0]) as T
}
