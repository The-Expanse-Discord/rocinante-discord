import 'reflect-metadata';
import { Repository, Connection } from 'typeorm';
import { QuoteSource } from '../../../Entities';

export async function insertQuoteSources(connection: Connection): Promise<void> {
	const quoteSourceRepo: Repository<QuoteSource> = connection.getRepository(QuoteSource);
	const bookSource: QuoteSource = new QuoteSource({ id: 1, name: 'Book' });
	const showSource: QuoteSource = new QuoteSource({ id: 2, name: 'Show' });

	await quoteSourceRepo.save(bookSource);
	await quoteSourceRepo.save(showSource);
	console.log(`inserted 2 Quote Sources...`);
}
