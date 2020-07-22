import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { createConnection, Repository } from 'typeorm';
import { Quote } from '../../../Entities';
import { QuoteData } from '../../../Interfaces/Expanse';

/**
 * @ignore
 */
const quoteDataString: string = fs.readFileSync(
	Path.join(__dirname, '..\\..\\Data\\Expanse\\Quotes\\avasarala.json') as string, 'utf8'
);

/**
 * @ignore
 */
const quoteData: QuoteData[] = JSON.parse(quoteDataString);

createConnection()
	.then(connection => {
		const quoteRepo: Repository<Quote> = connection.getRepository(Quote);

		quoteData.forEach(async q => {
			await quoteRepo.save(new Quote(q));
		});
	})
	.catch(error => {
		console.log(error);
	});
