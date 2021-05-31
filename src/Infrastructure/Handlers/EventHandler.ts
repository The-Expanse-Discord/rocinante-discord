import { Message } from 'discord.js';
import Rocinante from '../Client/Rocinante';

/**
 * @category Handler
 */
export class EventHandler {
	private readonly client: Rocinante;
	private readonly amaChannel: string;
	
	public constructor(proto: Rocinante, amaChannel: string) {
		this.client = proto;
		this.amaChannel = amaChannel;
	}

	public init(): void {
		this.listen();
	}

	public listen(): void {
		this.client.on('message', async(message: Message) => {
			await this.processMessage(message);
		});
	}

	public async processMessage(message: Message): Promise<void> {
		if (message.channel.id === this.amaChannel)
			await message.react('😄');
	}
}
