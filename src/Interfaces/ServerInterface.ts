import { getServerIdNumber } from "../Utils/utils"

export interface ServerInterface {
    [key:number]: Server
}

export class Server {
    private serverid: number
    private address: string
    public clientsPort: number
    public coordinationPort: number

    constructor(serverid: number, serverAddress: string, clientsPort: number, coordinationPort: number) {
        this.serverid = serverid
        this.address = serverAddress
        this.clientsPort = clientsPort
        this.coordinationPort = coordinationPort
    }

    get serverAddress(): string {
        if((this.serverid + getServerIdNumber()) % 2 === 0) return 'localhost'
        return this.address
    }
}