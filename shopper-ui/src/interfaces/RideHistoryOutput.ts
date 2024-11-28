export interface RideHistoryOutput {
    customer_id: string;
    rides: Array<{
      id: number;
      date: Date;
      origin: string;
      destination: string;
      distance: number;
      duration: string;
      driver: {
        id: number;
        name: string;
      };
      value: number;
    }>;
}