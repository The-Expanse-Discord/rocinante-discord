/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DiscordEvent } from '../Enums/System';
import { Message, Guild, Role, GuildMember } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';
import { System } from '../../Utils';
import { Raw } from '../Interfaces/Events';
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

		this.client.on(DiscordEvent.Raw, async(raw: Raw) => {
			if ((raw.t === 'MESSAGE_REACTION_ADD' || raw.t === 'MESSAGE_REACTION_REMOVE') &&
					raw.d.user_id !== this.client.id) {
				if (!this.reactionMessages.includes(raw.d.message_id))
					return;

				const action: string = raw.t;

				const guild: Guild | null = this.client.guilds.resolve(raw.d.guild_id);

				const roleName: string[] | null = raw.d.emoji.name.match(/[A-Z][a-z]+|[0-9]+/g);

				let role: Role | undefined;

				const member: GuildMember | undefined = guild ? await guild.members.fetch(raw.d.user_id) : undefined;

				if (guild && roleName)
					role = guild.roles.cache.find(r => r.name.replace('\'', '').includes(roleName.join(' ')));

				if (role && member)
					System.processReaction(action, role, member);
			}
		});

		this.client.on(DiscordEvent.Disconnect, () => {
			process.exit(100);
		});
	}
}
