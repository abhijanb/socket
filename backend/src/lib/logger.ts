import pino from 'pino'

const isDevelopment = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

const levelMap: Record<string, pino.Level> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
}

export const authLogger = {
  get level() {
    return logger.level as 'debug' | 'info' | 'warn' | 'error'
  },
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]) => {
    const pinoLevel = levelMap[level] || 'info'
    logger[pinoLevel]({ ...args }, message)
  },
}