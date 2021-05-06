import * as winston from 'winston';
import { Format } from 'logform';

const { format } = winston;

const rocinanteFormat: Format =
format.printf(({ level, message, timestamp }) => `${ timestamp } ${ level }: ${ message }`);

export default winston.createLogger({
	level: 'info',
	format: format.combine(format.timestamp(), rocinanteFormat),
	transports: [
		new winston.transports.Console({
		}),
	],
});
