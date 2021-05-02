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
	public readonly unlimitedRoles: string[];
	public readonly commandChannels: string[];
	public readonly moderatorUserId: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public constructor(
		{
			welcomeChannels,
			token,
			owner,
			commandPrefix,
			statusType,
			statusText,
			unlimitedRoles,
			commandChannels,
			moderatorUserId,
		}:
		{
			welcomeChannels: Record<string, string>,
			token: string, owner: string,
			commandPrefix: string,
			statusType: string,
			statusText: string,
			unlimitedRoles: string[],
			commandChannels: string[],
			moderatorUserId: string
		}
	) {
		this.token = Configuration.ensureNonNull(token, 'token');
		this.owner = Configuration.ensureNonNull(owner, 'owner');
		this.commandPrefix = Configuration.ensureNonNull(commandPrefix, 'commandPrefix');
		this.statusType = Configuration.ensureNonNull(statusType, 'statusType');
		this.statusText = Configuration.ensureNonNull(statusText, 'statusText');
		this.welcomeChannels = Configuration.ensureNonNull(welcomeChannels, 'welcomeChannels');
		this.unlimitedRoles = Configuration.ensureNonNull(unlimitedRoles, 'unlimitedRoles');
		this.commandChannels = Configuration.ensureNonNull(commandChannels, 'commandChannels');
		this.moderatorUserId = Configuration.ensureNonNull(moderatorUserId, 'moderatorUserId');
	}

	private static ensureNonNull<T>(value: T, key: string) : T {
		if (!value) {
			throw new Error(`Empty value for ${ key } in configuration`);
		}
		return value;
	}
}
