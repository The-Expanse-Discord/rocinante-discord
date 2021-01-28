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

	public constructor(protomolecule: Protomolecule, serverChannelMapping: Record<string, string>) {
		this.client = protomolecule;
		this.serverChannelMapping = serverChannelMapping;
		this.guildEmojiLookup = {};
		this.guildMessageLookup = {};
		// Start with 30 tokens, use a token to add role, get a token per second
		this.limiter = new RateLimiter(1000, 1, 30);
	}

	public async init(): Promise<void> {
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
				this.guildMessageLookup[channel.guild.id] = await Promise.all([
					this.ensureBookEmbed(channel, messages),
					this.ensureNovellaEmbed(channel, messages),
					this.ensureShowEmbed(channel, messages),
					this.ensureIntroEmbed(channel, messages)
				]);
			})
		);
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
		title: string, thumbnail: string
	) : Promise<Message> {
		const embedMessages: Message[] = messages.array().filter(
			(message: Message) => message.embeds.some(embed => embed.title === title)
		);
		if (embedMessages.length === 0) {
			const embed: MessageEmbed = new MessageEmbed;
			embed.setColor(constants.embedColorBase);
			embed.setTitle(title);
			embed.setThumbnail(thumbnail);

			return channel.send(embed);
		}
		return Promise.resolve(embedMessages[0]);
	}

	private async ensureBookEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const message: Message = await this.ensureEmbed(channel, messages, 'The Expanse: Book Role Assignment', 'https://i.imgur.com/iGZGW7u.png');
		await this.reactWith(message, [
			Emoji.LeviathanWakes,
			Emoji.CalibansWar,
			Emoji.AbaddonsGate,
			Emoji.CibolaBurn,
			Emoji.NemesisGames,
			Emoji.BabylonsAshes,
			Emoji.PersepolisRising,
			Emoji.TiamatsWrath
		]);
		return message;
	}

	private async ensureNovellaEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const message: Message = await this.ensureEmbed(channel, messages, 'The Expanse: Novella Role Assignment', 'https://i.imgur.com/vuiekLb.png');
		await this.reactWith(message, [
			Emoji.TheButcherOfAndersonStation,
			Emoji.GodsOfRisk,
			Emoji.Drive,
			Emoji.TheChurn,
			Emoji.TheVitalAbyss,
			Emoji.StrangeDogs,
			Emoji.Auberon
		]);
		return message;
	}

	private async ensureShowEmbed(channel: TextChannel, messages: Collection<string, Message>) : Promise<Message> {
		const message: Message = await this.ensureEmbed(channel, messages, 'The Expanse: Show Role Assignment', 'https://i.imgur.com/kXIe12S.png');
		await this.reactWith(message, [
			Emoji.Season1,
			Emoji.Season2,
			Emoji.Season3,
			Emoji.Season4
		]);
		return message;
	}

	private ensureIntroEmbed(channel: TextChannel, messages: Collection<string, Message>): Promise<Message> {
		const title: string = 'The Expanse: Reaction-based Role Assignment';
		const embedMessages: Message[] = messages.array().filter(
			(message: Message) => message.embeds.some(embed => embed.title === title)
		);
		const description: string = 'This server has a spoiler system in place.  You only see channels for ' +
			'which you have opted into, by assigning particular roles.\n\n' +
			'Opt-in to channels by reacting to the different category messages below.\n\n' +
			'In order to remove an unwanted role, just remove your reaction by clicking the emoji once again.';
		if (embedMessages.length === 0) {
			const embed: MessageEmbed = new MessageEmbed;
			embed.setColor(constants.embedColorBase);
			embed.setTitle(title);
			embed.setDescription(description);

			return channel.send(embed);
		}
		return Promise.resolve(embedMessages[0]);
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
