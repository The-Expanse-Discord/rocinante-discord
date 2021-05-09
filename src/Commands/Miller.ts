import * as millerQuotes from './MillerQuotes.json';
import * as millerImages from './MillerImages.json';
import { Command } from '../Infrastructure/System/Command';
import { Message, MessageEmbed } from 'discord.js';

export default class Miller extends Command {
	public constructor() {
		super({
			name: 'Miller',
			command: [ 'jm' ],
			description: 'A Random Quote from Josephus Miller',
			usage: '<prefix>jm',
			roles: [],
			commandsPerMinute: 5,
			commandSurgeMax: 2.0,
		});
	}

	public async execute(message: Message, _: string[]): Promise<void> {
		// variable declaration
		const quote: string = millerQuotes[Math.floor(Math.random() * millerQuotes.length)].content;
		const image: string = millerImages[Math.floor(Math.random() * millerImages.length)];

		// build the quote
		const embed: MessageEmbed = new MessageEmbed;
		embed
			.setColor(0x206694)
			.setAuthor('Josephus Miller says...')
			.setThumbnail(image)
			.addField('\u200b', `"${ quote }"`, false)
			.setFooter('Collected by @Florac');

		// send the quote
		await message.channel.send(embed);
	}
}
