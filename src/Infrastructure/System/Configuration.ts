/**
 * @category System
 */
export default class Configuration {
	public readonly token: string;
	public readonly owner: string;
	public readonly commandPrefix: string;
	public readonly statusType: string;
	public readonly statusText: string;
	public readonly welcomeChannels: Record<string, string>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public constructor(
		{
			welcomeChannels,
			token,
			owner,
			commandPrefix,
			statusType,
			statusText
		}:
		{
			welcomeChannels: Record<string, string>,
			token: string, owner: string,
			commandPrefix: string,
			statusType: string,
			statusText: string
		}
	) {
		this.token = Configuration.ensureNonNull(token, 'token');
		this.owner = Configuration.ensureNonNull(owner, 'owner');
		this.commandPrefix = Configuration.ensureNonNull(commandPrefix, 'commandPrefix');
		this.statusType = Configuration.ensureNonNull(statusType, 'statusType');
		this.statusText = Configuration.ensureNonNull(statusText, 'statusText');
		this.welcomeChannels = welcomeChannels;
	}

	private static ensureNonNull(value: string, key: string) : string {
		if (!value) {
			throw new Error(`Empty value for ${ key } in configuration`);
		}
		return value;
	}
}
