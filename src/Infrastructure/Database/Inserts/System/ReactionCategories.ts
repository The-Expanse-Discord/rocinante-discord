import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { Repository, Connection } from 'typeorm';
import { ReactionCategory } from '../../../Entities';
import { ReactionCategoryData } from '../../../Interfaces/System';

export async function insertReactionCategories(connection: Connection): Promise<void> {
	const reactionCategoryString: string[] = fs.readFileSync(
		Path.resolve(__dirname, '..\\..\\Data\\System\\Reactions\\reactionCategories.txt'), 'utf8'
	).split('\n');

	const reactionCategoryRepo: Repository<ReactionCategory> = connection.getRepository(ReactionCategory);
	const reactionCategories: ReactionCategory[] = [];

	for (const line of reactionCategoryString) {
		const data: string[] = line.split(',');

		const reactionCategoryData: ReactionCategoryData = {
			id: Number(data[0]),
			name: data[1]
		};

		reactionCategories.push(new ReactionCategory(reactionCategoryData));
	}

	for (const rc of reactionCategories)
		// eslint-disable-next-line no-await-in-loop
		await reactionCategoryRepo.save(rc);

	console.log(`inserted ${ reactionCategories.length } Reaction Categories...`);
}
