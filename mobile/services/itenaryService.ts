import axios from 'axios';

// Mock itinerary data for demonstration purposes
const MOCK_ITINERARIES = [
    {
        id: '1',
        title: 'Morning Food Tour in Chinatown',
        description: 'Start your day with local delicacies in Chinatown.',
        places: [
            {
                name: 'Tian Tian Chicken Rice',
                address: 'Maxwell Food Centre',
                image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
                rating: 4.5,
            },
            {
                name: 'Hill Street Fried Kway Teow',
                address: 'Chinatown Complex',
                image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1974',
                rating: 4.2,
            },
        ],
    },
    {
        id: '2',
        title: 'Cultural Walk in Little India',
        description: 'Explore vibrant streets and enjoy authentic Indian cuisine.',
        places: [
            {
                name: 'Mr and Mrs Mohgan\'s Super Crispy Roti Prata',
                address: 'Joo Chiat',
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071',
                rating: 4.7,
            },
            {
                name: 'Sri Veeramakaliamman Temple',
                address: '141 Serangoon Rd',
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=2070',
                rating: 4.6,
            },
        ],
    },
];

// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyAnckvGLv58t7RZdcadX1lZQS9G3FPmkt8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

type Place = {
    name: string;
    address: string;
    image: string;
    rating: number;
};

type Itinerary = {
    id: string;
    title: string;
    description: string;
    places: Place[];
};

// Mock AI-powered itinerary generation function
export const generateItineraries = async (
    latitude: number,
    longitude: number,
    preferences: string[],
    numItineraries: number = 5
): Promise<Itinerary[]> => {
    try {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filteredItineraries = MOCK_ITINERARIES.filter((itinerary) => {
                    return preferences.some((preference) =>
                        itinerary.description.toLowerCase().includes(preference.toLowerCase())
                    );
                });

                if (filteredItineraries.length === 0) {
                    resolve(MOCK_ITINERARIES.slice(0, numItineraries));
                } else {
                    resolve(filteredItineraries.slice(0, numItineraries));
                }
            }, 1500);
        });
    } catch (error) {
        console.error('Error generating itineraries:', error);
        return MOCK_ITINERARIES.slice(0, 3);
    }
};

// Real Gemini API call with updated food itinerary prompt
export const generateRealItineraries = async (
    latitude: number,
    longitude: number,
    preferences: string[],
    numItineraries: number = 5
): Promise<Itinerary[]> => {
    try {
        const preferencesString = preferences.join(', ');

        const prompt = `
Based on the user's preferences for a food-focused travel experience, please generate ${numItineraries} highly personalized and well-structured travel itineraries near the coordinates latitude: ${latitude} and longitude: ${longitude}. Each itinerary should be centered around culinary exploration and should include the following details:

- A compelling title that captures the theme or mood of the itinerary.
- A concise but vivid description that explains what the traveler will experience, highlighting the uniqueness and cultural relevance of the food journey.
- A list of specific food places (minimum 2-4 per itinerary), each with:
  - Name of the place
  - Address
  - A realistic image URL
  - A rating out of 5, based on popularity or customer reviews

Ensure the itineraries are diverse in terms of cuisine type, locality, ambiance (e.g., street food, fine dining, local markets), and cultural significance. Incorporate a mix of hidden gems, must-visit local eateries, and iconic food spots.

Tailor each itinerary to reflect the preferences provided: ${preferencesString}. Keep the tone engaging and informative, suitable for a travel app aiming to delight food enthusiasts.

Return the output in a structured JSON format, making sure each itinerary follows this schema:

{
  "id": "unique string identifier",
  "title": "Itinerary title",
  "description": "Short paragraph describing the food experience",
  "places": [
    {
      "name": "Place name",
      "address": "Full address",
      "image": "Valid image URL",
      "rating": 4.5
    },
    ...
  ]
}
        `;

        const response = await axios.post(
            GEMINI_API_URL,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY,
                },
            }
        );

        // Placeholder: Replace with actual parsing of response
        const aiItineraries = MOCK_ITINERARIES.slice(0, numItineraries).map(itinerary => ({
            id: itinerary.id,
            title: itinerary.title,
            description: itinerary.description,
            places: itinerary.places.map(place => ({
                name: place.name,
                address: place.address,
                image: place.image,
                rating: place.rating,
            })),
        }));

        return aiItineraries;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return MOCK_ITINERARIES.slice(0, 3);
    }
};
