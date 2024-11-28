export class RideDistanceError extends Error {
    statusCode: number;
    error_code: string;
    error_description: string;

    constructor() {
        super();
        this.statusCode = 406;
        this.error_code = 'INVALID_DISTANCE';
        this.error_description = 'Quilometragem inválida para o motorista';
    }
}
