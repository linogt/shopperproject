export interface RideConfirmInput {
    customer_id: string;
    origin: string;
    destination: string;
    distance: number;
    duration: string;
    driver: DriverInfo;
    value: number;
}

interface DriverInfo {
    id: number;
    name: string;
}
