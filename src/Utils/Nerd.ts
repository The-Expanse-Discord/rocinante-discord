import { MessageEmbed } from 'discord.js';
import { APoDContent } from '../Infrastructure/Interfaces/Nerd';
import constants from './Constants';
import { load } from 'cheerio';
import get, { AxiosResponse } from 'axios';

export class Nerd {
	public static isNumerical(s: string | number): s is number {
		return !Number.isNaN(Number(s.toString()));
	}

	private static getRandomApodUri(): string {
		const now: Date = new Date;
		const min: number = new Date(1995, 5, 16).getTime();
		const max: number =
		new Date(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
			18,
			59,
			59,
			999
		).getTime() -
		5 * 60 * 60 * 1000;
		const mMin: number = new Date(1995, 5, 17).getTime();
		const mMax: number = new Date(1995, 5, 19, 23, 59, 59, 999).getTime();

		let rDate: number = Math.round(min + Math.random() * (max - min));
		while (rDate >= mMin && rDate <= mMax) {
			rDate = Math.round(min + Math.random() * (max - min));
		}

		const randomDate: Date = new Date(rDate);
		const rDay: string = `0${ randomDate.getDate().toString() }`.slice(-2);
		const rMonth: string = `0${ (randomDate.getMonth() + 1).toString() }`.slice(-2);
		const rYear: string = randomDate.getFullYear().toString();

		return `${ constants.urlApodRandom }${ rYear.slice(-2) }${ rMonth }${ rDay }.html`;
	}

	public static async fetchApod(isRandom: boolean): Promise<MessageEmbed | string> {
		const uri: string = isRandom ? this.getRandomApodUri() : constants.urlApod;
		let html: AxiosResponse;

		try {
			html = await get(uri);
			const apod: APoDContent = this.processApod(html, uri);
			return this.createApodEmbed(apod);
		} catch {
			return `There was an error retrieving the APoD.`;
		}
	}

	private static processApod(html: AxiosResponse, uri: string): APoDContent {
		const $: cheerio.Root = load(html.data);

		const title: string = $('center + center > b:first-child')
			.text()
			.trim();
		let img: string | undefined = $('img').attr('src');
		const video: string | undefined = $('iframe').attr('src');
		let desc: string = $('center + center + p')
			.text()
			.trim()
			.replace(/(\s)+/g, ' ')
			.replace(/(\r\n|\n|\r)/gm, '')
			.replace(/(Explanation:)/, '');

		desc = desc === '' ? '*There is no description for this content.*' : desc;
		desc =
			desc.length > 250 ?
				`${ desc.substring(0, 250) }...\n[read more »](${ uri })` :
				desc;

		if (video) {
			const regex: RegExp = new RegExp(/\/embed\/([a-zA-Z]\w+)/, 'g');
			const identifier: RegExpExecArray | null = regex.exec(video);
			if (identifier) {
				img = `https://i.ytimg.com/vi/${ identifier[1] }/maxresdefault.jpg`;
			}
		} else {
			img = `${ constants.urlApodImgBase }${ img }`;
		}

		return {
			title,
			desc,
			img,
			video,
		};
	}

	private static createApodEmbed(item: APoDContent): MessageEmbed {
		const embed: MessageEmbed = new MessageEmbed;
		embed.setColor('#ec1c24');
		embed.setAuthor(item.title);
		embed.setDescription(item.desc);
		embed.setFooter(`NASA Astronomy Picture of the Day`);
		if (item.img) {
			embed.setImage(item.img);
		}
		if (item.video) {
			embed.addField('Video Content', item.video, true);
		}

		return embed;
	}
}
