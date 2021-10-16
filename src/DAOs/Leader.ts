export class LeaderDAO {
    private leaderId: string = '';

    constructor() { }

    getLeaderId(): string {
        return this.leaderId;
    }

    setLeaderId(leaderId: string) {
        this.leaderId = leaderId;
    }

}