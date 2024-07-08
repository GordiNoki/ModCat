import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class PingCommand implements Command {
  name = "ping";
  description = "Ping pong!";
  permissions = 0;
  run(
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    _message: string
  ) {
    console.log(tags);
    bot.say(channel, "Pong!");
  }
}
