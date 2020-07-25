/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command } from '../../Infrastructure/System/Command';
import { Message } from 'discord.js';
import { System } from '../../Utils';

/**
 * ## Create Role Assignment Message
 * Create the various embed messages required for role assignment.
 *
 * `.c
 *
 * @category Commands: Role Assignment
 */
export class Create extends Command {
	public constructor() {
		super({
			name: 'Create Role Assignment Message',
			command: [ 'c' ],
			description: 'Create the embed message for a sepcific category.',
			usage: '<prefix>c',
			group: [ 'system' ],
			roles: [ 'The Rocinante' ]
		});
	}

	public async execute(message: Message): Promise<void> {
		message.delete();

		await System.sendIntroEmbed(message);
		await System.sendBookEmbed(message);
	}
}

