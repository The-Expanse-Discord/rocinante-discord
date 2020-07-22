import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { createConnection, Repository } from 'typeorm';
import { ReactionCategory } from '../../../Entities';
import { ReactionCategoryData } from '../../../Interfaces/System';

/**
 * @ignore
 */
const reactionCategoryString: string = fs.readFileSync(
	Path.join(__dirname, '..\\..\\Data\\System\\Reactions\\reactionCategories.json') as string, 'utf8'
);

/**
 * @ignore
 */
const reactionCategoryData: ReactionCategoryData[] = JSON.parse(reactionCategoryString);

createConnection()
	.then(connection => {
		const reactionCategoryRepo: Repository<ReactionCategory> = connection.getRepository(ReactionCategory);

		reactionCategoryData.forEach(async r => {
			await reactionCategoryRepo.save(new ReactionCategory(r));
		});
	})
	.catch(error => {
		console.log(error);
	});
