import { Socket } from "net";
import { isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";

export function checkClientExists(data: any, sock: Socket): boolean {
    const identity = data.identity
    console.log(identity)
    // TODO: Check database
    if(identity === 'identity'){
        writeJSONtoSocket(sock, {exists: true, type: "isclient", identity});
        // TODO: Inform other servers
    }else{
        writeJSONtoSocket(sock, {exists: false, type: "isclient", identity});
    }
    return true
}

export function checkChatroomExists(data: any, sock: Socket): boolean {
    const roomid = data.roomid
    // TODO: Check database
    if(roomid === 'chatRoom0'){
        writeJSONtoSocket(sock, {exists: true, type: "ischatroom", roomid});
        // TODO: Inform other servers
    }else{
        writeJSONtoSocket(sock, {exists: false, type: "ischatroom", roomid});
    }
    return true
}