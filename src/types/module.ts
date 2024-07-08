import { TwitchBot } from "../libs/twitch-bot";

export type Module = new (bot: TwitchBot) => any;