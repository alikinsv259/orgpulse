const NBSP = ' '

export const formatCount = (value: number): string => new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, NBSP)
