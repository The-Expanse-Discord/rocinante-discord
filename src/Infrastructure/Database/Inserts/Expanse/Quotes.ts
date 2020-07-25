import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { Connection, Repository } from 'typeorm';
import { Quote } from '../../../Entities';
import { QuoteData } from '../../../Interfaces/Expanse';

export function insertQuotes(connection: Connection): void {
	const quoteDataString: string = fs.readFileSync(
		Path.join(__dirname, '..\\..\\Data\\Expanse\\Quotes\\avasarala.json') as string, 'utf8'
	);

	const quoteData: QuoteData[] = JSON.parse(quoteDataString);

	const quoteRepo: Repository<Quote> = connection.getRepository(Quote);

	quoteData.forEach(async q => {
		await quoteRepo.save(new Quote(q));
	});

	console.log(`inserted ${ quoteData.length } quotes...`);
}
