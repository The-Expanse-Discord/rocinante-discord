import { CommandInfo } from '../Interfaces/Command';
import { Message } from 'discord.js';
import Protomolecule from '../Client/Protomolecule';

/**
 * @category System
 */
export abstract class Command<T extends Protomolecule = Protomolecule> {
	public client!: T;

	public name!: string;

	public command!: string[];

	public description!: string;

	public usage!: string;

	public group!: string[];

	public roles!: string[];

	public rolesDebitTickets!: number;

	public unlimitedRoles!: string[];

	public unlimitedRolesDebitTickets!: number;

	public constructor(info?: CommandInfo) {
		if (info)
			Object.assign(this, info);
	}

	public init(client: T): Command {
		this.client = client;

		return this;
	}

	public abstract execute(message: Message, args: string[]):
	Promise<Message | Message[] | void> | Message | Message[] | void;
}
