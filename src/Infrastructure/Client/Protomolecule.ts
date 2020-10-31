import * as Path from 'path';
import { ActivityType, Client, ClientOptions, Collection } from 'discord.js';
import { Command } from '../System/Command';
import { CommandHandler, EventHandler } from '../Handlers';
import { configDiscordClient } from './Config';
import { Connection } from 'typeorm';

/**
 * ## Protomolecule
 * The heart of Protomolecule.
 *
 * @category System
 */
export default class Protomolecule extends Client {
	public readonly prefix: string;

	public statusType: ActivityType;
	public statusText: string;

	public eventHandler: EventHandler;
	public commandHandler: CommandHandler;

	public database: Connection;
	public commands: Collection<string, Command>;

	public constructor(dbConnection: Connection, clientOptions?: ClientOptions) {
		super(clientOptions);

		this.token = configDiscordClient.token;

		this.prefix = configDiscordClient.commandPrefix;

		this.statusType = configDiscordClient.statusType as ActivityType;
		this.statusText = configDiscordClient.statusText;

		this.eventHandler = new EventHandler(this);
		this.commandHandler = new CommandHandler(this);

		this.database = dbConnection;
		this.commands = new Collection;
	}

	public async start(): Promise<void> {
		await this.init();
	}

	private async init(): Promise<void> {
		try {
			this.eventHandler.listen();
		} catch (error) {
			return;
		}

		if (this.token) {
			await this.login(this.token);

			console.log('Logged in');
		} else
			console.log('No token present');

		try {
			this.commandHandler.init(Path.join(__dirname, '..', '..', 'Commands'));
		} catch (error) {
			console.log('Unable to load commands');
		}
	}
}
