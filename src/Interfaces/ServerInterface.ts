export interface ServerInterface {
    [key:string]: Server
}

export interface Server {
    host: string
    port: number
}