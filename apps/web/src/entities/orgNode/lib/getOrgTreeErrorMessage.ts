import { ClientErrorCode, isApiError } from '@/shared/api'

const FALLBACK_MESSAGE = 'Не удалось загрузить орг-структуру. Попробуйте ещё раз.'

const MESSAGE_BY_CODE: Record<string, string> = {
  [ClientErrorCode.NETWORK_ERROR]: 'Сервер недоступен. Проверьте, что API запущен на порту 4001.',
  [ClientErrorCode.INVALID_RESPONSE]: 'Сервер вернул данные в неожиданном формате — показать структуру нельзя.',
  NOT_FOUND: 'Эндпоинт орг-структуры не найден на сервере.',
  INTERNAL: 'Сервер не смог отдать орг-структуру. Попробуйте позже.',
}

export const getOrgTreeErrorMessage = (error: unknown): string => {
  if (!isApiError(error)) return FALLBACK_MESSAGE

  return MESSAGE_BY_CODE[error.code] ?? FALLBACK_MESSAGE
}
