import Protomolecule from './Infrastructure/Client/Protomolecule';

export function infect(): void {
	new Protomolecule({ partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] }).start();
}
