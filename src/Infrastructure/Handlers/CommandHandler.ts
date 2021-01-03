import { Command } from '../System/Command';
import { Message, GuildMember } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';

/**
 * @category Handler
 */
export class CommandHandler {
	private readonly client: Protomolecule;

	public constructor(proto: Protomolecule) {
		this.client = proto;
	}

	public init(commands: (new () => Command)[]): void {
		this.registerCommands(commands);
	}

	public async processCommand(message: Message): Promise<void> {
		const args: string[] = message.content.slice(this.client.prefix.length).split(/ +/);

		let issuedCommand: string | undefined = args.shift();
		issuedCommand = issuedCommand ? issuedCommand.toLowerCase() : '';

		const fetchedCommand: Command | undefined = this.client.commands.get(issuedCommand);

		if (fetchedCommand && message.member)
			if (fetchedCommand.roles.length === 0 || this.hasRoles(message.member, fetchedCommand))
				await fetchedCommand.execute(message, args);
	}

	private registerCommands(commandClasses: (new () => Command)[]): void {
		for (const commandClass of commandClasses) {
			const commandInstance: Command = new commandClass;

			for (const cmd in commandInstance.command)
				if ({}.hasOwnProperty.call(commandInstance.command, cmd))
					this.client.commands.set(
						commandInstance.command[cmd].toLowerCase(),
						commandInstance.init(this.client)
					);

			console.log(`${ commandInstance.name } loaded`);
		}
	}

	private hasRoles(member: GuildMember, command: Command): boolean {
		if (member.roles.cache.filter(role => command.roles.includes(role.name)).size > 0)
			return true;
		return false;
	}
}
