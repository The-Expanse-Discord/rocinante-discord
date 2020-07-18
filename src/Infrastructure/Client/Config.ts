import * as fs from 'fs';
import * as yargs from 'yargs';
import Configuration from '../System/Configuration';

/** @internal */
const rawConfig: string = fs.readFileSync(yargs.argv.config as string, 'utf8');

/** @internal */
const configDiscordClient: Configuration = new Configuration(JSON.parse(rawConfig));

export { configDiscordClient };
