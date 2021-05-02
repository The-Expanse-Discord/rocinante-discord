import {
	Message,
	MessageEmbed,
	MessageReaction,
	PartialUser,
	User,
	GuildMember,
	Role,
	TextChannel,
	Collection,
	Guild,
	GuildEmoji
} from 'discord.js';
import { Emoji } from '../Enums/Role Assignment';
import Protomolecule from '../Client/Protomolecule';
import constants from '../../Utils/Constants';
import RateLimiter from '../Managers/RateLimiter';

// This amounts to 1 second per role change
const COST_PER_ROLE_CHANGE : number = 1;

export class RoleHandler {
	private readonly client: Protomolecule;
	private readonly serverChannelMapping: Record<string, string>;
	private readonly guildEmojiLookup: Record<string, Record<string, GuildEmoji> >;
	private readonly guildMessageLookup: Record<string, Message[] >;
	private readonly limiter: RateLimiter;
	private readonly moderatorUserId: string;

	public constructor(
		protomolecule: Protomolecule,
		serverChannelMapping: Record<string, string>,
		moderatorUserId: string
	) {
		this.client = protomolecule;
		this.serverChannelMapping = serverChannelMapping;
		this.guildEmojiLookup = {};
		this.guildMessageLookup = {};
		this.moderatorUserId = moderatorUserId;
		// Start with 30 tokens, use a token to add role, get a token per second
		this.limiter = new RateLimiter(1000, 1, 30);
	}

	public async init(): Promise<void> {
		this.listen();

		const channelsList: [TextChannel, Collection<string, Message>][] = await Promise.all(
			this.client.guilds.cache.array().filter(guild => this.serverChannelMapping[guild.id])
				.map(async guild => {
					this.guildEmojiLookup[guild.id] = this.findEmoji(guild);
					const channel: TextChannel =
							guild.channels.cache.get(this.serverChannelMapping[guild.id]) as TextChannel;
					const messages: Collection<string, Message> = await channel.messages.fetch({ limit: 20 });
					const result: [TextChannel, Collection<string, Message>] = [ channel, messages ];
					return result;
				})
		);
		await Promise.all(
			channelsList.map(async([ channel, messages ]) => {
				console.log(channel.id);
				console.log(channel.guild.id);
				await this.ensureIntro(channel, messages);
				this.guildMessageLookup[channel.guild.id] = await Promise.all([
					this.ensureLearnerEmbed(channel, messages),
					this.ensureCurrentEmbed(channel, messages),
					this.ensureShowEmbed(channel, messages),
					this.ensureBookEmbed(channel, messages),
					this.ensureNovellaEmbed(channel, messages),
				]);
				await this.ensureFinalMessage(channel, messages);
			})
		);
	}

	private listen(): void {
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
				// Emojis may not have an id, so we should account for that.
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
					await this.client.roleManager.setRole(reaction, user, true);
				}
				if (packet.t === 'MESSAGE_REACTION_REMOVE') {
					await this.client.roleManager.setRole(reaction, user, false);
				}
				return;
			}
		});
	}

	private isRoleReactionMessage(message: Message) : boolean {
		const guild: Guild | null = message.guild;
		if (guild !== null) {
			return this.guildMessageLookup[guild.id].some(m => m.id === message.id);
		}
		return false;
	}

	private getReactEmoji(guild: Guild, emoji: Emoji): string {
		return this.guildEmojiLookup[guild.id][emoji].id;
	}

	private findEmoji(guild: Guild): Record<string, GuildEmoji> {
		const allEmoji: string[] = Object.values(Emoji);

		const emojiLookup: Record<string, GuildEmoji> = {};

		for (const emoji of guild.emojis.cache.array()) {
			emojiLookup[emoji.name] = emoji;
		}

		for (const emoji of allEmoji) {
			if (!emojiLookup.hasOwnProperty(emoji)) {
				throw new Error(`Missing emoji ${ emoji }`);
			}
		}
		return emojiLookup;
	}

	private ensureEmbed(
		channel: TextChannel,
		messages: Collection<string, Message>,
		title: string,
		description: string,
		thumbnail: string | null = null
	) : Promise<Message> {
		const embedMessages: Message[] = messages.array().filter(
			(message: Message) => message.embeds.some(embed => embed.title === title)
		);
		if (embedMessages.length === 0) {
			const embed: MessageEmbed = new MessageEmbed;
			embed.setColor(constants.embedColorBase);
			embed.setDescription(description);
			embed.setTitle(title);
			if (thumbnail !== null) {
				embed.setThumbnail(thumbnail);
			}

			return channel.send(embed);
		}
		return Promise.resolve(embedMessages[0]);
	}

	private async ensureLearnerEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const langBeltaLearnerEmoji: GuildEmoji | undefined =
			this.client.emojis.cache.find(emoji => emoji.name === Emoji.LangBeltaLearner);
		const description: string = `Click the ${ langBeltaLearnerEmoji } reaction to this message if you’re ` +
			'curious about Lang Belta, the language spoken by the Belters on the show. You’ll gain access to the ' +
			'Lang Belta Learning Community area of this server, where you can see our learning resources, discuss ' +
			'this fun and interesting fictional language, and participate in our easygoing text and voice practice ' +
			'chats. It’s a friendly group, and new learners are always welcome! This area allows spoilers, but they ' +
			'are quite rare.';
		const message: Message = await this.ensureEmbed(
			channel,
			messages,
			'Lang Belta Learning Community',
			description,
			'https://i.imgur.com/OqPycws.png'
		);
		await this.reactWith(message, [
			Emoji.LangBeltaLearner,
		]);
		return message;
	}

	private async ensureBookEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const description: string = 'Currently reading the novels? Select the books you’ve completed, and you’ll be ' +
			'able to see the channels corresponding to each of them. As you progress through the series, you can ' +
			'come back and select more roles. ';
		const message: Message = await this.ensureEmbed(channel, messages, 'The Expanse Books', description, 'https://i.imgur.com/BHfnxXr.png');
		await this.reactWith(message, [
			Emoji.LeviathanWakes,
			Emoji.CalibansWar,
			Emoji.AbaddonsGate,
			Emoji.CibolaBurn,
			Emoji.NemesisGames,
			Emoji.BabylonsAshes,
			Emoji.PersepolisRising,
			Emoji.TiamatsWrath,
		]);
		return message;
	}

	private async ensureNovellaEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const description: string = 'Reading the novellas and short stories the accompany the book series? Select ' +
			'the ones you’ve read, and you’ll be able to see the channels corresponding to each of them. As you ' +
			'read, you can come back and select more roles.';
		const message: Message = await this.ensureEmbed(
			channel,
			messages,
			'The Expanse Novellas & Short Stories',
			description,
			'https://i.imgur.com/VhSPt4w.png'
		);
		await this.reactWith(message, [
			Emoji.TheButcherOfAndersonStation,
			Emoji.GodsOfRisk,
			Emoji.Drive,
			Emoji.TheChurn,
			Emoji.TheVitalAbyss,
			Emoji.StrangeDogs,
			Emoji.TheLastFlightOfTheCassandra,
			Emoji.Auberon,
		]);
		return message;
	}

	private async ensureShowEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const description: string = 'Watching the show for the first time? Select the seasons you’ve seen, ' +
			'and you’ll be able to see the channels corresponding to each of them. As you progress through the show, ' +
			'you can come back and select more roles.';
		const message: Message = await this.ensureEmbed(channel, messages, 'The Expanse Show', description, 'https://i.imgur.com/57CXARX.png');
		await this.reactWith(message, [
			Emoji.Season1,
			Emoji.Season2,
			Emoji.Season3,
			Emoji.Season4,
			Emoji.Season5,
		]);
		return message;
	}

	private async ensureCurrentEmbed(channel: TextChannel, messages: Collection<string, Message>): Promise<Message> {
		const currentBookEmoji: GuildEmoji | undefined =
			this.client.emojis.cache.find(emoji => emoji.name === Emoji.CurrentBook);
		const currentShowEmoji: GuildEmoji | undefined =
			this.client.emojis.cache.find(emoji => emoji.name === Emoji.CurrentShow);
		const currentAllEmoji: GuildEmoji | undefined =
			this.client.emojis.cache.find(emoji => emoji.name === Emoji.CurrentAll);
		const description: string = `Click ${ currentAllEmoji } if you’re caught up on the ` +
			'books, novellas, and show ' +
			`(or if you just don’t mind seeing spoilers), ${ currentShowEmoji } if you’ve seen all ` +
			`the episodes that have aired, or ${ currentBookEmoji } if you’ve ` +
			'read all the books and novellas that have been released. When a new season or book is ' +
			'released, we wait a little while and make an announcement before adding it to the ' +
			'"Current" roles.';
		const message: Message =
			await this.ensureEmbed(channel, messages, 'Current Expanse Discussion', description, 'https://i.imgur.com/eQPqYYI.png');
		await this.reactWith(message, [
			Emoji.CurrentAll,
			Emoji.CurrentShow,
			Emoji.CurrentBook,
		]);
		return message;
	}

	private async ensureIntro(channel: TextChannel, messages: Collection<string, Message>): Promise<void> {
		const moderatorUser: User | undefined = await this.client.users.fetch(this.moderatorUserId);

		const text: string = 'Welcome! This server is a place for all fans of The Expanse to chat. ' +
			'Whether you’ve seen the entire show and read all the books or you’re just starting out, ' +
			'we have discussion channels for you. Our server is structured to keep people from accidentally ' +
			'seeing spoilers they’d rather avoid, with channels for each book and season, plus channels for ' +
			'discussing The Expanse as a whole. \n\n' +
			'As a new member, you can currently see the channels that don’t ' +
			'allow spoilers, like our general hangout channels. Access to additional channels is ' +
			'determined by what roles you have as a community member. You can assign the roles you’d ' +
			'like to have on this page by clicking the reaction emoji below each of the following messages.' +
			'The color of your display name will change depending on the roles you select. By looking at other ' +
			'users’ colors and clicking their names to view their roles, you can tell what they’ve seen and read.' +
			'\n\nIf you have questions about using this page, feel free to ' +
			`DM ${ moderatorUser } to get in touch with the moderation team.`;

		const introMessages: Message[] = messages.array().filter(
			(message: Message) => message.content.startsWith('Welcome! This')
		);

		if (introMessages.length === 0) {
			await channel.send(text);
		}
	}

	private async ensureFinalMessage(channel: TextChannel, messages: Collection<string, Message>): Promise<void> {
		const moderatorUser: User | undefined = await this.client.users.fetch(this.moderatorUserId);
		const text: string = 'Now you’re all set up! Remember to keep spoilers out of our General Chat ' +
			'channels, they’re meant for everyone. Come back to the Airlock section any time to add more ' +
			'roles, review our rules, or see our widebeam announcements. Send a direct message to the ' +
			`${ moderatorUser } bot to get in touch with our team if you ever have a question or need some help. ` +
			'We’re looking forward to seeing you around the server!';

		const introMessages: Message[] = messages.array().filter(
			(message: Message) => message.content.startsWith('Now you’re')
		);

		if (introMessages.length === 0) {
			await channel.send(text);
		}
	}

	public async reactWith(message: Message, emoji: Emoji[]): Promise<void> {
		const guild : Guild | null = message.guild;
		if (guild !== null) {
			await Promise.all(emoji.map(async(e: Emoji) => {
				const reactEmoji: string = this.getReactEmoji(guild, e);
				if (!message.reactions.cache.get(reactEmoji)) {
					await message.react(reactEmoji);
				}
			}));
		}
	}

	private findRoleFromMessageReaction(reaction: MessageReaction) : Role | undefined {
		if (!reaction.message.guild) {
			return undefined;
		}
		const lowerRoleName: string = reaction.emoji.name.toLowerCase();
		let role: Role | undefined;

		if (lowerRoleName) {
			console.log(lowerRoleName);
			role = reaction.message.guild.roles.cache
				.find(r => r.name.replace(/'/g, '').replace(/ /g, '')
					.toLowerCase()
					.includes(lowerRoleName));
		}
		return role;
	}

	private async rateLimitWarnUser(user: User | PartialUser): Promise<void> {
		try {
			console.log('trying to message user');
			const wait: number = this.limiter.numberOfIntervalsUntilAmountCanBeRemoved(user.id, COST_PER_ROLE_CHANGE);
			const message: string =
				`Roles being changed too quickly, please wait ${ wait.toString() } seconds before setting more roles `;
			await user.send(message);
		} catch (error) {
			console.log('Something went wrong when sending user a rate limit message: ', error);
			return;
		}
	}

	/**
	 * This function checks if the user is rate limited for role changes, and
	 * if so, goes ahead and messages them asynchronously (it does not wait)
	 */
	private checkRateLimitOrMessage(user: User | PartialUser) : boolean {
		if (this.limiter.tryRemoveTokens(user.id, COST_PER_ROLE_CHANGE)) {
			return true;
		}
		this.rateLimitWarnUser(user);
		return false;
	}

	public async setRole(reaction: MessageReaction, user: User | PartialUser, shouldHaveRole: boolean): Promise<void> {
		if (!this.isRoleReactionMessage(reaction.message)) {
			return;
		}
		if (!this.checkRateLimitOrMessage(user)) {
			return;
		}
		let messageReaction: MessageReaction;

		try {
			messageReaction = await reaction.fetch();

			if (messageReaction.message.guild) {
				const role : (Role | undefined) = this.findRoleFromMessageReaction(messageReaction);
				const member: GuildMember = await messageReaction.message.guild.members.fetch(user.id);

				if (role) {
					if (shouldHaveRole) {
						console.log(`Adding role ${ role.name } to member ${ member.displayName }`);
						await member.roles.add(role);
					} else {
						console.log(`Removing role ${ role.name } from member ${ member.displayName }`);
						await member.roles.remove(role);
					}
				}
			}
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return;
		}
	}
}
