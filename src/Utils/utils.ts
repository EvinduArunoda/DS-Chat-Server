import {Socket} from "net";

export function writeJSONtoSocket(sock: Socket, data: any): void {
    sock.write(Buffer.from(JSON.stringify(data)+"\n"))
}

export function readJSONfromBuffer(buffer: Buffer): any {
    return JSON.parse(buffer.toString());
}

export function isValidIdentity(identity: string): boolean {
    // check if identity is alphanumeric string starting with an upper or lower case character. 
    // It must be at least 3 characters and no more than 16 characters long.
    return /^[A-Za-z]{1}[A-Za-z0-9]{2,15}$/.test(identity)
}

export function getMainHallId(): string {
    return `MainHall-${process.env.SERVER_ID}`;
}

export function getServerId(): string {
    return `${process.env.SERVER_ID}`;
}