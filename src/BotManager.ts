import { from, Observable, zip } from "rxjs";
import { Message, Wechaty, WechatyOptions } from "wechaty";
import WechatBot from "./core/WechatBot";

export default class BotManager {
    private static bots: Map<string, WechatBot> = new Map<string, WechatBot>();

    public static Bootstrap(bots: WechatyOptions[]): Promise<BotManager> {
        return new Promise((resolve) => {
            this.bots = new Map<string, WechatBot>(
                bots.map((_bot) => [
                    _bot.name ?? "default_robot",
                    new WechatBot(new Wechaty(_bot)),
                ])
            );

            const _allBots = Array.from(this.bots.values());
            zip(..._allBots.map((_bot) => from(_bot.Start()))).subscribe(() => {
                console.log("Bot ready ...");
                resolve(this);
            });
        });
    }

    public static OnMessage(): Observable<[Message, WechatBot]> {
        return new Observable<[Message, WechatBot]>((_observer) => {
            Array.from(this.bots.values()).map((_bot) => {
                _bot.OnMessage().subscribe((_message) => {
                    _observer.next([_message, _bot]);
                });
            });
        });
    }
}
