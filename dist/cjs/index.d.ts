import { Observable } from "rxjs";
import { Message, WechatyOptions, WechatyPlugin, ScanStatus, Contact, Wechaty } from "wechaty";
declare class WechatBot {
    /** wechaty instance */
    private bot;
    get Bot(): Wechaty;
    /**
     * Name of wechaty bot
     */
    get Name(): string;
    /**
     * Construct a wechat bot
     * @param bot wechaty instance
     */
    constructor(bot: Wechaty);
    /**
     * boot robot
     * @returns
     */
    OnStart(): Observable<void>;
    /**
     * login to observable
     * @returns login callbacks
     */
    OnLogin(): Observable<Contact>;
    /**
     * Scan event to observable
     */
    OnScan(): Observable<[
        string,
        ScanStatus
    ]>;
    /**
     * Ready event to observable
     */
    OnReady(): Observable<void>;
    /**
     * Message event to observable
     */
    OnMessage(): Observable<Message>;
}
declare class BotManager {
    private static bots;
    /**
     * Get bot by name
     * @param name bot name
     * @returns WechatBot instance
     */
    static Get(name: string): WechatBot;
    /**
     * Create bot instance by options
     * @param bots All bot options
     */
    static Build(bots: WechatyOptions[]): typeof BotManager;
    /**
     * Bootstrap all bots
     */
    static Start(): Promise<unknown>;
    /**
     * Register plugins for the given bot
     * @param botName name of wechaty bot
     * @param plugins plugin list
     */
    static Use(botName: string, ...plugins: (WechatyPlugin | WechatyPlugin[])[]): typeof BotManager;
    /**
     * Register plugins for all bots
     * @param plugin plugin list
     */
    static Use(...plugin: (WechatyPlugin | WechatyPlugin[])[]): typeof BotManager;
    /**
     * Subscribe any bot message event
     */
    static OnMessage(): Observable<[
        Message,
        WechatBot
    ]>;
    /**
     * Subscribe any bot scan event
     */
    static OnScan(): Observable<[
        string,
        ScanStatus,
        WechatBot
    ]>;
    /**
     * Subscribe any bot ready event
     * Completed when all bot ready
     */
    static OnReady(): Observable<WechatBot>;
    /**
     * Subscribe any bot login event
     * Completed when all bot logged in
     */
    static OnLogin(): Observable<[
        Contact,
        WechatBot
    ]>;
}
export { BotManager, WechatBot };
