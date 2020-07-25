import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { BookData } from '../../Interfaces/Expanse';

/**
 * ## Book
 * Represents a book or novella from The Expanse.
 *
 * @category Expanse
 */
@Entity('Expanse: Books')
export class Book extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column('varchar')
	public title!: string;

	@Column('boolean', { default: false })
	public isNovella!: boolean;

	public constructor(info?: BookData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
