import { CommandInfo } from '../interfaces/command';
import { Message } from 'discord.js';
import ProtomoleculeClient from '../../bot/client/ProtomoleculeClient';

export abstract class Command<T extends ProtomoleculeClient = ProtomoleculeClient> {
	public client!: T;

	/**
	 * Command name.
	 */
	public name!: string;

	/**
	 * Command description.
	 */
	public desription!: string;

	/**
	 * Default constructor for Command class.
	 *
	 * @param info? - The CommandInfo for the Command.
	 *
	 * @returns - The command.
	 */
	public constructor(info?: CommandInfo) {
		if (info)
			Object.assign(this, info);
	}

	/**
	 * Initialize the Command.
	 *
	 * @param client - The {@link ProtomoleculeClient} to register command to.
	 *
	 * @returns - The command.
	 */
	public init(client: T): Command {
		this.client = client;

		return this;
	}

	/**
	 * Command action.
	 *
	 * @param message - The Discord message to interact with.
	 *
	 * @param args - The array of arguments from the command.
	 *
	 * @returns - Either a Message, Message[], or void.
	 */
	public abstract execute(message: Message, args: string[]): Promise<Message | Message[] | void> | Message | void;
}
