import * as fs from 'fs';
import * as path from 'path';
import { Command } from '../System/Command';
import { Message } from 'discord.js';
import { Util } from '../../Utils';
import Protomolecule from '../Client/Protomolecule';

/**
 * @category Handler
 */
export class CommandHandler {
	private readonly client: Protomolecule;

	public constructor(proto: Protomolecule) {
		this.client = proto;
	}

	public init(dir: string): void {
		const commandPath: string = path.resolve(dir);
		this.registerCommands(commandPath);
	}

	public async processCommand(message: Message): Promise<void> {
		const args: string[] = message.content.slice(this.client.prefix.length).split(/ +/);

		let issuedCommand: string | undefined = args.shift();
		issuedCommand = issuedCommand ? issuedCommand.toLowerCase() : '';

		const fetchedCommand: Command | undefined = this.client.commands.get(issuedCommand);

		if (fetchedCommand)
			await fetchedCommand.execute(message, args);
	}

	private registerCommands(dir: string): void {
		fs.readdirSync(dir).forEach(file => {
			const fullPath: string = path.join(dir, file);
			if (fs.lstatSync(fullPath).isDirectory())
				this.registerCommands(fullPath);
			else {
				if (!file.endsWith('.js'))
					return;

				const command: Command = require(`${ fullPath }`);
				const commandClasses: (new () => Command)[] = Util.findCommandClasses(command);

				if (commandClasses.length !== 0)
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
		});
	}
}
