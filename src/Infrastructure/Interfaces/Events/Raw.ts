import { Reaction } from './Reaction';

/**
 * @category Events
 */
export interface Raw {
	d: Reaction;
	op: number;
	s: number;
	t: string;
}
