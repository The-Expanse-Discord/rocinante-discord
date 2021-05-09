import { Command } from '../System/Command';
import { Collection, Message, GuildMember, User, PartialUser } from 'discord.js';
import Rocinante from '../Client/Rocinante';
import RateLimiter from '../Managers/RateLimiter';
import logger from '../../Utils/logger';

/**
 * @category Handler
 */
export class CommandHandler {
	private readonly client: Rocinante;
	private readonly limiters: Record<string, RateLimiter>;
	private readonly unlimitedRoles: string[];
	private readonly commandChannels: string[];
	private readonly allCommandChannels: boolean;
	private readonly commands: Collection<string, Command>;

	public constructor(proto: Rocinante, unlimitedRoles: string[], commandChannels: string[]) {
		this.limiters = {};
		this.client = proto;
		this.unlimitedRoles = unlimitedRoles;
		this.commandChannels = commandChannels;
		this.allCommandChannels = commandChannels.includes('all');
		this.commands = new Collection;
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

		if (args[0] === 'help') {
			await this.processHelp(message, args);
			return;
		}

		let issuedCommand: string | undefined = args.shift();
		issuedCommand = issuedCommand ? issuedCommand.toLowerCase() : '';

		const fetchedCommand: Command | undefined = this.commands.get(issuedCommand);

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

	private async processHelp(message: Message, args: string[]): Promise<void> {
		if (args.length === 1) {
			// No specific help requested, list commands
			await this.topLevelHelp(message);
		} else {
			await this.commandHelp(message, args);
		}
	}

	private async commandHelp(message: Message, args: string[]): Promise<void> {
		const maybeCommand: Command | undefined = this.commands.find(command => command.command.includes(args[1]));
		if (maybeCommand) {
			const command: Command = maybeCommand;

			const argumentDescriptions: string = command.argumentDescriptions.map(
				description => `    ${ description.name.padEnd(8, ' ') }${ description.description }`
			).join('\n');

			const argumentHelp: string = argumentDescriptions.length > 0 ?
				`Arguments:\n${ argumentDescriptions }\n\n` : '';

			const help: string = '```\n' +
				`${ command.description }\n\n` +
				`Usage: ${ command.usage.replace('<prefix>', this.client.prefix) }\n\n` +
				`${ argumentHelp }` +
				'```';
			await message.channel.send(help);
		} else {
			await message.channel.send('```Unrecognized Command. Use ' +
				`'${ this.client.prefix }help' to get a list of commands` +
				'```');
		}
	}

	private async topLevelHelp(message: Message): Promise<void> {
		const commandList: string = this.commands.array()
			.map(command => `    ${ command.command.join(',').padEnd(10, ' ') }${ command.description }`)
			.join('\n');

		const help: string = '```\nRocinante Help\n\n' +
			`Use '${ this.client.prefix }help <command>' to get details about a specific command\n\n` +
			'Commands:\n' +
			`${ commandList }` +
			'```';
		await message.channel.send(help);
	}

	private static async rateLimitWarnUser(commands: string[], user: User | PartialUser, wait: number): Promise<void> {
		try {
			logger.info('trying to message user');
			logger.info('command used: ', commands);
			const message: string = 'Command(s): \''.concat(commands.toString(),
				'\' are being used too quickly.  Please wait ',
				Math.round(wait).toString(),
				' second(s) before using this command again.');
			await user.send(message);
		} catch (error) {
			logger.info('Something went wrong when sending user a rate limit message: ', error);
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
					this.commands.set(
						commandInstance.command[cmd].toLowerCase(),
						commandInstance.init(this.client)
					);
				}
			}

			logger.info(`${ commandInstance.name } loaded`);
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
