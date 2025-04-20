import axios from 'axios';

// Mock itinerary data for demonstration purposes
const MOCK_ITINERARIES = [
    {
        id: '1',
        title: 'Global Street Food Fiesta',
        description: 'A taste of the world, all in one tour.',
        places: [
            {
                name: 'Ramen Street',
                address: 'Tokyo Alley, Japan Town',
                image: require("../assets/images/ramen.png")    ,
                rating: 4.6,
            },
            {
                name: 'Authentic Shawarma House',
                address: 'Middle Eastern Lane',
                image: require("../assets/images/shawarma.png"),
                rating: 4.4,
            },
            {
                name: 'Little Italy Pasta Stop',
                address: 'Pasta Plaza, Downtown',
                image: require("../assets/images/pasta.png"),
                rating: 4.7,
            },
        ],
    },
    {
        id: '2',
        title: 'Sweet Tooth Trail',
        description: 'Perfect for dessert lovers and cafe hoppers.',
        places: [
            {
                name: 'Baker’s Delight',
                address: 'Sugar Street, Central',
                image: require("../assets/images/bakery.png"),
                rating: 4.5,
            },
            {
                name: 'Ice Cream Carnival',
                address: 'Frozen Lane, Sweet District',
                image: require("../assets/images/icecream.png"),
                rating: 4.8,
            },
            {
                name: 'Pani Puri Paradise',
                address: 'Spice Market Corner',
                image: require("../assets/images/pani.png"),
                rating: 4.3,
            },
        ],
    },
    {
        id: '3',
        title: 'On-the-Go Bites',
        description: 'Quick eats from food trucks and stalls.',
        places: [
            {
                name: 'Gourmet Food Truck',
                address: 'Nomad Park',
                image: require("../assets/images/foodtruck.png"),
                rating: 4.4,
            },
            {
                name: 'Sushi Stop',
                address: 'Ocean Street Bites',
                image: require("../assets/images/sushi.png"),
                rating: 4.6,
            },
            {
                name: 'Thali Time',
                address: 'Curry Circle',
                image: require("../assets/images/thali.png"),
                rating: 4.5,
            },
        ],
    },
    {
        id: '4',
        title: 'Caffeine & Chill',
        description: 'Relax with brews and bites.',
        places: [
            {
                name: 'Brewer’s Café',
                address: 'Bean Boulevard',
                image: require("../assets/images/coffee.png"),
                rating: 4.7,
            },
            {
                name: 'Pastry & Brew',
                address: 'Mocha Lane',
                image: require("../assets/images/coffee.png"),
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
