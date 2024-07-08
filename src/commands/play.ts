import { SpotifyAddSong, SpotifyAddSongStatus } from "../common/SpotifyAddSong";
import { SpotifyAPI } from "../libs/spotify-api";
import { TwitchBot } from "../libs/twitch-bot";
import { Command } from "../types/command";

export class PlayCommand implements Command {
  name = "play";
  description = "Adds song to Spotify queue";
  permissions = 1;
  constructor(private _api: SpotifyAPI) {}
  async run(
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    message: string
  ) {
    const query = message.split(" ").slice(1).join(" ");
    const res = await SpotifyAddSong(this._api, query);

    if (res.status != SpotifyAddSongStatus.Success) {
      switch (res.status) {
        case SpotifyAddSongStatus.AddItemError:
          bot.say(channel, `@${tags.username} Couldn't add song to queue.`);
          return;
        case SpotifyAddSongStatus.SongSearchError:
          bot.say(channel, `@${tags.username} Couldn't find song.`);
          return;
        case SpotifyAddSongStatus.GetActiveDeviceError:
          bot.say(channel, `@${tags.username} Couldn't find active device.`);
          return;
        default:
          console.error("Unknown error while adding song to Spotify");
          console.error(res);
          return;
      }
    }

    bot.say(
      channel,
      `${res.track.name} - ${res.track.artists
        .map((artist: any) => artist.name)
        .join(", ")}, added to queue by @${tags.username}`
    );
  }
}
