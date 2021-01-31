import { ActivityType, Client, ClientOptions, Collection } from 'discord.js';
import { Command } from '../System/Command';
import { CommandHandler, EventHandler, RoleHandler } from '../Handlers';
import { configDiscordClient } from './Config';
import APoD from '../../Commands/Nerd/APoD';
import XKCD from '../../Commands/Nerd/XKCD';
import Avasarala from '../../Commands/Nerd/Avasarala';

/**
 * ## Protomolecule
 * The heart of Protomolecule.
 *
 * @category System
 */
export default class Protomolecule extends Client {
	public readonly prefix: string;
	private ready: boolean;

	public statusType: ActivityType;
	public statusText: string;

	public eventHandler: EventHandler;
	public commandHandler: CommandHandler;
	public readonly roleManager: RoleHandler;

	public commands: Collection<string, Command>;

	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		this.token = configDiscordClient.token;

		this.prefix = configDiscordClient.commandPrefix;

		this.statusType = configDiscordClient.statusType as ActivityType;
		this.statusText = configDiscordClient.statusText;

		this.eventHandler = new EventHandler(this);
		this.commandHandler = new CommandHandler(this,
			configDiscordClient.unlimitedRoles,
			configDiscordClient.commandChannels);
		this.roleManager = new RoleHandler(this, configDiscordClient.welcomeChannels);

		this.commands = new Collection;
		this.ready = false;
	}

	public isReady() : boolean {
		return this.ready;
	}

	public async start(): Promise<void> {
		await this.init();
	}

	private async init(): Promise<void> {
		this.on('ready', async() => {
			/*
			 * This needs to be initialized after we have loaded all the cached things,
			 * which happens after ready, not login.
			 */
			await this.roleManager.init();
			console.log('Protomolecule Ready');
			this.ready = true;
		});

		try {
			this.eventHandler.listen();
		} catch (error) {
			return;
		}

		if (this.token) {
			await this.login(this.token);

			console.log('Logged in');
		} else {
			console.log('No token present');
		}

		try {
			this.commandHandler.init([ APoD, XKCD, Avasarala ]);
		} catch (error) {
			console.log('Unable to load commands');
		}
	}
}
