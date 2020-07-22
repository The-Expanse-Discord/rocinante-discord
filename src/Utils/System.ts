/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Command } from '../Infrastructure/System';
import { Message, MessageEmbed, Role, GuildMember } from 'discord.js';
import { RoleCategory, Emoji } from '../Infrastructure/Enums/Role Assignment';
import constants from './Constants';

export class System {
	public static getNonNull(jsonObject: {[key: string]: string}, key: string): string {
		if (!(key in jsonObject))
			throw new Error(`Missing required configuration key: ${ key }`);

		return jsonObject[key];
	}

	public static flattenArray<T>(array: (T | T[])[]): T[] {
		const result: T[] = [];

		for (const item of array)
			if (item instanceof Array)
				result.push(...this.flattenArray(item));
			else
				result.push(item);

		return result;
	}

	public static findCommandClasses(obj: any): any {
		const foundClasses: Command[] = [];
		const keys: string[] = Object.keys(obj);

		if (Command.prototype.isPrototypeOf(obj.prototype))
			foundClasses.push(obj);
		else if (keys.length > 0)
			for (const key of keys)
				if (Command.prototype.isPrototypeOf(obj[key].prototype))
					foundClasses.push(this.findCommandClasses(obj[key]));

		return this.flattenArray(foundClasses);
	}

	public static createReactionEmbed(category: number): MessageEmbed {
		const embed: MessageEmbed = new MessageEmbed;
		switch (category) {
			case RoleCategory.Book:
				embed.setColor(constants.embedColorBase);
				embed.setTitle('The Expanse: Book Role Assignment');
				embed.setThumbnail('https://i.imgur.com/iGZGW7u.png');
				embed.setDescription('React below to opt-in to specific book channels.');
				return embed;

			case RoleCategory.Novella:
				embed.setColor(constants.embedColorBase);
				embed.setTitle('The Expanse: Novella Role Assignment');
				embed.setThumbnail('https://i.imgur.com/vuiekLb.png');
				embed.setDescription('React below to opt-in to specific novella channels.');
				return embed;

			case RoleCategory.Show:
				embed.setColor(constants.embedColorBase);
				embed.setTitle('The Expanse: Show Role Assignment');
				embed.setThumbnail('https://i.imgur.com/kXIe12S.png');
				embed.setDescription('React below to opt-in to specific show channels.');
				return embed;

			default:
				embed.setColor(constants.embedColorBase);
				embed.setTitle('The Expanse: Reaction-based Role Assignment');
				embed.setDescription('This server has a spoiler system in place.  You only see channels for ' +
					'which you have opted into, by assigning particular roles.\n\n' +
					'Opt-in to channels by reacting to the different category messages below.\n\n' +
					'In order to remove an unwanted role, just remove your reaction by clicking the emoji once again.');
				return embed;
		}
	}

	public static async sendBookEmbed(message: Message): Promise<string> {
		const bookEmbed: MessageEmbed | null = System.createReactionEmbed(RoleCategory.Book);
		const bookMessage: Message = await message.channel.send(bookEmbed);

		this.reactWith(bookMessage, [
			Emoji.LeviathanWakes,
			Emoji.CalibansWar,
			Emoji.AbaddonsGate,
			Emoji.CibolaBurn,
			Emoji.NemesisGames,
			Emoji.BabylonsAshes,
			Emoji.PersepolisRising,
			Emoji.TiamatsWrath,
			Emoji.CurrentBook
		]);

		return bookMessage.id;
	}

	public static async sendNovellaEmbed(message: Message): Promise<string> {
		const novellaEmbed: MessageEmbed | null = System.createReactionEmbed(RoleCategory.Novella);
		const novellaMessage: Message = await message.channel.send(novellaEmbed);

		this.reactWith(novellaMessage, [
			Emoji.TheButcherOfAndersonStation,
			Emoji.GodsOfRisk,
			Emoji.Drive,
			Emoji.TheChurn,
			Emoji.TheVitalAbyss,
			Emoji.StrangeDogs,
			Emoji.Auberon,
			Emoji.CurrentNovella
		]);

		return novellaMessage.id;
	}

	public static async sendShowEmbed(message: Message): Promise<string> {
		const showEmbed: MessageEmbed = System.createReactionEmbed(RoleCategory.Show);
		const showMessage: Message = await message.channel.send(showEmbed);

		this.reactWith(showMessage, [
			Emoji.Season1,
			Emoji.Season2,
			Emoji.Season3,
			Emoji.Season4,
			Emoji.CurrentShow
		]);

		return showMessage.id;
	}

	public static async sendIntroEmbed(message: Message): Promise<void> {
		const instructionEmbed: MessageEmbed = System.createReactionEmbed(RoleCategory.Intro);
		await message.channel.send(instructionEmbed);
	}

	public static reactWith(message: Message, emoji: string[]): void {
		emoji.forEach(async(e: string) => {
			await message.react(e);
		});
	}

	public static processReaction(action: string, role: Role, member: GuildMember): void {
		switch (action) {
			case 'MESSAGE_REACTION_ADD':
				if (member.roles.cache.has(role.id))
					return;
				member.roles.add(role);
				break;

			case 'MESSAGE_REACTION_REMOVE':
				if (member.roles.cache.has(role.id))
					member.roles.remove(role);
				break;
			default:
				break;
		}
	}
}
