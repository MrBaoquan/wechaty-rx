import _ from "lodash";
import qrTerm from "qrcode-terminal";
import { from, fromEventPattern, Observable, zip } from "rxjs";

import { Contact, Message, Room, Wechaty } from "wechaty";

export const delaytime = (time: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, time));

export default class WechatBot {
    /** wechaty instance */
    private bot: Wechaty;

    public get Bot(): Wechaty {
        return this.bot;
    }

    public get Name(): string {
        return this.bot.name();
    }

    /**
     * Construct a wechat bot
     * @param bot wechaty instance
     */
    constructor(bot: Wechaty) {
        this.bot = bot;
        this.registerInnerEvents();
    }

    /**
     * boot robot
     * @returns
     */
    public async Start(): Promise<WechatBot> {
        console.log("bot start...");
        return new Promise((resolve) => {
            this.bot.start().catch(async (err) => {
                console.error("Bot start() fail:", err);
                await this.bot.stop();
            });

            this.OnReady().subscribe(async () => {
                console.log("bot ready...");
                await this.QuitAllRoomIfEmpty();
                resolve(this);
            });
        });
    }

    // ============== wechaty event to observable Begin ==============
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

    public OnScan(): Observable<[string, number]> {
        return fromEventPattern<[string, number]>(
            (_) => this.bot.addListener("scan", _),
            (_) => this.bot.removeListener("scan", _)
        );
    }

    public OnReady(): Observable<void> {
        return fromEventPattern<void>(
            (_) => {
                this.bot.addListener("ready", _);
                console.log("add on ready listener...");
            },
            (_) => {
                this.bot.removeListener("ready", _);
                console.log("remove on ready listener...");
            }
        );
    }

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

    //============== wechaty event to observable End ==============

    /**
     * quit room if no member or only robot in the room
     */
    public async QuitAllRoomIfEmpty(): Promise<void[]> {
        const _rooms = await this.bot.Room.findAll();
        return zip(
            ..._rooms.map((_room) => from(this.quitRoomIfEmpty(_room)))
        ).toPromise();
    }

    /**
     *
     *  ------------------------ PRIVATE METHODS ---------------------------------
     *
     * */

    private sys_contacts: Array<string> = [
        "漂流瓶",
        "朋友推荐消息",
        "微信运动",
        "语音记事本",
        "公众平台安全助手",
        "未命名公众号",
        "微信团队",
    ];

    // 普通联系人 不是订阅号等其他服务号
    public IsNormalContact(contact: Contact): boolean {
        return (
            (contact.type() == undefined ||
                contact.type() == this.bot.Contact.Type.Unknown) &&
            !this.sys_contacts.includes(contact.name())
        );
    }

    private async quitRoomIfEmpty(room: Room) {
        const _members = await room.memberAll();
        if (_members.length > 1) return;
        await room.quit();
        // const _topic = await room.topic();
        // console.log("quit room: %s", _topic);
    }

    /**
     * Regeister all bot inner events
     */
    private registerInnerEvents() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.bot
            .on("login", function (contact) {
                that.onLogin(contact);
            })
            .on("scan", function (qrcode: string, status: number) {
                that.onScan(qrcode, status);
            })
            .on("error", this.onError);

        // .on("message", function (msg: Message) {
        //     that.onMessage(msg);
        // })
        // /** Room events */
        // .on(
        //     "room-join",
        //     function (
        //         room: Room,
        //         inviteeList: Array<Contact>,
        //         inviter: Contact
        //     ) {
        //         that.onRoomJoin(room, inviteeList, inviter);
        //     }
        // )
        // .on(
        //     "room-leave",
        //     function (room: Room, leaverList: Array<Contact>) {
        //         that.onRoomLeave(room, leaverList);
        //     }
        // )
        // .on(
        //     "room-topic",
        //     function (
        //         room: Room,
        //         newTopic: string,
        //         oldTopic: string,
        //         changer: Contact
        //     ) {
        //         that.onRoomTopic(room, newTopic, oldTopic, changer);
        //     }
        // )
        // .on("room-invite", this.onRoomInvite)
    }

    private onScan(qrcode: string, status: number) {
        qrTerm.generate(qrcode, { small: true });

        // Generate a QR Code online via
        // http://goqr.me/api/doc/create-qr-code/
        const qrcodeImageUrl = [
            "https://api.qrserver.com/v1/create-qr-code/?data=",
            encodeURIComponent(qrcode),
        ].join("");

        console.log(
            `[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `
        );
    }

    // 登录事件
    private onLogin(user: Contact) {
        console.log(`${user.name()} login...`);
    }

    // 错误处理
    private onError(e: Error) {
        console.error("Bot error:", e);
    }
}
