import _ from "lodash";
import { from, fromEventPattern, Observable, zip } from "rxjs";

import { Contact, Message, Room, Wechaty, ScanStatus } from "wechaty";

export const delaytime = (time: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, time));

export default class WechatBot {
    /** wechaty instance */
    private bot: Wechaty;

    public get Bot(): Wechaty {
        return this.bot;
    }

    /**
     * Name of wechaty bot
     */
    public get Name(): string {
        return this.bot ? this.bot.name() : "unknown";
    }

    /**
     * Construct a wechat bot
     * @param bot wechaty instance
     */
    constructor(bot: Wechaty) {
        this.bot = bot;
    }

    /**
     * boot robot
     * @returns
     */
    public OnStart(): Observable<void> {
        return fromEventPattern<void>(
            (_) => this.bot.addListener("start", _),
            (_) => this.bot.removeListener("start", _)
        );
    }

    /**
     * login to observable
     * @returns login callbacks
     */
    public OnLogin(): Observable<Contact> {
        return fromEventPattern<Contact>(
            (_) => this.bot.addListener("login", _),
            (_) => this.bot.removeListener("login", _)
        );
    }
    /**
     * Scan event to observable
     */
    public OnScan(): Observable<[string, ScanStatus]> {
        return fromEventPattern<[string, ScanStatus]>(
            (_) => this.bot.addListener("scan", _),
            (_) => this.bot.removeListener("scan", _)
        );
    }

    /**
     * Ready event to observable
     */
    public OnReady(): Observable<void> {
        return fromEventPattern<void>(
            (_) => this.bot.addListener("ready", _),
            (_) => this.bot.removeListener("ready", _)
        );
    }

    /**
     * Message event to observable
     */
    public OnMessage(): Observable<Message> {
        return fromEventPattern<Message>(
            (_) => {
                this.bot.addListener("message", _);
            },
            (_) => {
                this.bot.removeListener("message", _);
            }
        );
    }
}
