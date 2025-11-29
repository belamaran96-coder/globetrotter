export interface TravelFormData {
  startLocation: string;
  destination: string;
  days: number;
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  style: string;
  preferences: string;
  season: string;
  specialRequests: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface BookingOption {
  platform: string;
  price: string;
}

export interface HotelRecommendation {
  name: string;
  type: 'Budget' | 'Mid-range' | 'Luxury';
  description: string;
  estimatedPrice: string;
  bookingOptions?: BookingOption[];
}

export interface TravelPlan {
  tripOverview: {
    summary: string;
    bestTime: string;
    weatherExpectation: string;
  };
  itinerary: ItineraryDay[];
  flightPrediction: {
    cheapestMonths: string;
    priceRange: string;
    tips: string;
  };
  hotels: HotelRecommendation[];
  food: {
    recommendations: string[];
    dietaryNotes: string;
  };
  packingList: string[];
  budgetEstimate: {
    accommodation: string;
    food: string;
    transport: string;
    activities: string;
    total: string;
  };
  safetyTips: string[];
  visaInfo: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  lat?: number;
  lng?: number;
  description?: string;
}

export interface GroundingData {
  places: MapPlace[];
  searchTips: string[];
}