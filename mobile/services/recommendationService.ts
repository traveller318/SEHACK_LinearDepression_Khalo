import axios from 'axios';

// Mock stall data for demonstration with updated format
const STALLS_DATA = [
  {
    id: '1',
    name: 'Tian Tian Chicken Rice',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Famous for their Hainanese chicken rice',
    location: 'Maxwell Food Centre',
    cuisine: 'Chinese',
    distance: '0.5 km',
    deliveryTime: '15-20 min',
    rating: 4.5,
    hygieneScore: 'A',
    verified: true,
    tags: ['chicken', 'rice', 'local'],
  },
  {
    id: '2',
    name: 'Sungei Road Laksa',
    image: 'https://images.unsplash.com/photo-1570275239925-4af0aa89617b?q=80&w=2071',
    description: 'Traditional laksa with rich coconut broth',
    location: 'Jalan Berseh Food Centre',
    cuisine: 'Malay',
    distance: '1.2 km',
    deliveryTime: '20-30 min',
    rating: 4.8,
    hygieneScore: 'A',
    verified: true,
    tags: ['laksa', 'spicy', 'seafood', 'noodles'],
  },
  {
    id: '3',
    name: 'Hill Street Fried Kway Teow',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1974',
    description: 'Authentic char kway teow with wok hei',
    location: 'Chinatown Complex',
    cuisine: 'Chinese',
    distance: '0.8 km',
    deliveryTime: '15-25 min',
    rating: 4.2,
    hygieneScore: 'B',
    verified: true,
    tags: ['fried', 'noodles', 'seafood'],
  },
  {
    id: '4',
    name: 'Mr and Mrs Mohgan\'s Super Crispy Roti Prata',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071',
    description: 'Crispy prata with various curry options',
    location: 'Joo Chiat',
    cuisine: 'Indian',
    distance: '3.2 km',
    deliveryTime: '25-35 min',
    rating: 4.7,
    hygieneScore: 'A',
    verified: true,
    tags: ['prata', 'curry', 'breakfast'],
  },
  {
    id: '5',
    name: 'Selera Rasa Nasi Lemak',
    image: 'https://images.unsplash.com/photo-1626409595896-30adce1f769a?q=80&w=2070',
    description: 'Royal family approved nasi lemak',
    location: 'Adam Road Food Centre',
    cuisine: 'Malay',
    distance: '2.5 km',
    deliveryTime: '20-30 min',
    rating: 4.6,
    hygieneScore: 'A',
    verified: true,
    tags: ['rice', 'spicy', 'coconut'],
  },
  {
    id: '6',
    name: 'Haron Satay',
    image: 'https://images.unsplash.com/photo-1529563021893-cc68e7419ca3?q=80&w=2070',
    description: 'Juicy satay with rich peanut sauce',
    location: 'East Coast Lagoon Food Village',
    cuisine: 'Malay',
    distance: '4.7 km',
    deliveryTime: '30-40 min',
    rating: 4.4,
    hygieneScore: 'B',
    verified: true,
    tags: ['satay', 'grilled', 'meat'],
  },
  {
    id: '7',
    name: 'Dragon Phoenix Restaurant',
    image: 'https://images.unsplash.com/photo-1623653407811-f3b1a8149382?q=80&w=2070',
    description: 'Famous for their chili crab',
    location: 'Clarke Quay',
    cuisine: 'Chinese',
    distance: '1.8 km',
    deliveryTime: '25-35 min',
    rating: 4.6,
    hygieneScore: 'A',
    verified: true,
    tags: ['seafood', 'crab', 'spicy'],
  },
  {
    id: '8',
    name: 'Nam Sing Hokkien Fried Mee',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Old school hokkien mee with strong wok hei',
    location: 'Old Airport Road Food Centre',
    cuisine: 'Chinese',
    distance: '3.5 km',
    deliveryTime: '25-35 min',
    rating: 4.3,
    hygieneScore: 'B',
    verified: true,
    tags: ['fried', 'noodles', 'seafood'],
  },
  {
    id: '9',
    name: 'Chomp Chomp Chai Tow Kway',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=2070',
    description: 'Both black and white carrot cake available',
    location: 'Chomp Chomp Food Centre',
    cuisine: 'Chinese',
    distance: '5.2 km',
    deliveryTime: '30-45 min',
    rating: 4.4,
    hygieneScore: 'B',
    verified: false,
    tags: ['fried', 'radish', 'eggs'],
  },
  {
    id: '10',
    name: 'Ocean Curry Fish Head',
    image: 'https://images.unsplash.com/photo-1613844237766-e49adcb45ec7?q=80&w=2077',
    description: 'Rich and flavorful fish head curry',
    location: 'Telok Kurau',
    cuisine: 'Chinese-Indian',
    distance: '4.1 km',
    deliveryTime: '25-40 min',
    rating: 4.5,
    hygieneScore: 'A',
    verified: true,
    tags: ['curry', 'fish', 'spicy'],
  },
];

// Replace with your actual Gemini API key if you have one
// For now, this will use mock data for demonstrations
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

type FoodItem = {
  id: string;
  name: string;
  image: string;
  description: string;
};

type StallItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  cuisine: string;
  distance: string;
  deliveryTime: string;
  rating: number;
  hygieneScore: string;
  verified: boolean;
  tags: string[];
};

// Mock AI recommendation function using the selected foods
export const getAIRecommendations = async (
  selectedFoods: FoodItem[]
): Promise<StallItem[]> => {
  try {
    // For a real implementation, you would use an actual AI API like Gemini
    // This is a mock implementation
    
    // Use the mock data to create recommendations based on food preferences
    // In a real app, this would be replaced with AI API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Here we'll just simulate matching based on food names
        const recommendedStalls = STALLS_DATA.filter((stall) => {
          // Check if any selected food item matches tags in the stall
          return selectedFoods.some((food) => {
            const foodNameLower = food.name.toLowerCase();
            return stall.tags.some((tag) => foodNameLower.includes(tag));
          });
        });

        // If we didn't find any matches, return some popular stalls
        if (recommendedStalls.length === 0) {
          // Return top rated stalls
          const topRatedStalls = [...STALLS_DATA]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
          resolve(topRatedStalls);
        } else {
          // Limit to maximum 5 stalls
          resolve(recommendedStalls.slice(0, 5));
        }
      }, 1500); // Simulate API delay
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Return some default recommendations on error
    return STALLS_DATA.slice(0, 3);
  }
};

// For future implementation: Real Gemini API call
export const getRealAIRecommendations = async (
  selectedFoods: FoodItem[]
): Promise<StallItem[]> => {
  try {
    // Create a prompt for the AI
    const foodNames = selectedFoods.map(food => food.name).join(', ');
    const prompt = `Based on these food preferences: ${foodNames}, recommend me 5 food stalls in Singapore that I might enjoy. For each stall, provide the name, a brief description, location, cuisine type, approximate distance from city center, estimated delivery time, rating out of 5, hygiene grade (A, B, or C), and whether it's verified. Make the response in a structured format.`;

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

    // Parse the AI response and convert to StallItem format
    // This is mockup code - in a real implementation, you would parse the AI response
    const aiRecommendations = STALLS_DATA.slice(0, 5).map(stall => ({
      id: stall.id,
      name: stall.name,
      image: stall.image,
      description: stall.description,
      location: stall.location,
      cuisine: stall.cuisine,
      distance: stall.distance,
      deliveryTime: stall.deliveryTime,
      rating: stall.rating,
      hygieneScore: stall.hygieneScore,
      verified: stall.verified,
      tags: stall.tags
    }));
    
    return aiRecommendations;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return STALLS_DATA.slice(0, 3);
  }
}; 