/* eslint-disable @typescript-eslint/camelcase */

import { Emoji } from 'discord.js';

export interface Raw {
	t: string;
	s: number;
	op: number;
	d?: Reaction;
}

export interface Reaction {
	user_id: string;
	message_id: string;
	op: number;
	emoji: Emoji;
	channel_id: string;
	guild_id: string;
}
