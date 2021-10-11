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

    addChatRoom(roomId:string, serverId:string){
        this._chatRooms.set(roomId, serverId)
    }

    get leaderId(){
        return this.data.get('leaderId')
    }

    set leaderId(leaderId:string){
        this.data.set('leaderId', leaderId)
    }

}