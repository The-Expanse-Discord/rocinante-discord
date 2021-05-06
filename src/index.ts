import Rocinante from './Infrastructure/Client/Rocinante';

export function infect(): void {
	new Rocinante({ partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ] }).start();
}
