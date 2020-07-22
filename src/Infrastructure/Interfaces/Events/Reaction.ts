import { GuildMember, Emoji } from 'discord.js';

/**
 * @category Events
 */
export interface Reaction {
	user_id: string;
	message_id: string;
	member: GuildMember;
	emoji: Emoji;
	channel_id: string;
	guild_id: string;
}
