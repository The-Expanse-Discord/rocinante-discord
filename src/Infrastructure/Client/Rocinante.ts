import { ActivityType, Client, ClientOptions } from 'discord.js';
import { CommandHandler, RoleHandler } from '../Handlers';
import { configDiscordClient } from './Config';
import APoD from '../../Commands/Nerd/APoD';
import XKCD from '../../Commands/Nerd/XKCD';
import Avasarala from '../../Commands/Nerd/Avasarala';
import Miller from '../../Commands/Nerd/Miller';

/**
 * ## Rocinante
 * The heart of the Rocinante.
 *
 * @category System
 */
export default class Rocinante extends Client {
	public readonly prefix: string;
	private ready: boolean;

	public statusType: ActivityType;
	public statusText: string;

	public commandHandler: CommandHandler;
	public readonly roleManager: RoleHandler;

	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		this.token = configDiscordClient.token;

		this.prefix = configDiscordClient.commandPrefix;

		this.statusType = configDiscordClient.statusType as ActivityType;
		this.statusText = configDiscordClient.statusText;

		this.commandHandler = new CommandHandler(this,
			configDiscordClient.unlimitedRoles,
			configDiscordClient.commandChannels);
		this.roleManager = new RoleHandler(
			this,
			configDiscordClient.welcomeChannels,
			configDiscordClient.moderatorUserId
		);

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
			this.commandHandler.init([ APoD, XKCD, Avasarala, Miller ]);

			console.log('The Rocinante is Ready');
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
