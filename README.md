# 0) Before use
This is a fork of the [LLD's discord bot](https://github.com/BDE-LLD/discord_bot_ts) epure of all the useless stuff. It's a simple bot that can be used to authenticate users on a discord server using their 42 intranet account.
/!\ The code is not absolutely clean, it's only an epured version of the original bot to simplify the use of the authentication system.

# 1) Install
- Clone the repo
- Install the dependencies with `npm install`
- Copy `.env.sample` to `.env` and fill the variables
- In your 42 API's application, add `[URI]/42result` to the `REDIRECT URI` field
- Fill `src/config.json` with the needed informations
- Build the bot with `npm run build`

# 2) Usage
- Invite the bot on your server
- Be sure that the selected channel is empty (the button is sent only in the first message of the channel)
- Run the bot with `npm run start`

# 3) Customization
- You can change the button in `src/create_button.ts` (Please dont't change the copyrigth)
- You can add some custom actions after the login in `src/auth/server.ts` (line 50)

# 4) License
This project is under the [MIT License](https://choosealicense.com/licenses/mit/). Feel free to use it, modify it, or do whatever you want with it. Please just keep the copyrigth in the button.