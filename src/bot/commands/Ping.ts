import { Command } from '../../lib/classes/Command';
import { Message } from 'discord.js';

export class Ping extends Command {
	public constructor() {
		super({
			name: 'Ping',
			description: 'Returns Discord user stats.'
		});
	}

	public async execute(message: Message): Promise<void> {
		await message.channel.send('Pong!');
	}
}
