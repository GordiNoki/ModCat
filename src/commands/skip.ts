import { SpotifyAPI } from "../libs/spotify-api";
import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class SkipCommand implements Command {
  name = "skip";
  description = "Skip current playing song";
  permissions = 1;
  constructor(private _api: SpotifyAPI) {}
  async run(
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    _message: string
  ) {
    const activeDevice = await this._api.getActiveDevice();
    if (!activeDevice) {
      bot.say(channel, `@${tags.username} Couldn't find active device.`);
      return;
    }

    await this._api.skipItemInQueue(activeDevice.id);

    bot.say(channel, "Skipped...");
  }
}
