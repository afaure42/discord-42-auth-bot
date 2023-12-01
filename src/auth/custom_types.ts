export interface ICampusUser {
	id: number;
	user_id: number;
	campus_id : number;
	is_primary: boolean;
}

export class InvalidCampusError extends Error {
    constructor() {
        super("Invalid Campus Id");

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidCampusError.prototype);

    }
}
