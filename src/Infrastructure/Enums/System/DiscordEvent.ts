/**
 * ## Discord Event
 * Represents Discord events that Protomolecule listens for.
 *
 * `ready`, `message`, `disconnect`, `messageReactionAdd`, `messageReactionRemove`
 *
 * @category System
 */
export enum DiscordEvent {
	Ready = 'ready',
	Message = 'message',
	Disconnect = 'disconnect',
	ReactionAdd = 'messageReactionAdd',
	ReactionRemove = 'messageReactionRemove'
}
