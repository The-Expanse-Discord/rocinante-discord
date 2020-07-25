import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { CharacterData } from '../../Interfaces/Expanse';

/**
 * ## Character
 * Represents a character from The Expanse.
 *
 * @category Expanse
 */
@Entity('Expanse: Characters')
export class Character extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column('varchar')
	public firstName!: string;

	@Column('varchar')
	public lastName!: string;

	public constructor(info?: CharacterData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
