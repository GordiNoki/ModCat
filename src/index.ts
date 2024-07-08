import { TwitchBot } from "./libs/twitch-bot";
import { SpotifyAPI } from "./libs/spotify-api";
import { config as dotenv } from "dotenv";

import { PingCommand } from "./commands/ping";
import { FlipCoinCommand } from "./commands/flipcoin";
import { PlayCommand } from "./commands/play";
import { SkipCommand } from "./commands/skip";
import { HelpCommand } from "./commands/help";
import { SongCommand } from "./commands/song";
import { RulesCommand } from "./commands/rules";

import { NoBots } from "./modules/no-bots";
import { NoSpamBots } from "./modules/no-spam-bots";

dotenv();
const config = process.env as {
  channel: string;
  prefix: string;
  twitch_token: string;
  twitch_client_id: string;
  debug: string;
  spotify_cookie: string;
  spotify_cookie_tea: string;
};

const bot = new TwitchBot(config.twitch_token, config.twitch_client_id, {
  debug: config.debug == "true",
  prefix: config.prefix || "!",
});
const spotifyApi = new SpotifyAPI(
  config.spotify_cookie,
  config.spotify_cookie_tea
);

bot.registerCommands([
  PingCommand,
  FlipCoinCommand,
  new PlayCommand(spotifyApi),
  new SkipCommand(spotifyApi),
  new SongCommand(spotifyApi),
  HelpCommand,
  RulesCommand,
]);

bot.registerModules([NoSpamBots, NoBots]);

bot.on("connected", () => {
  bot
    .join(config.channel)
    .catch(bot.handleRejection("Joining " + config.channel));
});
