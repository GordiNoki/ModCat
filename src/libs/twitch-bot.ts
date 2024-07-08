import { Client as TmiClient } from "tmi.js";
import { TwitchPubSub } from "./twitch-pub-sub";
import { TwitchGQL } from "./twitch-gql";
import { Command, CommandLike, isCommand } from "../types/command";
import { Module } from "../types/module";

export class TwitchBot extends TmiClient {
  public pubsub: TwitchPubSub;
  public gql: TwitchGQL;

  private commands: Command[] = [];

  constructor(
    token: string,
    client_id: string,
    private options: { prefix?: string; debug?: boolean }
  ) {
    super({
      options: { debug: options.debug ?? false },
      identity: {
        username: "bot",
        password: "oauth:" + token,
      },
    });
    options.prefix ??= "!";

    this.pubsub = new TwitchPubSub();
    this.gql = new TwitchGQL(token, client_id);

    this.connect().catch(this.handleRejection("Connection"));

    this.on("message", (channel, tags, message, self) => {
      if (self) return;
      this._handleMessage(channel, tags, message);
    });
  }

  public registerCommands(commandLike: CommandLike) {
    if (Array.isArray(commandLike)) {
      commandLike.forEach((singleCommandLike: CommandLike) =>
        this.registerCommands(singleCommandLike)
      );
      return;
    }

    if (isCommand(commandLike)) {
      this.commands.push(commandLike as Command);
      return;
    }

    this.commands.push(new (commandLike as new () => Command)());
  }

  public registerModules(modules: Module | Module[]) {
    if (!Array.isArray(modules)) {
      new modules(this);
      return;
    }
    modules.forEach((module) => new module(this));
  }

  public getRegisteredCommands() {
    return this.commands;
  }

  public getPrefix() {
    return this.options.prefix;
  }

  public getUserPermissionsByTags(channel: string, tags: Record<string, any>) {
    let userPermission = 0;
    if (tags.mod) userPermission += 1;
    if (tags.username == channel.slice(1)) userPermission += 2;
    return userPermission;
  }

  private _handleMessage(
    channel: string,
    tags: Record<string, any>,
    message: string
  ) {
    if (!message.startsWith(this.options.prefix)) return;
    const commandName = message.split(" ")[0].slice(this.options.prefix.length);
    const command = this.commands.find(
      (command) => command.name == commandName
    );

    if (!command) {
      console.log("Unregistered command issued:", commandName);
      return;
    }

    let userPermission = this.getUserPermissionsByTags(channel, tags);

    if (userPermission < command.permissions) return;
    command.run(this, channel, tags, message);
  }

  /* Error handling */
  public handleRejection(eventName: string) {
    return (reason: string) =>
      this._rejectionHandler.bind(this)(eventName, reason);
  }

  private _rejectionHandler(eventName: string, reason: string) {
    console.error(`Error while running "${eventName}":\n${reason}`);
  }
}
