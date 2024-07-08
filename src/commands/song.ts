import { SpotifyAPI } from "../libs/spotify-api";
import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class SongCommand implements Command {
  name = "song";
  description = "Return current playing song on Spotify";
  permissions = 0;
  constructor(private _api: SpotifyAPI) {}
  async run(
    bot: TwitchBot,
    channel: string,
    _tags: Record<string, any>,
    _message: string
  ) {
    const curSong = await this._api.getCurrentlyPlaying();
    if (!curSong) {
      bot.say(channel, "Nothing is playing right now.");
      return;
    }

    bot.say(
      channel,
      `Now playing: ${curSong.item.name} - ${curSong.item.artists
        .map((s: any) => s.name)
        .join(", ")}. Listen on Spotify: ${curSong.item.external_urls.spotify}`
    );
  }
}
