/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command } from '../../Infrastructure/System/Command';
import { Message } from 'discord.js';
import { System } from '../../Utils';
import { getManager, Repository } from 'typeorm';
import { ReactionMessage } from '../../Infrastructure/Entities';
import { RoleCategory } from '../../Infrastructure/Enums/Role Assignment';

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
			roles: [ 'The Rocinante' ],
			rolesDebitTickets: 0,
			unlimitedRoles: [],
			unlimitedRolesDebitTickets: 0
		});
	}

	public async execute(message: Message): Promise<void> {
		message.delete();

		const repo: Repository<ReactionMessage> = getManager().getRepository(ReactionMessage);
		repo.clear();

		await System.sendIntroEmbed(message);

		const bookMessage: ReactionMessage = await (new ReactionMessage)
			.create(await System.sendBookEmbed(message), RoleCategory.Book);
		const novellaMessage: ReactionMessage = await (new ReactionMessage)
			.create(await System.sendNovellaEmbed(message), RoleCategory.Novella);
		const showMessage: ReactionMessage = await (new ReactionMessage)
			.create(await System.sendShowEmbed(message), RoleCategory.Show);

		await repo.save(bookMessage);
		await repo.save(novellaMessage);
		await repo.save(showMessage);
	}
}

