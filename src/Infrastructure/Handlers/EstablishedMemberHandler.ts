import { Message, GuildMember, TextChannel, Guild, Role } from 'discord.js';
import Rocinante from '../Client/Rocinante';
import { promises as fs } from 'fs';

/**
 * @category Handler
 */
export class EstablishedMemberHandler {
	private readonly client: Rocinante;
	private readonly establishedMemberRole: string;
	private readonly excludedCategories: string[];
	private chatCounts: Record<string, number>;
	private readonly chatCountFile: string;
	private readonly guild: string;
	private timeout: NodeJS.Timeout | null = null;

	public constructor(
		rocinante: Rocinante,
		chatCountFile: string,
		establishedMemberRole: string,
		excludedCategories: string[],
		guild: string
	) {
		this.client = rocinante;
		this.establishedMemberRole = establishedMemberRole;
		this.excludedCategories = excludedCategories;
		this.chatCountFile = chatCountFile;
		this.guild = guild;
		this.chatCounts = {};
	}

	public async init(): Promise<void> {
		this.listen();
		try {
			const jsonString: string = (await fs.readFile(this.chatCountFile)).toString('utf-8');
			this.chatCounts = JSON.parse(jsonString);
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}
		}
		this.timeout = setTimeout(() => this.heartbeat(), 10000);
	}

	public async shutdown(): Promise<void> {
		await this.save();
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	public listen(): void {
		this.client.on('message', (message: Message) => {
			this.processMessage(message);
		});
	}

	private processMessage(message: Message): void {
		const channel: TextChannel = message.channel as TextChannel;
		const parentId: string | undefined = channel.parent?.id;
		if (parentId && this.excludedCategories.includes(parentId)) {
			return;
		}

		if (message.author.bot) {
			return;
		}

		const currentCount: number = this.chatCounts[message.author.id] || 0;

		this.chatCounts[message.author.id] = currentCount + 1;
	}

	private async save(): Promise<void> {
		await fs.writeFile(this.chatCountFile, JSON.stringify(this.chatCounts));
	}

	private async assignSingleRole(userId: string, member: GuildMember, role: Role): Promise<void> {
		if (member.joinedTimestamp) {
			const joinedTimestamp: number = member.joinedTimestamp;

			if (member.roles.cache.size > 0 &&
				joinedTimestamp < Date.now() - 14 * 24 * 60 * 60 * 1000 &&
				this.chatCounts[userId] > 10 &&
				!member.roles.cache.get(role.id)
			) {
				console.log(`Adding role ${ this.establishedMemberRole } to member ${ member.displayName }`);
				await member.roles.add(role);
				// Force a refetch so the role is stored in the cache and we don't refetch it every time.
				await member.fetch(true);
			}
		}
	}

	private async assignRoles(): Promise<void> {
		const maybeGuild: Guild | undefined = this.client.guilds.cache.get(this.guild);
		if (!maybeGuild) {
			return;
		}
		const guild: Guild = maybeGuild;
		const maybeEstablishedMemberRole: Role | undefined =
			guild.roles.cache.find(role => role.name === this.establishedMemberRole);
		if (!maybeEstablishedMemberRole) {
			return;
		}
		const establishedMemberRole: Role = maybeEstablishedMemberRole;
		await Promise.all(
			Object.keys(this.chatCounts).map(async key => {
				const member: GuildMember | null = await guild.members.fetch(key);
				if (member) {
					await this.assignSingleRole(key, member, establishedMemberRole);
				}
			})
		);
	}

	private async heartbeat(): Promise<void> {
		console.log('Serious discussion handler heartbeat');
		await this.save();
		await this.assignRoles();
		this.timeout = setTimeout(() => this.heartbeat(), 10000);
	}
}
