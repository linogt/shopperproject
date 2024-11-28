export class RideDriverInvalidError extends Error {
    statusCode: number;
    error_code: string;
    error_description: string;

    constructor() {
        super();
        this.statusCode = 400;
        this.error_code = 'INVALID_DRIVER';
        this.error_description = 'Motorista invalido';
    }
}
