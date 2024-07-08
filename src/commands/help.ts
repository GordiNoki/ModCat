import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class HelpCommand implements Command {
  name = "help";
  description = "Вывыести это сообщение";
  permissions = 0;
  run(
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    _message: string
  ) {
    const commands = bot.getRegisteredCommands();
    const userPermission = bot.getUserPermissionsByTags(channel, tags);
    const commandPrefix = bot.getPrefix();

    const allowedCommands = commands.filter(
      (command) => userPermission >= command.permissions
    );
    bot
      .whisper(
        tags.username,
        `Досутпные комманды: ${allowedCommands
          .map(
            (command) =>
              `${commandPrefix}${command.name} - ${command.description}`
          )
          .join(" · ")}`
      )
      .catch((reason: string) => {
        bot.say(
          channel,
          `@${tags.username} ошибка в отпраке личного сообщеня.`
        );
        bot.handleRejection("Help whisper")(reason);
      });
  }
}
