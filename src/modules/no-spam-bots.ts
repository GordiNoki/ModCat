import { TwitchBot } from "../libs/twitch-bot";

export class NoSpamBots {
  constructor(private _bot: TwitchBot) {
    this._bot.on("message", (channel, tags, message, _self) => {
      if (tags["first-msg"] && message.length > 60) this._bot.deletemessage(channel, tags.id);
    });
  }
}
