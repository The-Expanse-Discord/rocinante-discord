import * as millerQuotes from './MillerQuotes.json';
import { Command } from '../../Infrastructure/System/Command';
import { Message, MessageEmbed } from 'discord.js';

export default class Miller extends Command {
	public constructor() {
		super({
			name: 'Miller',
			command: [ 'jm' ],
			description: 'A Random Quote from Josephus Miller',
			usage: '<prefix>jm',
			group: [ 'nerd' ],
			roles: [],
			commandsPerMinute: 5,
			commandSurgeMax: 2.0,
		});
	}

	public async execute(message: Message, _: string[]): Promise<void> {
		// variable declaration
		const quote: string = millerQuotes[Math.floor(Math.random() * millerQuotes.length)].content;

		// build the quote
		const embed: MessageEmbed = new MessageEmbed;
		embed
			.setColor(0x206694)
			.setAuthor('Josephus Miller says...')
			.addField('\u200b', `"${ quote }"`, false)
			.setFooter('/u/it-reaches-out');

		// send the quote
		await message.channel.send(embed);
	}
}
