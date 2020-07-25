import * as Path from 'path';
import Protomolecule from './Infrastructure/Client/Protomolecule';
import { createConnection, ConnectionOptions, getConnectionOptions } from 'typeorm';
import { DatabaseSource } from './Infrastructure/Interfaces/System';

async function infect(): Promise<void> {
	const target: ConnectionOptions = await getConnectionOptions();
	const source: DatabaseSource = {
		entities: [
			Path.join(__dirname, '..\\Entities', '*.{js,ts}')
		],
		migrations: [
			Path.join(__dirname, '..\\Database\\Migrations', '*.{js,ts}')
		],
		subscriber: [
			Path.join(__dirname, '..\\Database\\Subscriber', '*.{js,ts}')
		]
	};

	createConnection(Object.assign(target, source)).then(connection => {
		new Protomolecule(connection, { partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] }).start();
	})
		.catch(error => console.log('TypeORM connection error: ', error));
}

infect();
