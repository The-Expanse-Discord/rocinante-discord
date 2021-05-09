
import { Command } from '../Infrastructure/System/Command';
import { Message, MessageEmbed } from 'discord.js';
import get, { AxiosResponse } from 'axios';

// rss feeds
const rssFeedXkcd: string = 'https://xkcd.com/info.0.json';

// urls
const urlXkcd: string = 'https://xkcd.com/';

interface Comic {
	num: number;
	title: string;
	img: string;
	alt: string;
}

/**
 * ## XKCD
 * XKCD Comics.
 *
 * Usage:
 * `.xkcd`
 * `.xkcd r`
 * `.xkcd 1234`
 *
 * @category Commands: Nerd
 */
export default class XKCD extends Command {
	public constructor() {
		super({
			name: 'XKCD',
			command: [ 'xkcd' ],
			description: 'Respond with an XKCD Comic',
			usage: '<prefix>xkcd <comic>?',
			argumentDescriptions: [
				{
					name: 'comic',
					description: 'Specify which comic to print. Can be \'r\' for a random comic, ' +
					'or a number to print a specific comic. Will print the latest comic if unspecified',
				},
			],
			roles: [],
			commandsPerMinute: 0.5,
			commandSurgeMax: 1.5,
		});
	}

	public async execute(message: Message, args: string[]): Promise<void> {
		let isRandom: boolean | undefined;

		if (args[0]) {
			isRandom = args[0] === 'r';
		}

		const comicNumber: number | undefined =
			args[0] && XKCD.isNumerical(args[0]) ? Number(args[0]) : undefined;

		await XKCD.fetchComic(comicNumber, isRandom)
			.then((response: MessageEmbed | string): void => {
				message.channel.send(response);
			})
			.catch((): void => {
				message.channel.send(`There was an error retrieving the XKCD Comic.`);
			});
	}

	private static async fetchComic(n?: number, isRandom?: boolean): Promise<MessageEmbed | string> {
		let uri: string = rssFeedXkcd;
		const currentComicCount: number = await this.fetchCurrentComicCount();

		if (isRandom) {
			const randomComicNumber: number = Math.floor(
				Math.random() * currentComicCount + 1
			);
			uri = `${ urlXkcd }/${ randomComicNumber }/info.0.json`;
		}

		if (n) {
			uri = `${ urlXkcd }/${ n }/info.0.json`;
		}

		if (n && n > currentComicCount) {
			return `\`${ n }\` exceeds the current maximum amount of comics, \`${ currentComicCount }\`.`;
		}

		const response: AxiosResponse = await get(uri);
		const comic: Comic = response.data;

		return this.createXkcdEmbed(comic);
	}

	private static async fetchCurrentComicCount(): Promise<number> {
		const response: AxiosResponse = await get(rssFeedXkcd);
		const result: number = response.data.num;

		return result;
	}

	private static createXkcdEmbed(item: Comic): MessageEmbed {
		return (new MessageEmbed)
			.setTitle(`xkcd: ${ item.title }`)
			.setURL(`${ urlXkcd }${ item.num }/`)
			.setImage(item.img)
			.setFooter(item.alt);
	}

	private static isNumerical(s: string | number): s is number {
		return !Number.isNaN(Number(s.toString()));
	}
}

