# discord-chats
A Discord Bot that brings email conversations and external chats to Discord!

Discord Chats Bot listens for new emails in your inbox. When you receive new mail, the bot sends a message in a customizable discord channel with a button to reply. This button will reply to the user's email.

Every message is generated into an image based off of it's HTML contents. When running the project in production (will not work locally. see the `Running Locally` section of this readme), the contents of an email/message will be represented as an image generated from the HTML.

# Contributions
Want to contribute? Open a pull request!

# Help

Need help setting up the bot? Get help in my [Discord Server](https://discord.gg/dZJpDrknXP): https://discord.gg/dZJpDrknXP

# Setup

## 1. Forking/Downloading Code
First, fork this repository or download the source code. While the code is provided as is, you may customize it to fit your needs.

## 2. Create a Bot User & Get Bot Token
Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application and bot user for that application. Copy the bot token - you will need it for the config.

If you need help, you can follow [Discord.JS's guide on creating a bot application and user](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

## 3. Config
The bot's config derives from the environment variables. Each environment variable and it's description is listed below. You **must** provide values for the required variables. A variable is optional if it's name ends with a '?'.

| Environment Variable Name | Description |
| --- | --- |
| DB_CONN | The Mongo Database connection string. By default, this project uses Mongo DB. If you want to use your own database, see the database section of this readme. |
| DB_NAME | The name of the database. |
| CHATS_COLLECTION_NAME? | `OPTIONAL - DEFAULTS TO "chats"` - the collection name to store chats in. A chat, also known as a "conversation," is used to group user's messages together. |
| MESSAGES_COLLECTION_NAME? | `OPTIONAL - DEFAULTS TO "messages"` - the collection name to store messages in. |
| BOT_TOKEN | The Discord Bot Token. You can get a token from the [Discord Developer Portal](https://discord.com/developers/applications). |
| GUILD_ID | The ID of the guild in which the messages should be sent to. **The bot user needs to be a member of the guild.** |
| CHANNEL_ID | The ID of the channel in which the messages should be sent to. The channel needs to be in the guild. |
| EMAIL | The email user to read mail from. `example@example.com`. |
| EMAIL_PASSWORD | The password to the email account. |
| IMAP_HOST | Hostname of IP address of the IMAP server. |
| DOMAIN | The domain or IP to where the server is hosted. `https://example.com` |
| PORT? | The port to run the server/API on. |
| HEALTH_CHECK_ROUTE? | `OPTIONAL - DEFAULTS TO 1` - whether or not to have a health check route on the API. 1 for true, 0 for false. Useful if you are deploying or want to monitor the server. |

## 4. Deployment & Scripts
You may use whatever host / deployment solution you'd like. The bot runs on NodeJS.

## Scripts
| Name | Description |
| --- | --- |
| start | Used to start the project, requires the project to be built first. |
| dev | Used to start the development version of the project - not ideal for production/deployment |
| build | Used to build the project - required in order to run `start` |

That's about it! If you find yourself needing help, join the [Discord Server](https://discord.gg/dZJpDrknXP) and ask for help:

# Database / Using a Custom Database
Discord Chats Bot comes with mongo DB integration by default. The database is used to store chats and messages. If you want to use a different/custom database, you can fork the repository. In the `src/services/database.ts` file, there are several helper functions. If you are implementing your own database, you must complete all of the helper functions for the project to function properly.

# Running Locally
Use `npm run dev` to run the project locally. Message content is generated into images, stored on the filesystem and served through the API. Because of this, images will not render in Discord Embeds when running locally.
