import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { Repository, Connection } from 'typeorm';
import { Character } from '../../../Entities';
import { CharacterData } from '../../../Interfaces/Expanse';

export async function insertCharacters(connection: Connection): Promise<void> {
	const characterDataString: string[] = fs.readFileSync(
		Path.resolve(__dirname, '..\\..\\Data\\Expanse\\characters.txt'), 'utf8'
	).split('\n');

	const characterRepo: Repository<Character> = connection.getRepository(Character);
	const characters: Character[] = [];

	for (const line of characterDataString) {
		const data: string[] = line.split(',');

		const characterData: CharacterData = {
			id: Number(data[0]),
			firstName: data[1],
			lastName: data[2]
		};

		characters.push(new Character(characterData));
	}

	for (const c of characters)
		// eslint-disable-next-line no-await-in-loop
		await characterRepo.save(c);

	console.log(`inserted ${ characters.length } characters...`);
}
