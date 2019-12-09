import { Util } from '../util';

export default class Configuration {
	public readonly token: string;
	public readonly owner: string;
	public readonly commandPrefix: string;
	public readonly statusType: string;
	public readonly statusText: string;

	public constructor(jsonObject: {}) {
		this.token = Util.getNonNull(jsonObject, 'token');
		this.owner = Util.getNonNull(jsonObject, 'owner');
		this.commandPrefix = Util.getNonNull(jsonObject, 'commandPrefix');
		this.statusType = Util.getNonNull(jsonObject, 'statusType');
		this.statusText = Util.getNonNull(jsonObject, 'statusText');
	}
}
