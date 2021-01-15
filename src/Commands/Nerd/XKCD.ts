
import { Command } from '../../Infrastructure/System/Command';
import { Message, MessageEmbed } from 'discord.js';
import { Nerd } from '../../Utils';

/**
 * ## XKCD
 * XKCD Comics.
 *
 * Usage:
 * `.xkcd`
 * `.xkcd r`
 * `.xkcd 1234`
 *
 * @category Commands: Nerd
 */
export class XKCD extends Command {
	public constructor() {
		super({
			name: 'XKCD',
			command: [ 'xkcd' ],
			description: 'XKCD Comics',
			usage: '<prefix>xkcd <Argument>?',
			group: [ 'nerd' ],
			roles: [],
			rolesDebitTickets: 7500,
			unlimitedRoles: [ 'The Rocinante', 'Moderation Team' ],
			unlimitedRolesDebitTickets: 0
		});
	}

	public async execute(message: Message, args: string[]): Promise<void> {
		let isRandom: boolean | undefined;

		if (args[0])
			isRandom = args[0] === 'r';

		const comicNumber: number | undefined =
			args[0] && Nerd.isNumerical(args[0]) ? Number(args[0]) : undefined;

		await Nerd.fetchComic(comicNumber, isRandom)
			.then((response: MessageEmbed | string): void => {
				message.channel.send(response);
			})
			.catch((): void => {
				message.channel.send(`There was an error retrieving the XKCD Comic.`);
			});
	}
}

