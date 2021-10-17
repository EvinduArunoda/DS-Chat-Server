import { Socket } from "net";
import { ElectionService } from "../Services/electionService";

export class ElectionHandler  {
    setElectedLeader(data: any): boolean {
        return ElectionService.setElectedLeader(data);
    }
    approveElection(data: any, sock: Socket): Promise<boolean> {
        return ElectionService.approveElection(data, sock);
    }
}