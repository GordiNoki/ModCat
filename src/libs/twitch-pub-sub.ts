import ReconnectingWebSocket from "reconnecting-websocket";
import { WebSocket } from "ws";
import { EventEmitter } from "events";

export class TwitchPubSub extends EventEmitter {
  private WSURL = "wss://pubsub-edge.twitch.tv";

  private _ws: ReconnectingWebSocket;

  private _pingPong: number;
  private _ponged = false;
  private _subscribedTopics: string[] = [];

  constructor() {
    super();

    this._ws = new ReconnectingWebSocket(this.WSURL, [], {
      WebSocket,
      maxRetries: 3,
      reconnectionDelayGrowFactor: 2,
    });

    this._ws.onopen = this._onOpen.bind(this);
    this._ws.onmessage = this._onMessage.bind(this);
    this._ws.onclose = this._onClose.bind(this);
  }

  public listen(topic: string) {
    this._subscribedTopics.push(topic);
    if (this._ws.readyState == WebSocket.OPEN) {
      this._send({
        type: "LISTEN",
        nonce: "notcare",
        data: {
          topics: [topic],
        },
      });
    }
  }

  private _send(data: string | object) {
    if (typeof data == "object") data = JSON.stringify(data);
    this._ws.send(data);
  }

  private _onOpen() {
    this.emit("open");

    this._pingPong = window.setInterval(() => {
      this._send({
        type: "PING",
      });

      setTimeout(() => {
        if (!this._ponged) this._ws.reconnect();
        else this._ponged = false;
      }, 10000);
    }, 300000 + Math.floor(Math.random() * 1000));

    this._send({
      type: "LISTEN",
      nonce: "notcare",
      data: {
        topics: this._subscribedTopics,
      },
    });
  }

  private _onMessage(pkg: MessageEvent) {
    this._handleMessage(JSON.parse(pkg.data));
  }

  private _onClose() {
    if (this._pingPong) clearInterval(this._pingPong);
  }

  private _handleMessage(pkg: any) {
    this.emit("raw", pkg);

    if (pkg.type == "PONG") {
      this._ponged = true;
      return;
    }

    if (pkg.type == "MESSAGE") {
      const message = JSON.parse(pkg.data.message);
      this.emit(message.type, { ...message.data, _topic: pkg.data.topic });
    }

    if (pkg.type == "RECONNECT") {
      this._ws.reconnect();
    }
  }
}
