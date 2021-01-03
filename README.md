# Protomolecule
<!-- [![Discord](https://discordapp.com/api/guilds/288472445822959618/embed.png)](https://discord.gg/js6mUj5) -->

[![build](https://github.com/The-Expanse-Discord/Protomolecule/workflows/build/badge.svg?branch=base)](https://github.com/The-Expanse-Discord/Protomolecule/actions?query=workflow%3Abuild)

[![dependencies Status](https://david-dm.org/the-expanse-discord/protomolecule/status.svg)](https://david-dm.org/the-expanse-discord/protomolecule)
[![devDependencies Status](https://david-dm.org/the-expanse-discord/protomolecule/dev-status.svg)](https://david-dm.org/the-expanse-discord/protomolecule?type=dev)

General purpose bot for The Expanse Discord server.


## Initial Setup
Copy the example config files over to a usable config.
```sh
cp ormconfig.example.json ormconfig.json
cp .\src\Infrastructure\Client\config.example.json config.json
```

## Update Configs
View the files and identify the values that you need to supply.

 - Edit `ormconfig.json` with the appropriate values:
	- `host` - hostname of your postgres server.
	- `username` - username for an account within your postgres server.
	- `password` - password for user specified above.
	- `database` - database to interact with.

npm install
npm run dev
 - Edit `config.json` with the appropriate values.
	- `token` - Discord bot token.
	- `owner` - The Discord ID of the bot owner.
	- `commandPrefix` - Specify the command prefix.
	- `statusType` - What status is the bot?
	- `statusText` - Accompanying text for the bot status.

## Lint
```sh
npm run code:lint
```
Correct any lint errors you might have.

## Build
```sh
npm run code:build
```

## Debugging
Run the VSCode `launch` task to spin up a temporary instance for debugging.
