import { TwitchBot } from "../libs/twitch-bot";

export type CommandLike =
  | Command
  | Command[]
  | (new () => Command)
  | (new () => Command)[]
  | ((new () => Command) | Command)[];

export const isCommand = (object: any) =>
  "name" in object && "description" in object && "permissions" in object;

export interface Command {
  name: string;
  description: string;
  permissions: number;
  run: (
    bot: TwitchBot,
    channel: string,
    tags: Record<string, any>,
    message: string
  ) => void;
}
