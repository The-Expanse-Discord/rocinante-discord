import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { createConnection, Repository } from 'typeorm';
import { Character } from '../../../Entities';
import { CharacterData } from '../../../Interfaces/Expanse';

/**
 * @ignore
 */
const characterDataString: string = fs.readFileSync(
	Path.join(__dirname, '..\\..\\Data\\Expanse\\characters.json') as string, 'utf8'
);

/**
 * @ignore
 */
const characterData: CharacterData[] = JSON.parse(characterDataString);

createConnection()
	.then(connection => {
		const characterRepo: Repository<Character> = connection.getRepository(Character);

		characterData.forEach(async c => {
			await characterRepo.save(new Character(c));
		});
	})
	.catch(error => {
		console.log(error);
	});
