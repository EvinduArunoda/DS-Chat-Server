export class ServersDAO {
    private leaderId: string = '';

    constructor() { }

    getLeaderId(): string {
        return this.leaderId;
    }

    setLeaderId(leaderId: string) {
        console.log('SET LEADER', leaderId)
        this.leaderId = leaderId;
    }
}
