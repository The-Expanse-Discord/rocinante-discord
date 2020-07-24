/**
 * ## Discord Event
 * Represents Discord events that Protomolecule listens for.
 *
 * `ready`, `message`, `messageReactionAdd`, `messageReactionRemove`, `disconnect`
 *
 * @category System
 */
export enum DiscordEvent {
	Ready = 'ready',
	Message = 'message',
	AddReaction = 'messageReactionAdd',
	RemoveReaction = 'messageReactionRemove',
	Disconnect = 'disconnect'
}
