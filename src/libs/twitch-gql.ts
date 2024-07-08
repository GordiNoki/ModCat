export class TwitchGQL {
  private FUNCTION_HASHES: Record<string, string> = {
    Chat_ChannelData:
      "3c445f9a8315fa164f2d3fb12c2f932754c2f2c129f952605b9ec6cf026dd362",
    createPredictionEvent:
      "92268878ac4abe722bcdcba85a4e43acdd7a99d86b05851759e1d8f385cc32ea",
    DeletePrediction:
      "35d375614e426624456ee7be4a2e0fbc0a410c0a91c21f6044cb3cd5c38c4e4d",
    LockPrediction:
      "1f2b1eb44af35f055308e78ffbe81c2f958408f9b32d076a759a84ab213285d4",
    ResolvePrediction:
      "10c803ec11bb8c2957d66bc6a47349dc3c5f51d694585b5ebc37ba656da413c1",
    ChannelPointsPredictionContext:
      "beb846598256b75bd7c1fe54a80431335996153e358ca9c7837ce7bb83d7d383",
    ActiveModsCtx:
      "33ae67683712bd592657247d7dbb2a6a702807c11970d29ee31ecca699013305",
    UpdateCoPoCustomRewardStatus:
      "d940a7ebb2e588c3fc0c69a2fb61c5aeb566833f514cf55b9de728082c90361d",
    GetUserID:
      "bf6c594605caa0c63522f690156aa04bd434870bf963deb76668c381d16fcaa5",
    UserModStatus:
      "511b58faf547070bc95b7d32e7b5cdedf8c289a3aeabfc3c5d3ece2de01ae06f",
    Chat_BanUserFromChatRoom:
      "d7be2d2e1e22813c1c2f3d9d5bf7e425d815aeb09e14001a5f2c140b93f6fb67",
    EditBroadcastCategoryDropdownSearch:
      "a0e47f1da6fb322efdea367b34838928123f7cb08aaab096eea898348b2cb2c5",
    EditBroadcastContext_BroadcastSettingsMutation:
      "856e69184d9d3aa37529d1cec489a164807eff0c6264b20832d06b669ee80ea5",
    VideoPlayerStreamInfoOverlayChannel:
      "a5f2e34d626a9f4f5c0204f910bab2194948a9502089be558bb6e779a9e1b3d2",
    EditBroadcastContextQuery:
      "811152f9d1907a99c67d5711a7c52dbb30276422df1545f21afc48e697e7e224",
    CommunityTab:
      "2e71a3399875770c1e5d81a9774d9803129c44cf8f6bad64973aa0d239a88caf",
  };

  constructor(private _token: string, private _client_id: string) {}

  async _get(operation: string, variables: Record<string, any>) {
    const res = await fetch("https://gql.twitch.tv/gql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": this._client_id,
        Authorization: "OAuth " + this._token,
      },
      body: JSON.stringify([
        {
          operationName: operation,
          variables: variables,
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: this.FUNCTION_HASHES[operation],
            },
          },
        },
      ]),
    }).then((r) => r.json());
    return res[0];
  }

  ChannelData(login: string) {
    return this._get("Chat_ChannelData", { channelLogin: login });
  }

  ActiveMods(login: string) {
    return this._get("ActiveModsCtx", { login });
  }

  GetUserId(login: string) {
    return this._get("GetUserID", { login, lookupType: "ALL" });
  }

  UserModStatus(channelID: string, userID: string) {
    return this._get("UserModStatus", { channelID, userID });
  }

  SearchCategory(query: string) {
    return this._get("EditBroadcastCategoryDropdownSearch", { query });
  }

  GetBroadcasterInfo(channel: string) {
    return this._get("VideoPlayerStreamInfoOverlayChannel", {
      channel,
    });
  }

  GetBroadcastContext(login: string) {
    return this._get("EditBroadcastContextQuery", {
      login,
      isChannelOwner: true,
    });
  }

  CommunityTab(login: string) {
    return this._get("CommunityTab", {
      login,
    });
  }
}