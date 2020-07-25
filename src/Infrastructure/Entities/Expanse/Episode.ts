import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { EpisodeData } from '../../Interfaces/Expanse';

/**
 * ## Episode
 * Represents an episode from The Expanse TV series.
 *
 * @category Expanse
 */
@Entity('Expanse: Episodes')
export class Episode extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column('integer')
	public season!: number;

	@Column('integer')
	public number!: number;

	@Column('varchar')
	public title!: string;

	public constructor(info?: EpisodeData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
