export interface ServerInterface {
    [key:string]: Server
}

export interface Server {
    serverAddress: string
    clientsPort: number
    coordinationPort: number
}