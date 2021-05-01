import { Command } from '../System/Command';
import { Message, GuildMember, User, PartialUser } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';
import RateLimiter from '../Managers/RateLimiter';

/**
 * @category Handler
 */
export class CommandHandler {
	private readonly client: Protomolecule;
	private readonly limiters: Record<string, RateLimiter>;
	private readonly unlimitedRoles: string[];
	private readonly commandChannels: string[];
	private readonly allCommandChannels: boolean;

	public constructor(proto: Protomolecule, unlimitedRoles: string[], commandChannels: string[]) {
		this.limiters = {};
		this.client = proto;
		this.unlimitedRoles = unlimitedRoles;
		this.commandChannels = commandChannels;
		this.allCommandChannels = commandChannels.includes('all');
	}

	public init(commands: (new () => Command)[]): void {
		this.registerCommands(commands);
		this.listen();
	}

	public listen(): void {
		this.client.on('message', async(message: Message) => {
			if (!message.content.startsWith(this.client.prefix) || message.author.bot) {
				return;
			}

			await this.processCommand(message);
		});
	}

	public async processCommand(message: Message): Promise<void> {
		if (!this.allCommandChannels && !this.commandChannels.includes(message.channel.id)) {
			return;
		}
		const args: string[] = message.content.slice(this.client.prefix.length).split(/ +/);

		let issuedCommand: string | undefined = args.shift();
		issuedCommand = issuedCommand ? issuedCommand.toLowerCase() : '';

		const fetchedCommand: Command | undefined = this.client.commands.get(issuedCommand);

		if (fetchedCommand && message.member) {
			if (fetchedCommand.roles.length === 0 || this.hasRoles(message.member, fetchedCommand)) {
				let ticketDebitAmount: number = 0;
				const uniqueId: string = message.member.toString();
				if (this.hasUnlimitedRoles(message.member)) {
					ticketDebitAmount = 0;
				} else {
					ticketDebitAmount = 1;
				}
				const limiter : RateLimiter = this.limiters[fetchedCommand.name];

				if (limiter.tryRemoveTokens(uniqueId, ticketDebitAmount)) {
					await fetchedCommand.execute(message, args);
				} else {
					await CommandHandler.rateLimitWarnUser(fetchedCommand.command,
						message.member.user,
						limiter.numberOfIntervalsUntilAmountCanBeRemoved(uniqueId, ticketDebitAmount));
				}
			}
		}
	}

	private static async rateLimitWarnUser(commands: string[], user: User | PartialUser, wait: number): Promise<void> {
		try {
			console.log('trying to message user');
			console.log('command used: ', commands);
			const message: string = 'Command(s): \''.concat(commands.toString(),
				'\' are being used too quickly.  Please wait ',
				Math.round(wait).toString(),
				' second(s) before using this command again.');
			await user.send(message);
		} catch (error) {
			console.log('Something went wrong when sending user a rate limit message: ', error);
			return;
		}
	}

	private registerCommands(commandClasses: (new () => Command)[]): void {
		for (const commandClass of commandClasses) {
			const commandInstance: Command = new commandClass;

			this.limiters[commandInstance.name] = new RateLimiter(1000,
				commandInstance.commandsPerMinute / 60,
				commandInstance.commandSurgeMax);
			for (const cmd in commandInstance.command) {
				if ({}.hasOwnProperty.call(commandInstance.command, cmd)) {
					this.client.commands.set(
						commandInstance.command[cmd].toLowerCase(),
						commandInstance.init(this.client)
					);
				}
			}

			console.log(`${ commandInstance.name } loaded`);
		}
	}

	private hasRoles(member: GuildMember, command: Command): boolean {
		if (member.roles.cache.filter(role => command.roles.includes(role.name)).size > 0) {
			return true;
		}
		return false;
	}

	private hasUnlimitedRoles(member: GuildMember): boolean {
		if (member.roles.cache.some(role => this.unlimitedRoles.includes(role.name))) {
			return true;
		}
		return false;
	}
}
