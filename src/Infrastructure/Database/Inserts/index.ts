import { createConnection } from 'typeorm';
import { insertBooks, insertCharacters, insertQuoteSources, insertQuotes } from './Expanse';
import { insertReactionCategories } from './System';

createConnection()
	.then(async connection => {
		await insertBooks(connection);
		await insertCharacters(connection);
		await insertQuoteSources(connection);
		insertQuotes(connection);
		await insertReactionCategories(connection);
	})
	.catch(error => {
		console.log(error);
	});
