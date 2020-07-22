import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { ReactionCategoryData } from '../../Interfaces/System';

/**
 * ## Reaction Category
 * Represents a category of reactions the Role-based Reaction system will leverage.
 *
 * @category System
 */
@Entity('System: Reaction Category')
export class ReactionCategory extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column('varchar')
	public name!: string;

	public constructor(info?: ReactionCategoryData) {
		super();
		if (info)
			Object.assign(this, info);
	}
}
