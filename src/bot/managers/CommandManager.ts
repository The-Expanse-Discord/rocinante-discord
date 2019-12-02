/* eslint-disable no-console */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-prototype-builtins */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from '../../lib/classes/Command';
import ProtomoleculeClient from '../client/ProtomoleculeClient';
import { Util } from '../../lib/util';

export class CommandManager {
	/**
	 * {@link ProtomoleculeClient}.
	 */
	private readonly client: ProtomoleculeClient;

	/**
	 * Default constructor for the CommandLoader class.
	 *
	 * @param protomoleculeClient - The {@link ProtomoleculeClient}.
	 *
	 * @returns - The CommandLoader.
	 */
	public constructor(protomoleculeClient: ProtomoleculeClient) {
		this.client = protomoleculeClient;
	}

	/**
	 * Load and initialize commands.
	 *
	 * @param dir - The directory to load commands from.
	 */
	public init(dir: string): void {
		// Resolve the file path
		const commandPath: string = path.resolve(dir);

		// Process sub directories
		this.traverseDir(commandPath);
	}

	/**
	 * Go through all directories under specified `dir`.
	 *
	 * @param dir - The directory to traverse.
	 */
	private traverseDir(dir: string): void {
		fs.readdirSync(dir).forEach(file => {
			const fullPath: string = path.join(dir, file);
			if (fs.lstatSync(fullPath).isDirectory())
				this.traverseDir(fullPath);
			else {
				if (!file.endsWith('.js'))
					return;

				const command: Command = require(`${ fullPath }`);
				const commandClasses: (new () => Command)[] = Util.findCommandClasses(command);

				if (commandClasses.length !== 0)
					for (const commandClass of commandClasses) {
						const commandInstance: Command = new commandClass;

						this.client.commands.set(
							commandInstance.name.toLowerCase(),
							commandInstance.init(this.client)
						);

						console.log(`${ commandInstance.name } loaded`);
					}
			}
		});
	}
}
