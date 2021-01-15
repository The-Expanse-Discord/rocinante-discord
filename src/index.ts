import Protomolecule from './Infrastructure/Client/Protomolecule';

function infect(): void {
	new Protomolecule({ partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] }).start();
}

infect();
