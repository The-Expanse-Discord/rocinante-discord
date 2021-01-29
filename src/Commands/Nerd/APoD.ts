import { Command } from '../../Infrastructure/System/Command';
import { Message, MessageEmbed } from 'discord.js';
import { Nerd } from '../../Utils';

/**
 * ## APoD
 * NASA's Astronomy Picture of the Day.
 *
 * Usage:
 * `.apod`
 * `.apod r`
 *
 * @category Commands: Nerd
 */
export default class APoD extends Command {
	public constructor() {
		super({
			name: 'APoD',
			command: [ 'apod' ],
			description: 'NASA\'s Astronomy Picture of the Day',
			usage: '<prefix>apod <Argument>?',
			group: [ 'nerd' ],
			roles: [],
			commandsPerSecond: 0.005,
			commandSurgeMax: 1.5
		});
	}

	public async execute(message: Message, args: string[]): Promise<void> {
		const isRandom: boolean = args[0] === 'r';

		await Nerd.fetchApod(isRandom)
			.then((response: MessageEmbed | string): void => {
				message.channel.send(response);
			});
	}
}
