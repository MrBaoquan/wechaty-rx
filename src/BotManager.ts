import { from, Observable, Subscription, zip } from "rxjs";
import { first } from "rxjs/operators";
import {
    Message,
    Wechaty,
    WechatyOptions,
    WechatyPlugin,
    ScanStatus,
    Contact,
} from "wechaty";
import WechatBot from "./core/WechatBot";

export default class BotManager {
    private static bots: Map<string, WechatBot> = new Map<string, WechatBot>();

    /**
     * Get bot by name
     * @param name bot name
     * @returns WechatBot instance
     */
    public static Get(name: string): WechatBot {
        if (!this.bots.has(name)) return undefined;
        return this.bots.get(name);
    }

    /**
     * Create bot instance by options
     * @param bots All bot options
     */
    public static Build(bots: WechatyOptions[]): typeof BotManager {
        this.bots = new Map<string, WechatBot>(
            bots.map((_bot) => [
                _bot.name ?? "default_robot",
                new WechatBot(new Wechaty(_bot)),
            ])
        );
        return this;
    }

    /**
     * Bootstrap all bots
     */
    public static Start(): Promise<unknown> {
        const _allBots = Array.from(this.bots.values());
        return zip(
            ..._allBots.map((_bot) => from(_bot.Bot.start()))
        ).toPromise();
    }

    /**
     * Register plugins for the given bot
     * @param botName name of wechaty bot
     * @param plugins plugin list
     */
    public static Use(
        botName: string,
        ...plugins: (WechatyPlugin | WechatyPlugin[])[]
    ): typeof BotManager;
    /**
     * Register plugins for all bots
     * @param plugin plugin list
     */
    public static Use(
        ...plugin: (WechatyPlugin | WechatyPlugin[])[]
    ): typeof BotManager;
    public static Use(p1: any, p2?: any): typeof BotManager {
        const _bots = Array.from(this.bots.values()).map((_bot) => _bot.Bot);
        console.log(_bots);
        if (typeof p1 === "function" || p1 instanceof Array) {
            _bots.forEach((_bot) => {
                _bot?.use(p1);
            });
        } else if (typeof p1 === "string") {
            this.bots.get(p1)?.Bot?.use(p2);
        }
        return this;
    }

    /**
     * Subscribe any bot message event
     */
    public static OnMessage(): Observable<[Message, WechatBot]> {
        return new Observable<[Message, WechatBot]>((_observer) => {
            Array.from(this.bots.values()).map((_bot) => {
                _bot.OnMessage().subscribe((_message) => {
                    _observer.next([_message, _bot]);
                });
            });
        });
    }

    /**
     * Subscribe any bot scan event
     */
    public static OnScan(): Observable<[string, ScanStatus, WechatBot]> {
        const _scanHandler: Subscription = new Subscription();
        return new Observable<[string, ScanStatus, WechatBot]>((_observer) => {
            Array.from(this.bots.values()).map((_bot) => {
                _scanHandler.add(
                    _bot.OnScan().subscribe((_results) => {
                        _observer.next([_results[0], _results[1], _bot]);
                    })
                );
            });
            return _scanHandler;
        });
    }

    /**
     * Subscribe any bot ready event
     * Completed when all bot ready
     */
    public static OnReady(): Observable<WechatBot> {
        return new Observable<WechatBot>((_observer) => {
            const _onReady = (bot: WechatBot) => {
                return new Observable<WechatBot>((_observer_1) => {
                    return bot
                        .OnReady()
                        .pipe(first())
                        .subscribe(() => {
                            _observer.next(bot);
                            _observer_1.next(bot);
                        });
                });
            };
            const _bots = Array.from(this.bots.values());
            return zip(..._bots.map((_bot) => from(_onReady(_bot)))).subscribe(
                () => {
                    _observer.complete();
                }
            );
        });
    }

    /**
     * Subscribe any bot login event
     * Completed when all bot logged in
     */
    public static OnLogin(): Observable<[Contact, WechatBot]> {
        return new Observable<[Contact, WechatBot]>((_observer) => {
            const _onLogin = (bot: WechatBot) => {
                return new Observable<Contact>((_observer_1) => {
                    return bot
                        .OnLogin()
                        .pipe(first())
                        .subscribe((_contact) => {
                            _observer.next([_contact, bot]);
                            _observer_1.next(_contact);
                        });
                });
            };
            const _bots = Array.from(this.bots.values());
            return zip(..._bots.map((_bot) => from(_onLogin(_bot)))).subscribe(
                () => {
                    _observer.complete();
                }
            );
        });
    }

    //
}
