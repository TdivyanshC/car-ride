import { Location } from './rides';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  name: string;
  lat: number;
  lng: number;
}


export const placesApi = {
  async getAutocompleteSuggestions(input: string): Promise<PlaceSuggestion[]> {
    if (!input.trim() || !GOOGLE_MAPS_API_KEY) {
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`;

      console.log('Google Maps API URL:', url);

      const response = await fetch(url);
      console.log('Google Maps API response status:', response.status);

      const data = await response.json();
      console.log('Google Maps API response:', data);

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((item: any) => ({
          place_id: item.place_id,
          description: item.description,
          structured_formatting: item.structured_formatting,
        }));
      } else {
        console.warn('Google Maps API error:', data.error_message || 'Unknown error', 'Status:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching places suggestions:', error);
      return [];
    }
  },

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=name,geometry`;

      console.log('Google Maps Place Details URL:', url);

      const response = await fetch(url);
      console.log('Google Maps Place Details response status:', response.status);

      const data = await response.json();
      console.log('Google Maps Place Details response:', data);

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        return {
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        };
      } else {
        console.warn('Place details API error:', data.error_message || 'Unknown error', 'Status:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  },

  // Convert PlaceDetails to Location format used in the app
  convertToLocation(placeDetails: PlaceDetails): Location {
    return {
      name: placeDetails.name,
      lat: placeDetails.lat,
      lng: placeDetails.lng,
    };
  },
};