import { SpotifyAPI } from "../libs/spotify-api";

export async function SpotifyAddSong(
  api: SpotifyAPI,
  query: string
): Promise<{ status: SpotifyAddSongStatus; track?: any }> {
  let trackId = "";
  query = query.replace(/[\r\n]/g, "");

  const isUrl = query.match(
    /http(?:s)?:\/\/(?:open\.)?spotify\.com\/track\/([^?]*)/
  );
  if (isUrl) trackId = isUrl[1];
  else {
    const res = await api.search(query);

    if (!res) return { status: SpotifyAddSongStatus.SongSearchError };

    trackId = res;
  }

  const activeDevice = await api.getActiveDevice();
  if (!activeDevice)
    return { status: SpotifyAddSongStatus.GetActiveDeviceError };

  const addToQueueStatus = await api.addItemToQueue(activeDevice.id, trackId);
  if (!addToQueueStatus) return { status: SpotifyAddSongStatus.AddItemError };

  const playbackState = await api.getPlaybackState();
  if (
    playbackState?.actions?.disallows?.pausing ||
    playbackState?.actions?.pausing
  ) {
    await api.skipItemInQueue(activeDevice.id);
  }

  const track = await api.getTrack(trackId);

  return { status: SpotifyAddSongStatus.Success, track };
}

export enum SpotifyAddSongStatus {
  Success = 0,
  AddItemError = 1,
  GetActiveDeviceError = 2,
  SongSearchError = 3,
}
