export class RideNotFoundError extends Error {
    statusCode: number;
    error_code: string;
    error_description: string;

    constructor() {
        super();
        this.statusCode = 404;
        this.error_code = 'NO_RIDES_FOUND';
        this.error_description = 'Nenhum registro encontrado';
    }
}
