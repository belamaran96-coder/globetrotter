import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { TravelFormData, TravelPlan, GroundingData, MapPlace } from "../types";

// Securely access API key from environment variables.
// We check API_KEY (platform default) and GEMINI_API_KEY (user preference).
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

// Initialize client. 
// Note: We will create new instances in functions if we need specific configs.

const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripOverview: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        bestTime: { type: Type.STRING },
        weatherExpectation: { type: Type.STRING },
      },
      required: ['summary', 'bestTime', 'weatherExpectation'],
    },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          morning: { type: Type.STRING },
          afternoon: { type: Type.STRING },
          evening: { type: Type.STRING },
        },
        required: ['day', 'title', 'morning', 'afternoon', 'evening'],
      },
    },
    flightPrediction: {
      type: Type.OBJECT,
      properties: {
        cheapestMonths: { type: Type.STRING },
        priceRange: { type: Type.STRING },
        tips: { type: Type.STRING },
      },
      required: ['cheapestMonths', 'priceRange', 'tips'],
    },
    hotels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Budget', 'Mid-range', 'Luxury'] },
          description: { type: Type.STRING },
          estimatedPrice: { type: Type.STRING },
          bookingOptions: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 platform: { type: Type.STRING },
                 price: { type: Type.STRING },
               },
               required: ['platform', 'price']
             }
          }
        },
        required: ['name', 'type', 'description', 'estimatedPrice', 'bookingOptions'],
      },
    },
    food: {
      type: Type.OBJECT,
      properties: {
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        dietaryNotes: { type: Type.STRING },
      },
      required: ['recommendations', 'dietaryNotes'],
    },
    packingList: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    budgetEstimate: {
      type: Type.OBJECT,
      properties: {
        accommodation: { type: Type.STRING },
        food: { type: Type.STRING },
        transport: { type: Type.STRING },
        activities: { type: Type.STRING },
        total: { type: Type.STRING },
      },
      required: ['accommodation', 'food', 'transport', 'activities', 'total'],
    },
    safetyTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    visaInfo: { type: Type.STRING },
  },
  required: ['tripOverview', 'itinerary', 'flightPrediction', 'hotels', 'food', 'packingList', 'budgetEstimate', 'safetyTips', 'visaInfo'],
};

export const generateTravelPlan = async (data: TravelFormData): Promise<TravelPlan> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are Gemini Travel Ultra Pro. Create a detailed travel plan.
    
    Details:
    Start: ${data.startLocation}
    Destination: ${data.destination}
    Duration: ${data.days} days
    Budget: ${data.budget}
    Style: ${data.style}
    Preferences: ${data.preferences}
    Season: ${data.season}
    Special Requests: ${data.specialRequests}

    Provide a JSON response matching the schema. Be realistic with prices and times.
    
    IMPORTANT: For the 'hotels' section, you MUST populate the 'bookingOptions' field with 2-3 comparisons from major booking platforms (e.g., Booking.com, Expedia, Hotels.com) including estimated prices per night for that specific hotel.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Switched to Flash for higher rate limits and speed
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TravelPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const getGroundingData = async (destination: string): Promise<GroundingData> => {
  const ai = new GoogleGenAI({ apiKey });
  
  // We ask for structured text output to parse coordinates manually, while also using the tool for grounding verification.
  const prompt = `
    Find top 5 tourist attractions in ${destination}. 
    
    OUTPUT FORMAT REQUIRMENT:
    For each attraction, output a line in this exact format:
    "PLACE: [Name] | [Latitude] | [Longitude] | [Short Description]"
    
    Example:
    PLACE: Eiffel Tower | 48.8584 | 2.2945 | A wrought-iron lattice tower on the Champ de Mars.

    After listing the places, provide a short paragraph about the current Visa policy for tourists visiting ${destination}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using Flash for tools/grounding
      contents: prompt,
      config: {
        tools: [
          { googleMaps: {} }, 
        ], 
      },
    });

    const text = response.text || "";
    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Parse the text for coordinates
    const places: MapPlace[] = [];
    const lines = text.split('\n');
    const placeRegex = /PLACE:\s*(.+?)\s*\|\s*([-+]?[0-9]*\.?[0-9]+)\s*\|\s*([-+]?[0-9]*\.?[0-9]+)\s*\|\s*(.+)/;

    for (const line of lines) {
        const match = line.match(placeRegex);
        if (match) {
            const [_, name, latStr, lngStr, desc] = match;
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            
            // Try to find a matching grounding chunk to get the real Google Maps URI
            const matchedChunk = groundingChunks.find(c => 
                c.maps?.title && name.toLowerCase().includes(c.maps.title.toLowerCase())
            );

            places.push({
                title: name.trim(),
                uri: matchedChunk?.maps?.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + destination)}`,
                lat: !isNaN(lat) ? lat : undefined,
                lng: !isNaN(lng) ? lng : undefined,
                description: desc.trim()
            });
        }
    }

    // Fallback: If parsing failed but we have grounding chunks, use them without coords
    if (places.length === 0 && groundingChunks.length > 0) {
        groundingChunks.filter(c => c.maps?.uri).forEach(c => {
            places.push({
                title: c.maps?.title || "Unknown Place",
                uri: c.maps?.uri || "#",
                description: "Location found via Google Maps"
            });
        });
    }

    // Clean up text to remove the raw lines if we want, but for now we just extract the visa part if possible
    // or just return the whole text as searchTips if it's informative.
    // A simple heuristic: Filter out the "PLACE:" lines from the search tips displayed.
    const searchTips = lines
        .filter(l => !l.trim().startsWith("PLACE:"))
        .join('\n')
        .trim();

    return { places, searchTips: [searchTips] };
  } catch (error) {
    console.warn("Grounding failed:", error);
    return { places: [], searchTips: [] };
  }
};

export const generateDestinationImage = async (destination: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `A cinematic, high-quality travel poster for ${destination}, scenic view, vibrant colors, photorealistic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: '16:9',
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image gen failed:", error);
    return null;
  }
};