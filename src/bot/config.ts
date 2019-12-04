import * as fs from 'fs';
import * as yargs from 'yargs';
import Configuration from '../lib/classes/Configuration';

const rawConfig: string = fs.readFileSync(yargs.argv.config as string, 'utf8');
export default new Configuration(JSON.parse(rawConfig));
