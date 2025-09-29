
export interface Event {
    id: string;
    name: string;
    date: string;
    description: string;
}

export interface Attendee {
    id: string;
    eventId: string;
    name: string;
    email: string;
    registrationId: string;
    checkedIn: boolean;
}