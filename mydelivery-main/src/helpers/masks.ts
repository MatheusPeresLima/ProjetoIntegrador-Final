import capitalize from 'capitalize'
import { Mask } from './MaskedValue'

interface PropsMask {
  target: EventTarget & HTMLInputElement
}

export const MaskNumber = ({ target }: PropsMask, max?: number) => {
  if (max) target.maxLength = max
  let value = target.value
  value = value.replace(/\D/g, '')
  target.value = value
  return value
}

export const MaskStringsWords = ({ target }: PropsMask) => {
  let v = target.value
  v = v.replace(/\s{2,}/g, ' ')
  v = capitalize.words(v)
  return v
}

export const MaskUpperCase = ({ target }: PropsMask) => target.value.toUpperCase()

export const MaskLowerCase = ({ target }: PropsMask) => target.value.toLowerCase()

export const MaskCpf = ({ target }: PropsMask) => Mask({ value: target.value, pattern: '999.999.999-99' })

export const MaskCnpj = ({ target }: PropsMask) => Mask({ value: target.value, pattern: '99.999.999/9999-99' })

export const MaskCep = ({ target }: PropsMask) => Mask({ value: target.value, pattern: '99999-999' })

export const MaskTelCel = ({ target }: PropsMask) => Mask({ value: target.value, pattern: ['(99) 9999-9999', '(99) 9 9999-9999'] })
export const MaskTel = ({ target }: PropsMask) => Mask({ value: target.value, pattern: '(99) 9999-9999' })
export const MaskCel = ({ target }: PropsMask) => Mask({ value: target.value, pattern: '(99) 9 9999-9999' })

export const MaskPlaca = ({ target }: PropsMask) => Mask({ value: target.value, pattern: 'AAA-9Z99' })
