import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { createConnection, Repository } from 'typeorm';
import { Episode } from '../../../Entities';
import { EpisodeData } from '../../../Interfaces/Expanse';

/**
 * @ignore
 */
const episodeDataString: string = fs.readFileSync(
	Path.join(__dirname, '..\\..\\Data\\Expanse\\episodes.json') as string, 'utf8'
);

/**
 * @ignore
 */
const episodeData: EpisodeData[] = JSON.parse(episodeDataString);

createConnection()
	.then(connection => {
		const episodeRepo: Repository<Episode> = connection.getRepository(Episode);

		episodeData.forEach(async e => {
			await episodeRepo.save(new Episode(e));
		});
	})
	.catch(error => {
		console.log(error);
	});
