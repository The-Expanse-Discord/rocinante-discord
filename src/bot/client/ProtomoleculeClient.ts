import { ActivityType, Client, ClientOptions } from 'discord.js';
import EventManager from '../managers/EventManager';
import config = require('./config.json');

export default class ProtomoleculeClient extends Client {
	/**
	 * Discord bot token.
	 */
	private readonly botToken!: string;

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
	 * Default constructor for {@link Protomolecule}, the Discord client.
	 *
	 * @returns - The Discord client.
	 */
	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		// Set the token
		this.botToken = config.token;

		// Set the prefix
		this.prefix = config.commandPrefix;

		// Set the status type
		this.statusType = config.statusType as ActivityType;

		// Set the status text
		this.statusText = config.statusText;

		// Create Event listner instance
		this.events = new EventManager(this);
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

		// Login to Discord
		await this.login(this.botToken);

		// TODO replace with logger instance
		// eslint-disable-next-line no-console
		console.log('Logged in');
	}
}
