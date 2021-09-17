import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { Format } from 'logform';
import { configDiscordClient } from '../Infrastructure/Client/Config';

const { format } = winston;

const rocinanteFormat: Format =
format.printf(({ level, message, timestamp }) => `${ timestamp } ${ level }: ${ message }`);

const transports : Transport[] = [ new winston.transports.Console({}) ];
const logFile : string | null = configDiscordClient.logFile;
if (logFile) {
	transports.push(new winston.transports.File({
		filename: logFile,
		maxsize: 10 * 1024 * 1024,
		maxFiles: 5,
		tailable: true,
	}));
}

export default winston.createLogger({
	level: 'info',
	format: format.combine(format.timestamp(), rocinanteFormat),
	transports,
});
