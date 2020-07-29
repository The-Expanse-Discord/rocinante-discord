import Protomolecule from './Infrastructure/Client/Protomolecule';
import { createConnection } from 'typeorm';

function infect(): void {
	createConnection().then(connection => {
		new Protomolecule(connection, { partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] }).start();
	})
		.catch(error => console.log('TypeORM connection error: ', error));
}

infect();
