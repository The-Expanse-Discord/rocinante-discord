/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command } from '../../Infrastructure/System/Command';
import { Message } from 'discord.js';
import { System } from '../../Utils';
import { ReactionCategory, ReactionMessage } from '../../Infrastructure/Entities';
import { Repository } from 'typeorm';
import { RoleCategory } from '../../Infrastructure/Enums/Role Assignment';

/**
 * ## Ping
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

		// await System.sendIntroEmbed(message);
		const bookEmbedId: string = await System.sendBookEmbed(message);
		const novellaEmbedId: string = await System.sendNovellaEmbed(message);
		const showEmbedId: string = await System.sendShowEmbed(message);

		this.client.database.then(async connection => {
			const reactionMessageRepo: Repository<ReactionMessage> =
				connection.getRepository(ReactionMessage);
			const reactionCategoryRepo: Repository<ReactionCategory> =
				connection.getRepository(ReactionCategory);

			const bookCategory: ReactionCategory | undefined =
				await reactionCategoryRepo.findOne({ id: RoleCategory.Book });
			const novellaCategory: ReactionCategory | undefined =
				await reactionCategoryRepo.findOne({ id: RoleCategory.Novella });
			const showCategory: ReactionCategory | undefined =
				await reactionCategoryRepo.findOne({ id: RoleCategory.Show });

			const bookMessage: ReactionMessage | undefined =
				await reactionMessageRepo.findOne({ category: bookCategory });
			const novellaMessage: ReactionMessage | undefined =
				await reactionMessageRepo.findOne({ category: novellaCategory });
			const showMessage: ReactionMessage | undefined =
				await reactionMessageRepo.findOne({ category: showCategory });

			if (!bookMessage)
				await reactionMessageRepo.save(
					new ReactionMessage({ messageId: bookEmbedId, category: bookCategory! })
				);

			if (!novellaMessage)
				await reactionMessageRepo.save(
					new ReactionMessage({ messageId: novellaEmbedId, category: novellaCategory! })
				);

			if (!showMessage)
				await reactionMessageRepo.save(
					new ReactionMessage({ messageId: showEmbedId, category: showCategory! })
				);
		});
	}
}
