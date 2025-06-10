import winston from 'winston';

const consoleFormat = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.errors({stack: true}),
    winston.format.colorize(),
    winston.format.printf(({timestamp, level, message, ...meta}) => {
        let log = `${timestamp} [${level}] ${message}`;

        if(Object.keys(meta).length > 0) {
            log += '\n' + JSON.stringify(meta, null, 2);
        }

        return log;
    })
);

export const logger = winston.createLogger({
    level: 'info',
  defaultMeta: {
    service: 'retool-rpc-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
  ],
  
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
})

export default logger;