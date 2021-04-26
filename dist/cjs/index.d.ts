import { Observable } from "rxjs";
import { Message, WechatyOptions, Contact, Wechaty } from "wechaty";
declare class WechatBot {
    /** wechaty instance */
    private bot;
    get Bot(): Wechaty;
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
    Start(): Promise<WechatBot>;
    // ============== wechaty event to observable Begin ==============
    /**
     * login to observable
     * @returns login callbacks
     */
    OnLogin(): Observable<Contact>;
    OnScan(): Observable<[
        string,
        number
    ]>;
    OnReady(): Observable<void>;
    OnMessage(): Observable<Message>;
    //============== wechaty event to observable End ==============
    /**
     * quit room if no member or only robot in the room
     */
    QuitAllRoomIfEmpty(): Promise<void[]>;
    /**
     *
     *  ------------------------ PRIVATE METHODS ---------------------------------
     *
     * */
    private sys_contacts;
    // 普通联系人 不是订阅号等其他服务号
    IsNormalContact(contact: Contact): boolean;
    private quitRoomIfEmpty;
    /**
     * Regeister all bot inner events
     */
    private registerInnerEvents;
    private onScan;
    // 登录事件
    private onLogin;
    // 错误处理
    private onError;
}
declare class BotManager {
    private static bots;
    static Bootstrap(bots: WechatyOptions[]): Promise<BotManager>;
    static OnMessage(): Observable<[
        Message,
        WechatBot
    ]>;
}
export { BotManager, WechatBot };
