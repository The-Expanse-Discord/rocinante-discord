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
	rolesDebitTickets: number;
	unlimitedRoles: string[];
	unlimitedRolesDebitTickets: number;
}
