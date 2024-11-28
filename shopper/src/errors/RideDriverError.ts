export class RideDriverError extends Error {
    statusCode: number;
    error_code: string;
    error_description: string;

    constructor() {
        super();
        this.statusCode = 404;
        this.error_code = 'DRIVER_NOT_FOUND';
        this.error_description = 'Motorista não encontrado';
    }
}
