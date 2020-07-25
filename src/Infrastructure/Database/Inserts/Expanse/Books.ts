import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { Repository, Connection } from 'typeorm';
import { Book } from '../../../Entities';
import { BookData } from '../../../Interfaces/Expanse';

export async function insertBooks(connection: Connection): Promise<void> {
	const bookDataString: string[] = fs.readFileSync(
		Path.resolve(__dirname, '..\\..\\Data\\Expanse\\books.txt'), 'utf8'
	).split('\n');

	const bookRepo: Repository<Book> = connection.getRepository(Book);
	const books: Book[] = [];

	for (const line of bookDataString) {
		const data: string[] = line.split(',');

		const bookData: BookData = {
			id: Number(data[0]),
			title: data[1],
			isNovella: data[2] === 'true'
		};

		books.push(new Book(bookData));
	}

	for (const b of books)
		// eslint-disable-next-line no-await-in-loop
		await bookRepo.save(b);

	console.log(`inserted ${ books.length } books...`);
}
