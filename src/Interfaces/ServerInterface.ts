export interface ServerInterface {
    [key:number]: Server
}

export interface Server {
    serverAddress: string
    clientsPort: number
    coordinationPort: number
}