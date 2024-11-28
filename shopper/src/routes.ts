import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

import { RideEstimativeInput } from './models/input/RideEstimativeInput';
import { RideConfirmInput } from './models/input/RideConfirmInput';
import { RideController } from './controllers/RideController';

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    fastify.post("/ride/estimate", async (request: FastifyRequest<{ Body: RideEstimativeInput }>, reply: FastifyReply) => {
        return new RideController().estimate(request, reply);
    });

    fastify.patch("/ride/confirm", async (request: FastifyRequest<{ Body: RideConfirmInput }>, reply: FastifyReply) => {
        return new RideController().confirm(request, reply);
    });

    fastify.get("/ride/:customer_id", async (request: FastifyRequest<{ Params: { customer_id: string }, Querystring: { driver_id: string } }>, reply: FastifyReply) => {
        return new RideController().history(request, reply);
    });
    
}
