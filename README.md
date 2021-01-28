# Protomolecule
<!-- [![Discord](https://discordapp.com/api/guilds/288472445822959618/embed.png)](https://discord.gg/js6mUj5) -->

[![build](https://github.com/The-Expanse-Discord/Protomolecule/workflows/build/badge.svg?branch=base)](https://github.com/The-Expanse-Discord/Protomolecule/actions?query=workflow%3Abuild)

[![dependencies Status](https://david-dm.org/the-expanse-discord/protomolecule/status.svg)](https://david-dm.org/the-expanse-discord/protomolecule)
[![devDependencies Status](https://david-dm.org/the-expanse-discord/protomolecule/dev-status.svg)](https://david-dm.org/the-expanse-discord/protomolecule?type=dev)

General purpose bot for The Expanse Discord server.

## Running locally

Put the following in a file named config.json5:

```json
{
	"token": "<bot token>",
	"owner": "<owner discord id>",
	"commandPrefix": ".",
	"statusType": "WATCHING",
	"statusText": "you sleep...",
	// A map from servers to reaction channels
	"welcomeChannels": {
        "{SERVER_ID}": "{CHANNEL_ID}",
    }
}
```

Use npx to run the bot:
`npx @johndaniels/protomolecule config.json`

Or install the command and run it:
```sh
npm install -g @johndaniels/protomolecule

protomolecule cconfig.json5
```




## Developer Setup
Copy the example config files over to a usable config.
```sh
cp .\config.example.json5 config.json5
```

### Update Configs
View the files and identify the values that you need to supply.

npm install
npm run dev
 - Edit `config.json` with the appropriate values.
	- `token` - Discord bot token.
	- `owner` - The Discord ID of the bot owner.
	- `commandPrefix` - Specify the command prefix.
	- `statusType` - What status is the bot?
	- `statusText` - Accompanying text for the bot status.
	- `welcomeChannels` - A mapping of guild IDs to welcome channels. Protomolecule will use these to automatically create a welcome message and messages to react to.

After running these, you will also need to set up any guilds in welcomeChannels with the appropriate emoji and roles.

You can set up emoji with appropriate images and names matching those in the Emoji.ts file under `src/Infrastructure/Enums/Role Assignment`. You'll also have to set up roles with the same names (although spaces are allowed in the roles). 

### Lint
```sh
npm run code:lint
```
Correct any lint errors you might have.

### Build
```sh
npm run code:build
```

### Run Development Build

```sh
npm run dev
```

### Debugging
Run the VSCode `launch` task to spin up a temporary instance for debugging.
