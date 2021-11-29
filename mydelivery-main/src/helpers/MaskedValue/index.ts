import { PropsMaskedValue } from './MaskedValue'

export const Mask = ({ value, pattern }: PropsMaskedValue) => {
  const LetterRegex = /[A-Za-z]/
  const NumberRegex = /[0-9]/
  const RemoveSpecialRegex = /[^0-9A-Z]/gi

  value = value.replace(RemoveSpecialRegex, '')

  if (typeof pattern === 'object') {
    if (pattern.every((p: { replace: (arg0: RegExp, arg1: string) => { (): any; new (): any; length: number } }) => p.replace(RemoveSpecialRegex, '').length < value.length)) {
      pattern = pattern[pattern.length - 1]
    } else {
      for (const ptt of pattern) {
        if (ptt.replace(RemoveSpecialRegex, '').length >= value.length) {
          pattern = ptt
          break
        }
      }
    }
  }

  const arrayPattern = [...pattern]
  let arrayValue = [...value]

  arrayValue = arrayValue.slice(0, pattern.toString().replace(RemoveSpecialRegex, '').length)

  arrayPattern.forEach((p, i) => {
    if (p === 'A') {
      if (arrayValue[i] !== undefined && LetterRegex.test(arrayValue[i])) {
        arrayValue[i] = arrayValue[i].toUpperCase()
      } else if (arrayValue.length) arrayValue[i] = ''
    } else if (p === 'a') {
      if (arrayValue[i] !== undefined && LetterRegex.test(arrayValue[i])) {
        arrayValue[i] = arrayValue[i].toLowerCase()
      } else if (arrayValue.length) arrayValue[i] = ''
    } else if (p === 'Z') {
      if (arrayValue[i] !== undefined && (LetterRegex.test(arrayValue[i]) || NumberRegex.test(arrayValue[i]))) {
        arrayValue[i] = arrayValue[i].toUpperCase()
      } else if (arrayValue.length) arrayValue[i] = ''
    } else if (p === 'z') {
      if (arrayValue[i] !== undefined && (LetterRegex.test(arrayValue[i]) || NumberRegex.test(arrayValue[i]))) {
        arrayValue[i] = arrayValue[i].toLowerCase()
      } else if (arrayValue.length) arrayValue[i] = ''
    } else if (p == '9') {
      if (arrayValue[i] === undefined || !NumberRegex.test(arrayValue[i])) arrayValue[i] = ''
    } else {
      if (value[i] !== undefined) {
        if (i === 0 && value[0] !== p) arrayValue.unshift(p)
        else if (value[i] !== p) arrayValue.splice(i, 0, p)
      }
    }
    value = arrayValue.join('')
  })

  return value
}
