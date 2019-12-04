/* eslint-disable max-lines-per-function */

import { Command } from '../../lib/classes/Command';
import { Event } from '../../lib/util/Enums';
import { Message } from 'discord.js';
import ProtomoleculeClient from '../client/ProtomoleculeClient';

/**
 * The listener for Discord events.
 */
export default class EventManager {
	/**
	 * The Discord client.
	 */
	private readonly client: ProtomoleculeClient;

	/**
	 * Default constructor for the Events class.
	 *
	 * @param client - The running instance of the {@link ProtomoleculeClient} Discord client.
	 *
	 * @returns - The Event listner.
	 */
	public constructor(protomolecule: ProtomoleculeClient) {
		// Associate the Discord client
		this.client = protomolecule;
	}

	/**
	 * Listen to the various Discord events.
	 */
	public listen(): void {
		// On ready
		this.client.once(Event.Ready, async() => {
			// Set the Discord status text
			if (this.client.user)
				await this.client.user.setActivity(this.client.statusText, { type: this.client.statusType });
		});

		// On message
		this.client.on(Event.Message, async(message: Message) => {
			/*
			 * Disregard any message that doesn't start with the command prefix.
			 * disregard any message sent from a bot.
			 */
			if (!message.content.startsWith(this.client.prefix) || message.author.bot)
				return;

			// Slice the message into arguments
			const args: string[] = message.content.slice(this.client.prefix.length).split(/ +/);

			// Normalize the command text
			let issuedCommand: string | undefined = args.shift();
			issuedCommand = issuedCommand ? issuedCommand.toLowerCase() : '';

			// Does the command exist?
			const fetchedCommand: Command | undefined = this.client.commands.get(issuedCommand);

			if (fetchedCommand)
				await fetchedCommand.execute(message, args);
		});

		// On disconnect
		this.client.on(Event.Disconnect, () => {
			// Kill the process so pm2 can restart the bot and reconnect
			process.exit(100);
		});
	}
}
