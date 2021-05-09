import { Message } from 'discord.js';
import Rocinante from '../Client/Rocinante';

export interface CommandInfo {
	name: string;
	command: string[];
	description: string;
	usage: string;
	roles: string[];
	commandsPerMinute: number;
	commandSurgeMax: number;
}

/**
 * @category System
 */
export abstract class Command<T extends Rocinante = Rocinante> {
	public client!: T;

	public name!: string;

	public command!: string[];

	public description!: string;

	public usage!: string;

	public roles!: string[];

	public commandsPerMinute!: number;

	public commandSurgeMax!: number;

	public constructor(info?: CommandInfo) {
		if (info) {
			Object.assign(this, info);
		}
	}

	public init(client: T): Command {
		this.client = client;

		return this;
	}

	public abstract execute(message: Message, args: string[]):
	Promise<Message | Message[] | void> | Message | Message[] | void;
}
