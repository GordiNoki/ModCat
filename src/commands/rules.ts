import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class RulesCommand implements Command {
  name = "rules";
  description = "Правила чата";
  permissions = 0;
  async run(
    bot: TwitchBot,
    channel: string,
    _tags: Record<string, any>,
    _message: string
  ) {
    console.log(channel);
    const chData = await bot.gql.ChannelData(channel.slice(1));
    const chRules = chData.data.channel.chatSettings.rules
      .join(" ")
      .replace(/-/g, "·");

    bot.say(channel, chRules);
  }
}
