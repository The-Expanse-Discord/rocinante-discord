import { System } from '../../Utils';

/**
 * @category System
 */
export default class Configuration {
	public readonly token: string;
	public readonly owner: string;
	public readonly commandPrefix: string;
	public readonly statusType: string;
	public readonly statusText: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public constructor(jsonObject: { [key: string]: string}) {
		this.token = System.getNonNull(jsonObject, 'token');
		this.owner = System.getNonNull(jsonObject, 'owner');
		this.commandPrefix = System.getNonNull(jsonObject, 'commandPrefix');
		this.statusType = System.getNonNull(jsonObject, 'statusType');
		this.statusText = System.getNonNull(jsonObject, 'statusText');
	}
}
