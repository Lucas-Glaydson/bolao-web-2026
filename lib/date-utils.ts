import { format, formatDistance, isPast, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDate = (date: string | Date | undefined | null, pattern: string = 'dd/MM/yyyy'): string => {
  if (!date) return 'Data não disponível'
  
  try {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return 'Data inválida'
    }
    return format(parsedDate, pattern, { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return 'Data não disponível'
  
  try {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return 'Data inválida'
    }
    return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

export const formatRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return 'Data não disponível'
  
  try {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return 'Data inválida'
    }
    return formatDistance(parsedDate, new Date(), {
      addSuffix: true,
      locale: ptBR,
    })
  } catch (error) {
    return 'Data inválida'
  }
}

export const canPredictMatch = (matchDate: string | undefined | null, deadlineHours: number = 1): boolean => {
  if (!matchDate) return false
  
  try {
    const parsedDate = new Date(matchDate)
    if (isNaN(parsedDate.getTime())) {
      return false
    }
    const deadline = subHours(parsedDate, deadlineHours)
    return !isPast(deadline)
  } catch (error) {
    return false
  }
}

export const getDeadline = (matchDate: string | undefined | null, deadlineHours: number = 1): Date | null => {
  if (!matchDate) return null
  
  try {
    const parsedDate = new Date(matchDate)
    if (isNaN(parsedDate.getTime())) {
      return null
    }
    return subHours(parsedDate, deadlineHours)
  } catch (error) {
    return null
  }
}
