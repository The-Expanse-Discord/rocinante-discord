import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, BaseEntity } from 'typeorm';
import { ReactionMessageData } from '../../Interfaces/System';
import { ReactionCategory } from './ReactionCategory';

/**
 * ## Reaction Message
 * Represents a Discord message that the Role-based Reaction system will leverage.
 *
 * @category System
 */
@Entity('System: Reaction Message')
export class ReactionMessage extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column('varchar')
	public messageId!: string;

	@JoinColumn()
	@OneToOne(() => ReactionCategory)
	public category!: ReactionCategory;

	public constructor(info?: ReactionMessageData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
