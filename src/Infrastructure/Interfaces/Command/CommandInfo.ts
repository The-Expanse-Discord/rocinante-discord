/**
 * @category System
 */
export interface CommandInfo {
	name: string;
	command: string[];
	description: string;
	usage: string;
	group: string[];
	roles: string[];
	commandsPerSecond: number;
	commandSurgeMax: number;
}
