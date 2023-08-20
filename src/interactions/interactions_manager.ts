import { Client } from "discordx";
import { init as auth_button_init } from "./buttons/auth_button";

export async function init(client: Client) {
	await auth_button_init();
}
