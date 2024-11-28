import { FastifyRequest, FastifyReply } from 'fastify';
import { RideEstimativeInput } from '../models/input/RideEstimativeInput';
import { RideEstimativeOutput } from '../models/output/RideEstimativeOutput';


import { RideConfirmInput } from '../models/input/RideConfirmInput';
import { RideService } from '../services/RideService';

export class RideController {
    private rideService: RideService;

    constructor() {
        this.rideService = new RideService();
    }

    public async estimate(request: FastifyRequest<{ Body: RideEstimativeInput }>, reply: FastifyReply): Promise<void> {
        const input: RideEstimativeInput = request.body;

        try {
            const response: RideEstimativeOutput = await this.rideService.getEstimateAndDrivers(input);
            reply.status(200).send(response);
        } catch (error: any) {
            reply.status(error.statusCode).send({
                error_code: error.error_code,
                error_description: error.error_description
            });  
        }
    }

    public async confirm(request: FastifyRequest<{ Body: RideConfirmInput }>, reply: FastifyReply): Promise<void> {
        const input: RideConfirmInput = request.body;

        try { 
            await this.rideService.saveRide(input);
            reply.status(200).send({
                success: true,
            });
        } catch (error: any) { 
            reply.status(error.statusCode).send({
                error_code: error.error_code,
                error_description: error.error_description
            });  
        }
       
    }

    public async history(request: FastifyRequest<{ Params: { customer_id: string }, Querystring: { driver_id: string } }>, reply: FastifyReply): Promise<void> {
        const { customer_id } = request.params;
        const { driver_id } = request.query;
    
        try {
            const ride = await this.rideService.findRideByCustomerAndDriver(customer_id, driver_id);
            reply.status(200).send(ride);
        } catch (error: any) {
            reply.status(error.statusCode).send({
                error_code: error.error_code,
                error_description: error.error_description
            });  
        }
    }
    
}
