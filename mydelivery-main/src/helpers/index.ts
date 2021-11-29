export const numberToCurrency = (value: number, currency: string = 'R$') => {
  return `${currency} ${value.toFixed(2).replace('.', ',')}`
}

export const convertDateTime = (date: string) => {
  const dateTime = new Date(date)
  const day = dateTime.getDate()
  const month = dateTime.getMonth() + 1
  const year = dateTime.getFullYear()
  const hours = dateTime.getHours()
  const minutes = dateTime.getMinutes()

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
