import { Command } from '../Infrastructure/System/Command';
import { Message } from 'discord.js';

/**
 * ## Ping
 * Basic ping command.
 *
 * `.ping`
 *
 * @category Commands: System
 */
export class Ping extends Command {
	public constructor() {
		super({
			name: 'Ping',
			command: [ 'p' ],
			description: 'Pong!',
			usage: '<prefix>ping',
			group: [ 'system' ]
		});
	}

	public async execute(message: Message): Promise<void> {
		await message.channel.send('Pong!');
	}
}
