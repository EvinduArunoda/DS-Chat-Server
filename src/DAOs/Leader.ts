interface leaderIDsByServer {
    [key:number]: string
}

export class LeaderDAO {
    private leaderId: string = '';
    private leaderIDsByServer: leaderIDsByServer = {
        1: "",
        2: "",
        3: "",
    };

    constructor() { }

    getLeaderId(): string {
        return this.leaderId;
    }

    setLeaderId(leaderId: string) {
        console.log('SET LEADER', leaderId)
        this.leaderId = leaderId;
    }

    setLeaderIdByServer(leaderId: string, serverid:string) {
        console.log('SET LEADER', leaderId)
        this.leaderIDsByServer[parseInt(serverid)] = leaderId;
    }
}
