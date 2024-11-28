import { GoogleApiClient } from '../api/GoogleApiClient';
import { PrismaClient } from '@prisma/client';
import { RideEstimativeOutput } from '../models/output/RideEstimativeOutput';
import { RideEstimativeInput } from '../models/input/RideEstimativeInput';
import { RideDataError } from '../errors/RideDataError';
import { RideConfirmInput } from '../models/input/RideConfirmInput';
import { RideDriverError } from '../errors/RideDriverError';
import { RideDistanceError } from '../errors/RideDistanceError';
import { RideDriverInvalidError } from '../errors/RideDriverInvalidError';
import { RideNotFoundError } from '../errors/RideNotFoundError';

const prisma = new PrismaClient();

export class RideService {
    private apiClient: GoogleApiClient;

    constructor() {
        this.apiClient = new GoogleApiClient();
    }

    public validateData(input: RideEstimativeInput): void { 
        const { customer_id, origin, destination } = input; 
        if (!customer_id || !origin || !destination || origin === destination) { 
            throw new RideDataError(); 
        } 
    }

    public async getEstimateAndDrivers(input: RideEstimativeInput): Promise<RideEstimativeOutput> {
        this.validateData(input);
        console.log(input);
       
        const routeResponse = await this.apiClient.computeRoutes(input.origin, input.destination);
        console.log(routeResponse);
        const { distanceMeters, duration, polyline } = routeResponse.routes[0];

        const drivers = await prisma.driver.findMany();
        const options = drivers.map(driver => {
            const distanceKm = distanceMeters / 1000;
            const value = driver.feePerKm * distanceKm;

            return {
                id: driver.driver_id,
                name: driver.name,
                description: driver.description,
                vehicle: driver.car,
                review: {
                    rating: driver.rating,
                    comment: driver.comment
                },
                value
            };
        }).sort((a, b) => a.value - b.value);
        console.log(routeResponse);
        return {
            origin: this.apiClient.originCoords,
            destination: this.apiClient.destinationCoords,
            distance: distanceMeters,
            duration: duration,
            options: options,
            routeResponse: {
                distanceMeters,
                duration,
                polyline
            }
        };
    }

    public async saveRide(input: RideConfirmInput): Promise<any> { 
        console.log(input);
        this.validateData(input);
       
        try {
            const { customer_id, origin, destination, distance, duration, driver, value } = input; 

            const driverRecord = await prisma.driver.findFirst({
                where: { driver_id: driver.id }, 
            });
    
            if (!driverRecord) {
                throw new RideDriverError();
            }
            console.log(driverRecord.minFee);
            console.log(distance);
            if (distance < driverRecord.minFee) { 
                throw new RideDistanceError(); 
            }
            
            const ride = await prisma.ride.create({ 
                data: { 
                    customer_id, 
                    origin,
                    destination, 
                    distance, 
                    duration,
                    driver_id: driver.id, 
                    driver_name: driver.name, 
                    value,
                    created_at: new Date()
                } 
            }); 
            return ride;
        } catch (error) {
            console.error("Erro não esperado", error);
            throw error;
        }
    }

    public async findRideByCustomerAndDriver(customer_id: string, driver_id?: string): Promise<RideHistoryOutput> {
        if (!customer_id) { 
            throw new RideDataError(); 
        }
    
        if (driver_id) {
            if (isNaN(Number(driver_id))) {
                throw new RideDriverInvalidError();
            }
            
            const driverRecord = await prisma.driver.findFirst({
                where: { driver_id: parseFloat(driver_id) }, 
            });
    
            if (!driverRecord) {
                throw new RideDriverInvalidError();
            }
        }
    
        const rides = await prisma.ride.findMany({
            where: {
                customer_id: customer_id,
                ...(driver_id ? { driver_id: parseFloat(driver_id) } : {}) 
            }
        });

        if (rides.length === 0) {
            throw new RideNotFoundError();
        }
    
        const formattedRides = rides.map(ride => ({
            id: parseInt(ride.id), 
            date: new Date(ride.created_at),
            origin: ride.origin,
            destination: ride.destination,
            distance: ride.distance,
            duration: ride.duration,
            driver: {
                id: ride.driver_id,
                name: ride.driver_name
            },
            value: ride.value
        }));
    
        return {
            customer_id,
            rides: formattedRides
        };
    }
    
    
    
    
}
