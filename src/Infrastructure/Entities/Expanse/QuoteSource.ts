import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { QuoteSourceData } from '../../Interfaces/Expanse';

/**
 * ## Quote Source
 * Represents the source of a quote.
 *
 * @category Expanse
 */
@Entity('Expanse: Quote Sources')
export class QuoteSource extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column('varchar')
	public name!: string;

	public constructor(info?: QuoteSourceData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
