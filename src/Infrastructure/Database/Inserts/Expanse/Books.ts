import 'reflect-metadata';
import * as fs from 'fs';
import * as Path from 'path';
import { createConnection, Repository } from 'typeorm';
import { Book } from '../../../Entities';
import { BookData } from '../../../Interfaces/Expanse';

/**
 * @ignore
 */
const bookDataString: string = fs.readFileSync(
	Path.join(__dirname, '..\\..\\Data\\Expanse\\books.json') as string, 'utf8'
);

/**
 * @ignore
 */
const bookData: BookData[] = JSON.parse(bookDataString);

createConnection()
	.then(connection => {
		const bookRepo: Repository<Book> = connection.getRepository(Book);

		bookData.forEach(async b => {
			await bookRepo.save(new Book(b));
			console.log(`saved ${ b.id }`);
		});
	})
	.catch(error => {
		console.log(error);
	});
