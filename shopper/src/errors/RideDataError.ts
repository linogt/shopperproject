export class RideDataError extends Error {
    statusCode: number;
    error_code: string;
    error_description: string;

    constructor() {
        super();
        this.statusCode = 400;
        this.error_code = 'INVALID_DATA';
        this.error_description = 'Os dados fornecidos no corpo da requisição são inválidos';
    }
}
