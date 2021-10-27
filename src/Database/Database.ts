export default class Database{

    private readonly data: Map<String, any> = new Map<String, any>();
    private readonly _clients: string[]= [];
    private readonly _chatRooms: Map<String, String> = new Map<String, String>()

    constructor () { }

    get clients(){
        return this._clients
    }

    addClient(clientId:string){
        this._clients.push(clientId)
    }

    get chatRooms(){
        return this._chatRooms
    }

    addChatRoom(roomid:string, serverid:string){
        this._chatRooms.set(roomid, serverid)
    }

    get leaderid(){
        return this.data.get('leaderid')
    }

    set leaderid(leaderid:string){
        this.data.set('leaderid', leaderid)
    }

}