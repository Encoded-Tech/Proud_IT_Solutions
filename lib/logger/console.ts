type LogLevel = 'info' | 'warn' | 'error' | 'success';

const formatMessage = (level: LogLevel, message: string, meta?: object) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} | ${JSON.stringify(meta)}` : base;
};

export const log = {
  info: (message: string, meta?: object) => console.info(formatMessage('info', message, meta)),
  warn: (message: string, meta?: object) => console.warn(formatMessage('warn', message, meta)),
  error: (message: string, meta?: object) => console.error(formatMessage('error', message, meta)),
  success: (message: string, meta?: object) => console.log(formatMessage('success', message, meta)),
};
