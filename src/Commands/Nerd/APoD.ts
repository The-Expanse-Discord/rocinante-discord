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
export class APoD extends Command {
	public constructor() {
		super({
			name: 'APoD',
			command: [ 'apod' ],
			description: 'NASA\'s Astronomy Picture of the Day',
			usage: '<prefix>apod <Argument>?',
			group: [ 'nerd' ],
			roles: []
		});
	}

	public async execute(message: Message, args: string[]): Promise<void> {
		const isRandom: boolean = args[0] === 'r';

		const embed: MessageEmbed = await Nerd.fetchApod(isRandom);

		message.channel.send(embed);
	}
}
