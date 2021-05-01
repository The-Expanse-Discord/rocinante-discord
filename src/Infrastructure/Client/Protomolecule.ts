import { ActivityType, Client, ClientOptions, Collection } from 'discord.js';
import { Command } from '../System/Command';
import { CommandHandler, RoleHandler } from '../Handlers';
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

	public commandHandler: CommandHandler;
	public readonly roleManager: RoleHandler;

	public commands: Collection<string, Command>;

	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		this.token = configDiscordClient.token;

		this.prefix = configDiscordClient.commandPrefix;

		this.statusType = configDiscordClient.statusType as ActivityType;
		this.statusText = configDiscordClient.statusText;

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
		this.once('ready', async() => {
			/*
			 * This needs to be initialized after we have loaded all the cached things,
			 * which happens after ready, not login.
			 */
			if (this.user) {
				await this.user.setActivity(this.statusText, { type: this.statusType });
			}

			await this.roleManager.init();
			this.commandHandler.init([ APoD, XKCD, Avasarala ]);

			console.log('Protomolecule Ready');
			this.ready = true;
		});

		this.on('disconnect', () => {
			process.exit(100);
		});

		if (this.token) {
			await this.login(this.token);

			console.log('Logged in');
		} else {
			console.log('No token present');
		}
	}
}
