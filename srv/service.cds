using { workshop as db } from '../db/schema';

@(requires: 'authenticated-user')
service TicketService @(path: '/ticket') {

    @odata.draft.enabled
    entity Tickets as projection on db.Tickets;

}
