import * as Path from 'path';
import { ActivityType, Client, ClientOptions, Collection } from 'discord.js';
import { Command } from '../../lib/classes/Command';
import { CommandManager } from '../managers/CommandManager';
import EventManager from '../managers/EventManager';
import config from './Config';

export default class ProtomoleculeClient extends Client {
	/*
	 * Command prefix.
	 */
	public readonly prefix: string;

	/**
	 * Discord status type.
	 */
	public statusType: ActivityType;

	/**
	 * Discord status text.
	 */
	public statusText: string;

	/**
	 * Event listener.
	 */
	public events: EventManager;

	/**
	 * Command Manager for the bot.
	 */
	public commandManager: CommandManager;

	/**
	 * Discord commands.
	 */
	public commands: Collection<string, Command>;

	/**
	 * Default constructor for {@link Protomolecule}, the Discord client.
	 *
	 * @returns - The Discord client.
	 */
	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		// Set the token
		this.token = config.token;

		// Set the prefix
		this.prefix = config.commandPrefix;

		// Set the status type
		this.statusType = config.statusType as ActivityType;

		// Set the status text
		this.statusText = config.statusText;

		// Create Event listner instance
		this.events = new EventManager(this);

		// Initialize the Command Manager
		this.commandManager = new CommandManager(this);

		// Initialize commands Collection
		this.commands = new Collection;
	}

	/**
	 * Start {@link Protomolecule}.
	 *
	 * @remarks
	 * This fires `init()` and logs {@link Protomolecule} into Discord.
	 */
	public async start(): Promise<void> {
		// Initialize modules
		await this.init();
	}

	/**
	 * Initialize the various modules of {@link Protomolecule}
	 */
	private async init(): Promise<void> {
		// Initialize event listen
		try {
			this.events.listen();
		} catch (error) {
			return;
		}

		if (this.token) {
			// Login to Discord
			await this.login(this.token);

			// eslint-disable-next-line no-console
			console.log('Logged in');
		} else
			// eslint-disable-next-line no-console
			console.log('No token present');

		// Load commands
		try {
			this.commandManager.init(Path.join(__dirname, '../commands'));
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log('Unable to load commands');
		}
	}
}
