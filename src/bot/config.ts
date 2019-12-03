import yargs = require('yargs');
import fs = require('fs');

/**
 * Gets the specified key from a JSON, raising an exception if the value is null/undefined
 */
function getNonNull(jsonObject: any, key: string) {
    if (jsonObject[key] == null) {
        throw new Error('Missing required configuration key: ' + key);
    }
    return jsonObject[key];
}

class Configuration {
    token: string;
    owner: string;
    commandPrefix: string;
    statusType: string;
    statusText: string;

    constructor(jsonObject: any) {
        this.token = getNonNull(jsonObject, 'token');
        this.owner = getNonNull(jsonObject, 'owner');
        this.commandPrefix = getNonNull(jsonObject, 'commandPrefix');
        this.statusType = getNonNull(jsonObject, 'statusType');
        this.statusText = getNonNull(jsonObject, 'statusText');
    }
}

const rawConfig = fs.readFileSync(yargs.argv.config as string, 'utf8');
export default new Configuration(JSON.parse(rawConfig));
