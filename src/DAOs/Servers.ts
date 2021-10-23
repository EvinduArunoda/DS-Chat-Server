export class ServersDAO {
    private leaderId: string = '';
    private availableServers: Set<string> = new Set<string>();

    constructor() { }

    getLeaderId(): string {
        return this.leaderId;
    }

    setLeaderId(leaderId: string) {
        console.log('SET LEADER', leaderId)
        this.leaderId = leaderId;
    }
}
