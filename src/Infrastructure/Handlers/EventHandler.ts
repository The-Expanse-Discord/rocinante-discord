/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DiscordEvent } from '../Enums/System';
import { Message, MessageReaction, User, TextChannel } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';

/**
 * @category Handler
 */
export class EventHandler {
	private readonly client: Protomolecule;

	public constructor(protomolecule: Protomolecule) {
		this.client = protomolecule;
	}

	public listen(): void {
		this.client.once(DiscordEvent.Ready, async() => {
			if (this.client.user) {
				await this.client.user.setActivity(this.client.statusText, { type: this.client.statusType });
			}
		});

		this.client.on(DiscordEvent.Message, async(message: Message) => {
			if (!message.content.startsWith(this.client.prefix) || message.author.bot) {
				return;
			}

			await this.client.commandHandler!.processCommand(message);
		});

		this.client.on(DiscordEvent.Disconnect, () => {
			process.exit(100);
		});

		this.client.on('raw', async packet => {
			// We implement this as a raw handler because the add/remove reactions are brittle and can't handle not having users/messages cached.
			if (!this.client.isReady()) {
				return;
			}
			console.log(`received message of type ${ packet.t }`);
			if ([ 'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE' ].includes(packet.t)) {
				// Grab the channel to check the message from
				const channel : TextChannel = this.client.channels.cache.get(packet.d.channel_id) as TextChannel;

				const user : User = await this.client.users.fetch(packet.d.user_id);
				const message : Message = await channel.messages.fetch(packet.d.message_id);
				// Emojis can have identifiers of name:id format, so we have to account for that case as well
				const emoji : string = packet.d.emoji.id ?
					packet.d.emoji.id :
					packet.d.emoji.name;
				const reaction : MessageReaction | undefined = message.reactions.cache.get(emoji);
				if (!reaction) {
					console.log(`No reaction matching id ${ emoji } on message`);
					return;
				}
				if (user.bot) {
					return;
				}

				if (packet.t === 'MESSAGE_REACTION_ADD') {
					await this.client.roleManager.addRole(reaction, user);
				}
				if (packet.t === 'MESSAGE_REACTION_REMOVE') {
					await this.client.roleManager.removeRole(reaction, user);
				}
				return;
			}
		});
	}
}
