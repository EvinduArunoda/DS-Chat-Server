import {Socket} from "net";

export function writeJSONtoSocket(sock: Socket, data: any): void {
    sock.write(Buffer.from(JSON.stringify(data)+"\n"))
}

export function readJSONfromBuffer(buffer: Buffer): any {
    return JSON.parse(buffer.toString());
}
