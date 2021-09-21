import { writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";

export class ChatroomService {
    constructor() { }

    static broadbast(roomId: string, message: any): void {
        const participants = ServiceLocator.chatroomDAO.getParticipants(roomId);
        // get sockets
        const clients = ServiceLocator.clientsDAO.getClientsFromId(Array.from(participants))
        // broeadcast
        clients.forEach(client => {
            writeJSONtoSocket(client.socket, message);
        })
    }

    static broadbastExceptSender(senderId: string, roomId: string, message: any): void {
        // get a copy of set
        const participants = new Set(ServiceLocator.chatroomDAO.getParticipants(roomId));
        // remove sender
        participants.delete(senderId)
        // get sockets
        const clients = ServiceLocator.clientsDAO.getClientsFromId(Array.from(participants))
        // broeadcast
        clients.forEach(client => {
            writeJSONtoSocket(client.socket, message);
        })
    }
}