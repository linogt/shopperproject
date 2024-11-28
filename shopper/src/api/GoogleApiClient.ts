import axios from 'axios';

const apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export class GoogleApiClient {
  public originCoords: { latitude: number; longitude: number } = { latitude: 0, longitude: 0};
  public destinationCoords: { latitude: number; longitude: number } ={latitude: 0, longitude: 0};
  public async computeRoutes(
      origin: string,
      destination: string
  ): Promise<any> {
    console.log(process.env)
      // Função auxiliar para verificar se o input é coordenada ou endereço
      const isCoordinate = (value: string) => /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(value);
      // Determina as coordenadas de origem
      let originCoords: { latitude: number; longitude: number };
      if (isCoordinate(origin)) {
          const [latitude, longitude] = origin.split(',').map(coord => parseFloat(coord));
          originCoords = { latitude, longitude };
          this.originCoords = {latitude: originCoords.latitude,longitude: originCoords.longitude};
      } else {
          const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin)}&key=${process.env.GOOGLE_API_KEY}`;
          try {
              const response = await axios.get(geocodeApiUrl);
              const location = response.data.results[0]?.geometry?.location;

              if (!location) {
                  throw new Error(`Could not fetch coordinates for address: ${origin}`);
              }

              originCoords = { latitude: location.lat, longitude: location.lng };
              this.originCoords = {latitude: originCoords.latitude,longitude: originCoords.longitude};
          } catch (error: any) {
              throw new Error(`Failed to fetch coordinates for origin: ${error.message}`);
          }
      }

      // Determina as coordenadas de destino
      let destinationCoords: { latitude: number; longitude: number };
      if (isCoordinate(destination)) {
          const [latitude, longitude] = destination.split(',').map(coord => parseFloat(coord));
          destinationCoords = { latitude, longitude };
          this.destinationCoords = {latitude: destinationCoords.latitude,longitude: destinationCoords.longitude};
      } else {
          const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${process.env.GOOGLE_API_KEY}`;
          try {
              const response = await axios.get(geocodeApiUrl);
              const location = response.data.results[0]?.geometry?.location;

              if (!location) {
                  throw new Error(`Could not fetch coordinates for address: ${destination}`);
              }

              destinationCoords = { latitude: location.lat, longitude: location.lng };
              this.destinationCoords = {latitude: destinationCoords.latitude,longitude: destinationCoords.longitude};
          } catch (error: any) {
              throw new Error(`Failed to fetch coordinates for destination: ${error.message}`);
          }
      }

      // Corpo da requisição para a API de rotas
      const requestBody = {
          origin: {
              location: {
                  latLng: originCoords,
              },
          },
          destination: {
              location: {
                  latLng: destinationCoords,
              },
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          routeModifiers: {
              avoidTolls: false,
              avoidHighways: false,
              avoidFerries: false,
          },
          languageCode: "en-US",
          units: "IMPERIAL",
      };

      const headers = {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      };

      try {
          const response = await axios.post(apiUrl, requestBody, { headers });
          return response.data;
      } catch (error: any) {
          throw new Error(`Failed to fetch route: ${error.message}`);
      }
  }
}
