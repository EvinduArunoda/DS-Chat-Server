import {NewIdentityService} from "./newIdentityService";
import {Socket} from "net";

export class NewIdentityHandler {
    handle (data: any, sock: Socket) {
        const service = new NewIdentityService();
        service.handleNewIdentity(data, sock);
    }
}