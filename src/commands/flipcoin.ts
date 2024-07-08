import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class FlipCoinCommand implements Command {
  name = "flipcoin";
  description = "Flip a coin!";
  permissions = 0;
  run(
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    _message: string
  ) {
    bot.say(
      channel,
      `@${tags.username} ${!!Math.round(Math.random()) ? "Heads" : "Tails"}`
    );
  }
}
