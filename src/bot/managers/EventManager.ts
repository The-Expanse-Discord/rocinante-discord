import { Event } from '../../lib/util/Enums';
import ProtomoleculeClient from '../client/ProtomoleculeClient';

/**
 * The listener for Discord events.
 */
export default class EventManager {
	/**
	 * The Discord client.
	 */
	private readonly client: ProtomoleculeClient;

	/**
	 * Default constructor for the Events class.
	 *
	 * @param client - The running instance of the {@link ProtomoleculeClient} Discord client.
	 *
	 * @returns - The Event listner.
	 */
	public constructor(protomolecule: ProtomoleculeClient) {
		// Associate the Discord client
		this.client = protomolecule;
	}

	/**
	 * Listen to the various Discord events.
	 */
	public listen(): void {
		// On ready
		this.client.once(Event.Ready, async() => {
			// Set the Discord status text
			if (this.client.user)
				await this.client.user.setActivity(this.client.statusText, { type: this.client.statusType });
		});

		// On disconnect
		this.client.on(Event.Disconnect, () => {
			// Kill the process so pm2 can restart the bot and reconnect
			process.exit(100);
		});
	}
}
