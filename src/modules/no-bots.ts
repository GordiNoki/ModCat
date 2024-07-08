import { TwitchBot } from "../libs/twitch-bot";

export class NoBots {
  constructor(private _bot: TwitchBot) {
    setInterval(this.invokeCleaning.bind(this), 2 * 60 * 1000);
  }

  async invokeCleaning() {
    const channels = this._bot.getChannels();

    try {
      const TwitchInsghtsResponse = await fetch(
        "https://api.twitchinsights.net/v1/bots/all"
      ).then((r) => r.json());

      if (!TwitchInsghtsResponse.bots)
        throw new Error("No bots field in Twitch Insights response");

      const bots = TwitchInsghtsResponse.bots.map(
        (bot: [string, number, number]) => bot[0]
      );

      for (let channel of channels) {
        if (channel.startsWith("#")) channel = channel.slice(1);
        console.log("Starting cleaning for " + channel);

        const communityTab = await this._bot.gql.CommunityTab(channel);
        const viewers = communityTab.data.user.channel.chatters.viewers.map(
          (viewer: { login: string }) => viewer.login
        );

        const usersToBan = bots.filter((bot: string) => viewers.includes(bot));

        console.log(usersToBan);

        usersToBan.forEach((user: string) => {
          this._bot
            .ban(channel, user, "Auto bot detection")
            .catch(this._bot.handleRejection("Bot detection ban of " + user));
        });
      }
    } catch (e) {
      this._bot.handleRejection("No bots module")(e);
    }
  }
}
