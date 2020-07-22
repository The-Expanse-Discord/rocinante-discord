import 'reflect-metadata';
import { createConnection, Repository } from 'typeorm';
import { QuoteSource } from '../../../Entities';
import { QuoteSourceData } from '../../../Interfaces/Expanse';

/**
 * @ignore
 */
const bookSourceData: QuoteSourceData = { id: 1, name: 'Book' };

/**
 * @ignore
 */
const showSourceData: QuoteSourceData = { id: 2, name: 'Show' };

/**
 * @ignore
 */
const bookSource: QuoteSource = new QuoteSource(bookSourceData);

/**
 * @ignore
 */
const showSource: QuoteSource = new QuoteSource(showSourceData);

createConnection()
	.then(async connection => {
		const quoteSourceRepo: Repository<QuoteSource> = connection.getRepository(QuoteSource);
		await quoteSourceRepo.save(bookSource);
		await quoteSourceRepo.save(showSource);
	})
	.catch(error => {
		console.log(error);
	});
