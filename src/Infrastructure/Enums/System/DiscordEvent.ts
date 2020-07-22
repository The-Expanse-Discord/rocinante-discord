/**
 * ## Discord Event
 * Represents Discord events that Protomolecule listens for.
 *
 * `raw`, `ready`, `message`, `disconnect`
 *
 * @category System
 */
export enum DiscordEvent {
	Raw = 'raw',
	Ready = 'ready',
	Message = 'message',
	Disconnect = 'disconnect'
}
