
import { GoogleGenAI } from "@google/genai";
import { Bus, Schedule, Booking } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFleetAnalysis = async (
  buses: Bus[],
  schedules: Schedule[],
  bookings: Booking[]
): Promise<string> => {
  const prompt = `
    You are an expert University Transport Manager AI for BGC Trust University.
    Analyze the following data and provide 3 key insights/recommendations to improve efficiency (e.g., add more buses to a route, change timing).
    Keep it concise and professional.
    
    Data:
    Buses: ${JSON.stringify(buses.map(b => ({ plateNumber: b.plateNumber, capacity: b.capacity })))}
    Schedules: ${JSON.stringify(schedules)}
    Total Bookings Count: ${bookings.length}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate AI analysis.";
  }
};

/**
 * Searches for real-world locations in Bangladesh using Google Maps Grounding.
 */
export const searchLocation = async (query: string, userCoords?: { lat: number; lng: number }): Promise<{ text: string; links: any[] }> => {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (userCoords) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userCoords.lat,
            longitude: userCoords.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find accurate locations or addresses for "${query}" specifically within Chittagong, Bangladesh for a university bus route. Give me a concise list of 3-5 verified places.`,
      config: config
    });

    const text = response.text || "No locations found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks.filter((c: any) => c.maps).map((c: any) => ({
      title: c.maps.title,
      uri: c.maps.uri
    }));

    return { text, links };
  } catch (error) {
    console.error("Maps Search Error:", error);
    return { text: "Failed to search locations.", links: [] };
  }
};
