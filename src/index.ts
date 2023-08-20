import "dotenv/config";
import "reflect-metadata";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { guild_id, auth_server } from "./config.json";
import { init as initInteractions } from "./interactions/interactions_manager";
import { create_buttons } from "./create_buttons";
import { startApp } from "./auth/server";

const token = process.env.DISCORD_BOT_TOKEN;

async function start() {
	const client = new Client({
		intents: [
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.MessageContent,
		],
		botGuilds: [guild_id],
	});

	client.once("ready", async () => {
		await create_buttons(client);
		console.log("Created buttons");
		await initInteractions(client);
		console.log("Inited interactions");
		console.log(client.user?.username + " is ready!");
	});

	client.on("interactionCreate", (interaction) => {
		client.executeInteraction(interaction);
	});

	const httpServer = startApp(client);
	await client.login(token || "");
	httpServer.listen(auth_server.port, () => {
		console.log("Auth server running on port " + auth_server.port);
	});
}
start();
