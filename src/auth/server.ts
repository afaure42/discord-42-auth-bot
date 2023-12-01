import { Client } from "discordx";

require("dotenv").config();

import express from "express";
import axios from "axios";
import http from "http";
import { readDB } from "./auth_manager";
import { guild_id, role_id, auth_server} from "../config.json";
import { IUser } from "42.js/dist/structures/user";
import { ICampus } from "42.js/dist/structures/campus";
import { ICampusUser, InvalidCampusError } from "./custom_types";

async function getUserInformations(
	token: string,
	user_res: any,
	user_code: string,
	client: Client
) {
	const config = {
		headers: {
			Authorization: "Bearer " + token,
		},
	};
	axios
		.get("https://api.intra.42.fr/v2/me", config)
		.then(async (res: any) => {
			const db = readDB("./src/auth/users.json");
			console.log(res.data.login + " logged !");
			const found = db.find((o: any) => o.code === user_code);
			await validateAuth(found.id, res.data, res.data.campus_users, client);
			user_res.status(200).send("Bienvenue " + res.data.login + "!");
		})
		.catch((err) => {
			if (err instanceof(InvalidCampusError)) {
				user_res
					.status(403)
					.send("You dont have Paris as your primary campus");
			} else {
				console.error("Impossible to get user's informations:");
				console.log(err);
				user_res
					.status(400)
					.send("Désolé, nous n'avons pas pu récupérer tes informations");
			}
		});
}

async function validateAuth(
	discordUserId: string,
	user: IUser,
	campusUsers : ICampusUser[],
	client: Client
) {
	const guild = await client.guilds.fetch(guild_id);
	const member = await guild.members.fetch(discordUserId);

	try {
		member.roles.add(role_id);
		for (let campus of campusUsers) {
			console.log(JSON.stringify(campus))
			if (campus.is_primary && campus.campus_id != 1) { //paris's campus id is 1
				throw new InvalidCampusError()
			}
		}
		console.log(`${user.login} is set up`);
	} catch (err) {
		if (err instanceof(InvalidCampusError))
			throw err;
		console.error(err);
	}
}

export function startApp(client: Client) {
	let app = express();

	app.get("/", function (req: any, res: any) {
		const db = readDB("./src/auth/users.json");
		const user_code = req.query.user_code;
		const found = db.some((o: any) => o.code === user_code);
		if (!user_code || !found)
			res.status(400).send(
				"Désolé, nous n'avons pas pu récupérer ton code unique !"
			);
		else
			res.redirect(
				"https://api.intra.42.fr/oauth/authorize?client_id=" +
					process.env.API_CLIENT_ID +
					"&redirect_uri=" +
					encodeURI(auth_server.self_uri) +
					"/42result?user_code=" +
					user_code +
					"&response_type=code"
			);
	});

	app.get("/42result", function (req: any, user_res: any) {
		if (req.query.error || !req.query.code || !req.query.user_code) {
			console.error("Error occured during auth");
			user_res
				.status(400)
				.send("Désolé, nous n'avons pas pu t'identifier !");
		} else {
			const db = readDB("./src/auth/users.json");
			const code = req.query.code;
			const user_code = req.query.user_code;
			const found = db.some((o: any) => o.code === user_code);
			if (!found)
				user_res
					.status(400)
					.send(
						"Désolé, nous n'avons pas pu récupérer ton code unique !"
					);
			const params = {
				grant_type: "authorization_code",
				client_id: process.env.API_CLIENT_ID,
				client_secret: process.env.API_CLIENT_SECRET,
				code: code,
				redirect_uri:
					auth_server.self_uri +
					"/42result?user_code=" +
					user_code,
			};
			axios
				.post("https://api.intra.42.fr/oauth/token", params)
				.then(async (res: any) => {
					await getUserInformations(
						res.data.access_token,
						user_res,
						user_code,
						client
					);
				})
				.catch((err: any) => {
					console.error(
						"Impossible to transform user's code into token:"
					);
					console.log(err);
					user_res
						.status(400)
						.send(
							"Désolé, nous n'avons pas pu récupérer tes informations !"
						);
				});
		}
	});
	const httpServer = http.createServer(app);
	return httpServer;
}
