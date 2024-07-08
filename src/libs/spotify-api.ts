export class SpotifyAPI extends EventTarget {
  private token = "";

  constructor(private _sp_dc: string, private _sp_t: string) {
    super();

    this.updateToken();
  }

  private async updateToken(repeat = false) {
    const page = await fetch("https://open.spotify.com/collection/playlists", {
      headers: { Cookie: "sp_dc=" + this._sp_dc + "; sp_t=" + this._sp_t },
    }).then((r) => r.text());
    const tokenMatch = page.match(/"accessToken":"([^"]*)",/);

    if (!tokenMatch) {
      if (!repeat) {
        this.updateToken(true);
        return;
      }
      throw new Error("Coludn't update Spotify token. Check sp_dc cookie");
    }

    this.token = tokenMatch[1];
  }

  private async _api(
    url: string,
    method = "GET",
    headers: Record<string, string> = {},
    body = "",
    repeat = false
  ) {
    if (repeat) await this.updateToken();

    const resp = await fetch(url, {
      method,
      headers: { Authorization: "Bearer " + this.token, ...headers },
      ...(method != "GET" ? { body } : {}),
    });
    const data = await resp.text();

    if (!resp.ok && !repeat) {
      this._api(url, method, headers, body, true);
    }

    try {
      return JSON.parse(data);
    } catch {
      return resp.ok
        ? null
        : { error: { status: 600, message: "Wrong response type" } };
    }
  }

  private async checkToken() {
    if (this.token === "") await this.updateToken();

    const me = await this._api("https://api.spotify.com/v1/me/");
    if (me.error) await this.updateToken();
  }

  async getMe() {
    await this.checkToken();
    return await this._api("https://api.spotify.com/v1/me/");
  }

  async getCurrentlyPlaying() {
    await this.checkToken();
    return await this._api(
      "https://api.spotify.com/v1/me/player/currently-playing?market=ES"
    );
  }

  async getActiveDevice() {
    await this.checkToken();
    const resp = await this._api(
      "https://api.spotify.com/v1/me/player/devices"
    );
    if (resp.error) return null;
    return resp.devices.filter((d: any) => d.is_active)[0];
  }

  async getPlaybackState() {
    await this.checkToken();
    return await this._api(
      "https://api.spotify.com/v1/me/player?market=ES"
    );
  }

  async getTrack(id: string) {
    await this.checkToken();
    return await this._api(`https://api.spotify.com/v1/tracks/${id}?market=ES`);
  }

  /* Illegal API */

  async addItemToQueue(deviceId: string, trackId: string) {
    await this.checkToken();

    const track = await this.getTrack(trackId);
    if (track.error) return false;

    const resp = await this._api(
      `https://gew1-spclient.spotify.com/connect-state/v1/player/command/from/0000000000000000000000000000000000000000/to/${deviceId}`,
      "POST",
      { "Content-Type": "text/plain;charset=UTF-8" },
      JSON.stringify({
        command: {
          track: {
            uri: "spotify:track:" + trackId,
            metadata: { is_queued: "true" },
            provider: "queue",
          },
          endpoint: "add_to_queue",
        },
      })
    );

    return !!resp.ack_id;
  }

  async skipItemInQueue(deviceId: string) {
    await this.checkToken();

    const resp = await this._api(
      `https://gew1-spclient.spotify.com/connect-state/v1/player/command/from/0000000000000000000000000000000000000000/to/${deviceId}`,
      "POST",
      { "Content-Type": "text/plain;charset=UTF-8" },
      JSON.stringify({ command: { endpoint: "skip_next" } })
    );

    return !!resp.ack_id;
  }

  async search(query: string) {
    await this.checkToken();
    const resp = await this._api(
      `https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchDesktop&variables=%7B%22searchTerm%22:%22${encodeURIComponent(
        query.replace(/\n/g, " ")
      )}%22,%22offset%22:0,%22limit%22:10,%22numberOfTopResults%22:5,%22includeAudiobooks%22:false%7D&extensions=%7B%22persistedQuery%22:%7B%22version%22:1,%22sha256Hash%22:%22977d09e29d2e5befe6dc29cff9e0458b6a0cbfa8facaf60b7c1cf53b10971c95%22%7D%7D`
    );
    if (!resp || resp.error) return null;
    if (resp.data.searchV2.tracksV2.totalCount < 1) return null;
    return resp.data.searchV2.tracksV2.items[0].item.data.id;
  }
}
