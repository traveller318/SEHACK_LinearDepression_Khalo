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

// Replace with your actual Gemini API key if you have one
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
        // For a real implementation, you would use an actual AI API like Gemini
        // This is a mock implementation

        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate processing based on user preferences
                const filteredItineraries = MOCK_ITINERARIES.filter((itinerary) => {
                    return preferences.some((preference) =>
                        itinerary.description.toLowerCase().includes(preference.toLowerCase())
                    );
                });

                // If no matching itineraries are found, return some default ones
                if (filteredItineraries.length === 0) {
                    resolve(MOCK_ITINERARIES.slice(0, numItineraries));
                } else {
                    // Limit to the requested number of itineraries
                    resolve(filteredItineraries.slice(0, numItineraries));
                }
            }, 1500); // Simulate API delay
        });
    } catch (error) {
        console.error('Error generating itineraries:', error);
        // Return some default itineraries on error
        return MOCK_ITINERARIES.slice(0, 3);
    }
};

// For future implementation: Real Gemini API call
export const generateRealItineraries = async (
    latitude: number,
    longitude: number,
    preferences: string[],
    numItineraries: number = 5
): Promise<Itinerary[]> => {
    try {
        // Create a prompt for the AI
        const preferencesString = preferences.join(', ');
        const prompt = `Based on these preferences: ${preferencesString}, recommend ${numItineraries} personalized travel itineraries near latitude ${latitude} and longitude ${longitude}. Each itinerary should include a title, a brief description, and a list of places to visit. For each place, provide the name, address, image URL, and rating out of 5. Make the response in a structured format.`;

        // Make the API call to Gemini
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

        // Parse the AI response and convert to Itinerary format
        // This is mockup code - in a real implementation, you would parse the AI response
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