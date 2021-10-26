import { Socket } from "net";
import { ElectionService } from "../Services/electionService";

export class ElectionHandler  {
    setElectedLeader(data: any, sock: Socket): boolean {
        return ElectionService.setElectedLeader(data, sock);
    }
    approveElection(data: any, sock: Socket): Promise<boolean> {
        return ElectionService.approveElection(data, sock);
    }
}