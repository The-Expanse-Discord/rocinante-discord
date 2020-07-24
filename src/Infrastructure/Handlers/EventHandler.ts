/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DiscordEvent } from '../Enums/System';
import { Message, MessageReaction, PartialUser, User } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';
import { ReactionMessage } from '../Entities';
import { RoleCategory } from '../Enums/Role Assignment';
import { Repository } from 'typeorm';

/**
 * @category Handler
 */
export class EventHandler {
	private readonly client: Protomolecule;

	public reactionMessages: string[];

	public constructor(protomolecule: Protomolecule) {
		this.client = protomolecule;
		this.reactionMessages = [];
	}

	public listen(): void {
		this.client.once(DiscordEvent.Ready, async() => {
			if (this.client.user)
				await this.client.user.setActivity(this.client.statusText, { type: this.client.statusType });

			this.client.database.then(async connection => {
				const reactionMessageRepo: Repository<ReactionMessage> =
					connection.getRepository(ReactionMessage);
				const bookMessage: ReactionMessage | undefined =
					await reactionMessageRepo.findOne({ id: RoleCategory.Book });
				const novellaMessage: ReactionMessage | undefined =
					await reactionMessageRepo.findOne({ id: RoleCategory.Novella });
				const showMessage: ReactionMessage | undefined =
					await reactionMessageRepo.findOne({ id: RoleCategory.Show });

				if (bookMessage)
					this.reactionMessages.push(bookMessage.messageId);
				if (novellaMessage)
					this.reactionMessages.push(novellaMessage.messageId);
				if (showMessage)
					this.reactionMessages.push(showMessage.messageId);
			});
		});

		this.client.on(DiscordEvent.Message, async(message: Message) => {
			if (!message.content.startsWith(this.client.prefix) || message.author.bot)
				return;

			await this.client.commandHandler!.processCommand(message);
		});

		this.client.on(DiscordEvent.AddReaction,
			async(reaction: MessageReaction, _user: User | PartialUser): Promise<void> => {
				if (reaction.partial)
					try {
						await reaction.fetch();
					} catch (error) {
						console.log('Something went wrong when fetching the message: ', error);
						return;
					}
			});

		this.client.on(DiscordEvent.RemoveReaction,
			async(reaction: MessageReaction, _user: User | PartialUser): Promise<void> => {
				if (reaction.partial)
					try {
						await reaction.fetch();
					} catch (error) {
						console.log('Something went wrong when fetching the message: ', error);
						return;
					}
			});

		this.client.on(DiscordEvent.Disconnect, () => {
			process.exit(100);
		});
	}
}
