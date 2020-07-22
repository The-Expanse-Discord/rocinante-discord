import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { QuoteData } from '../../Interfaces/Expanse';
import { QuoteSource } from './QuoteSource';
import { Character } from './Character';
import { Book } from './Book';
import { Episode } from './Episode';

/**
 * ## Quote
 * Represents a character quote from The Expanse.
 *
 * @category Expanse
 */
@Entity('Expanse: Quotes')
export class Quote extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column('varchar')
	public copy!: string;

	@JoinColumn()
	@ManyToOne(() => Character)
	public character!: Character;

	@JoinColumn()
	@ManyToOne(() => QuoteSource)
	public source!: QuoteSource;

	@JoinColumn()
	@ManyToOne(() => Book, { nullable: true })
	public book!: Book;

	@JoinColumn()
	@ManyToOne(() => Episode, { nullable: true })
	public episode!: Episode;

	public constructor(info?: QuoteData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
