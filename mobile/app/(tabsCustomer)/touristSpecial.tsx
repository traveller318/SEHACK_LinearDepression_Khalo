import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Callout } from 'react-native-maps';
import { generateItineraries } from '../../services/itenaryService'; // Import the helper function

type TourExperience = {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  location: string;
};

type Itinerary = {
  id: string;
  title: string;
  description: string;
  places: {
    name: string;
    address: string;
    image: string;
    rating: number;
  }[];
};

type FoodTrail = {
  id: string;
  name: string;
  description: string;
  color: string;
  stops: FoodStop[];
};

type FoodStop = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  hygiene: number;
  latitude: number;
  longitude: number;
};

export default function TouristSpecialScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  
  // Personal itinerary states
  const [timeAvailable, setTimeAvailable] = useState<'1 hr' | '2 hrs' | '4 hrs'>('1 hr');
  const [foodPreference, setFoodPreference] = useState<'Veg' | 'Spicy' | 'Sweet'>('Veg');
  const [personalItinerary, setPersonalItinerary] = useState<any[]>([]);
  const [personalItineraryLoading, setPersonalItineraryLoading] = useState(false);
  const [totalCost, setTotalCost] = useState('₹0');
  const [totalTime, setTotalTime] = useState('0 mins');
  const [showPersonalItinerary, setShowPersonalItinerary] = useState(false);
  const personalMapRef = useRef<MapView>(null);

  // Food trails data - Mumbai specific locations
  const foodTrails: FoodTrail[] = [
    {
      id: 'vada-pav',
      name: 'Vada Pav Trail',
      description: 'Experience the iconic Mumbai street food at these legendary spots',
      color: '#FF5200',
      stops: [
        {
          id: 'vp1',
          name: 'Ashok Vada Pav',
          description: 'The original vada pav spot since 1971',
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3',
          price: '₹15-20',
          hygiene: 4,
          latitude: 19.0176,
          longitude: 72.8561,
        },
        {
          id: 'vp2',
          name: 'Anand Vada Pav',
          description: 'Known for extra spicy garlic chutney',
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3',
          price: '₹20-25',
          hygiene: 4.5,
          latitude: 19.0223,
          longitude: 72.8433,
        },
        {
          id: 'vp3',
          name: 'Shivaji Vada Pav',
          description: 'Celebrity favorite with secret recipe',
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3',
          price: '₹25-30',
          hygiene: 4,
          latitude: 19.0348,
          longitude: 72.8425,
        },
      ],
    },
    {
      id: 'chaat-trail',
      name: 'Chaat Trail',
      description: 'Savor the tangy and spicy chaats of Mumbai',
      color: '#4CAF50',
      stops: [
        {
          id: 'ch1',
          name: 'Juhu Beach Chaat',
          description: 'Beachside pani puri and bhel',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3',
          price: '₹50-80',
          hygiene: 3.5,
          latitude: 19.0883,
          longitude: 72.8260,
        },
        {
          id: 'ch2',
          name: 'Elco Market',
          description: 'Premium chaat since 1975',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3',
          price: '₹100-150',
          hygiene: 4.5,
          latitude: 19.0699,
          longitude: 72.8278,
        },
        {
          id: 'ch3',
          name: 'Bandra Chaat Corner',
          description: 'Fusion chaat with modern twist',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3',
          price: '₹80-120',
          hygiene: 4,
          latitude: 19.0596,
          longitude: 72.8295,
        },
      ],
    },
    {
      id: 'south-bombay',
      name: 'South Bombay Snacks',
      description: 'Historic eateries with legacy recipes',
      color: '#2196F3',
      stops: [
        {
          id: 'sb1',
          name: 'Kyani & Co.',
          description: 'Mumbai\'s oldest Irani cafe (1904)',
          image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3',
          price: '₹60-100',
          hygiene: 4,
          latitude: 18.9432,
          longitude: 72.8340,
        },
        {
          id: 'sb2',
          name: 'Cannon Pav Bhaji',
          description: 'Legendary pav bhaji near CST',
          image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3',
          price: '₹120-150',
          hygiene: 3.5,
          latitude: 18.9398,
          longitude: 72.8354,
        },
        {
          id: 'sb3',
          name: 'Bademiya',
          description: 'Late night kebabs since 1946',
          image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3',
          price: '₹200-500',
          hygiene: 4,
          latitude: 18.9263,
          longitude: 72.8278,
        },
      ],
    },
  ];

  // Fetch user's location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };
    fetchLocation();
  }, []);

  // Generate itineraries using the helper function
  useEffect(() => {
    if (!location) return;

    const generatePersonalizedItineraries = async () => {
      setLoading(true);
      try {
        // Call the helper function to generate itineraries
        const generatedItineraries = await generateItineraries(
          location.latitude,
          location.longitude,
          ['food', 'local culture', 'tourist attractions'],
          5 // Number of itineraries to generate
        );

        // Update state with the generated itineraries
        setItineraries(generatedItineraries);
      } catch (error) {
        console.error('Error generating itineraries:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePersonalizedItineraries();
  }, [location]);

  // Function to show a specific trail on the map
  const showTrail = (trailId: string) => {
    setSelectedTrail(trailId);
    
    const trail = foodTrails.find(t => t.id === trailId);
    if (trail && mapRef.current) {
      // Fit map to show all markers in the trail
      const coordinates = trail.stops.map(stop => ({
        latitude: stop.latitude,
        longitude: stop.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  // Get the selected trail data
  const getSelectedTrailData = () => {
    if (!selectedTrail) return foodTrails[0]; // Default to first trail
    return foodTrails.find(trail => trail.id === selectedTrail) || foodTrails[0];
  };

  // Render a marker for a food stop
  const renderMarker = (stop: FoodStop) => (
    <Marker
      key={stop.id}
      coordinate={{
        latitude: stop.latitude,
        longitude: stop.longitude,
      }}
      title={stop.name}
      description={stop.description}
    >
      <View style={styles.customMarker}>
        <FontAwesome5 name="utensils" size={14} color="#fff" />
      </View>
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Image source={{ uri: stop.image }} style={styles.calloutImage} />
          <Text style={styles.calloutTitle}>{stop.name}</Text>
          <Text style={styles.calloutDescription}>{stop.description}</Text>
          <View style={styles.calloutInfo}>
            <Text style={styles.calloutPrice}>{stop.price}</Text>
            <View style={styles.calloutRating}>
              {Array(5).fill(0).map((_, i) => (
                <MaterialIcons 
                  key={i}
                  name={i < Math.floor(stop.hygiene) ? "star" : i < stop.hygiene ? "star-half" : "star-border"} 
                  size={12} 
                  color="#FFD700" 
                />
              ))}
            </View>
          </View>
        </View>
      </Callout>
    </Marker>
  );

  const renderItineraryCard = ({ item }: { item: Itinerary }) => (
    <View style={styles.itineraryCard}>
      <Text style={styles.itineraryTitle}>{item.title}</Text>
      <Text style={styles.itineraryDescription}>{item.description}</Text>
      <FlatList
        data={item.places}
        renderItem={({ item: place }) => (
          <View style={styles.placeItem}>
            <Image source={{ uri: place.image }} style={styles.placeImage} />
            <View style={styles.placeDetails}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
              <View style={styles.placeRating}>
                <MaterialIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.placeRatingText}>{place.rating}</Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(place) => place.name}
        contentContainerStyle={styles.placesList}
      />
    </View>
  );

  // Convert time to minutes
  const timeToMinutes = (time: string): number => {
    if (time === '1 hr') return 60;
    if (time === '2 hrs') return 120;
    if (time === '4 hrs') return 240;
    return 60;
  };

  // Filter food spots based on preference
  const filterByPreference = (spots: FoodStop[]): FoodStop[] => {
    if (foodPreference === 'Veg') {
      return spots.filter(spot => spot.name.toLowerCase().includes('veg') || spot.description.toLowerCase().includes('veg'));
    } else if (foodPreference === 'Spicy') {
      return spots.filter(spot => spot.name.toLowerCase().includes('spicy') || spot.description.toLowerCase().includes('spicy'));
    } else if (foodPreference === 'Sweet') {
      return spots.filter(spot => spot.name.toLowerCase().includes('sweet') || spot.description.toLowerCase().includes('sweet'));
    }
    return spots;
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Calculate walking time between locations in minutes (assuming 5km/h walking speed)
  const calculateWalkingTime = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return Math.round((distance / 5) * 60); // Convert to minutes at 5km/h
  };

  // Generate personalized itinerary
  const generatePersonalItinerary = () => {
    if (!location) return;

    setPersonalItineraryLoading(true);
    
    // Define 3 specific preset paths (using existing food trail data)
    const presetPaths = [
      // Path 1: Vada Pav Trail
      foodTrails[0].stops,
      
      // Path 2: Chaat Trail
      foodTrails[1].stops,
      
      // Path 3: Custom Mixed Trail (taking first stop from each trail)
      [foodTrails[0].stops[0], foodTrails[1].stops[0], foodTrails[2].stops[0]]
    ];
    
    // Select one of the preset paths randomly
    const selectedPathIndex = Math.floor(Math.random() * presetPaths.length);
    const selectedPath = presetPaths[selectedPathIndex];
    
    // Filter by preference if needed (or just take the preset path)
    // For demo purposes, we'll just add the preset path with additional info
    const itinerary = selectedPath.map(stop => {
      // Generate random walking time (5-20 minutes)
      const walkingTime = Math.floor(Math.random() * 16) + 5;
      
      // Generate random time to spend at stop (15-30 minutes)
      const timeAtStop = Math.floor(Math.random() * 16) + 15;
      
      // Generate random distance (0.5-3.0 km)
      const distance = (Math.random() * 2.5 + 0.5).toFixed(1);
      
      return {
        ...stop,
        walkingTime,
        timeAtStop,
        distance
      };
    });
    
    // Calculate random total cost (₹150-₹600)
    const randomTotalCost = Math.floor(Math.random() * 451) + 150;
    setTotalCost(`₹${randomTotalCost}`);
    
    // Calculate random total time based on time available selection
    const minutesMap = { '1 hr': 60, '2 hrs': 120, '4 hrs': 240 };
    const availableMinutes = minutesMap[timeAvailable];
    const randomTotalMinutes = Math.floor(Math.random() * (availableMinutes * 0.4)) + Math.floor(availableMinutes * 0.6);
    setTotalTime(`${randomTotalMinutes} mins`);
    
    // Update state
    setPersonalItinerary(itinerary);
    setPersonalItineraryLoading(false);
    setShowPersonalItinerary(true);
    
    // Fit map to show all markers
    setTimeout(() => {
      if (personalMapRef.current && itinerary.length > 0) {
        const coordinates = [
          { latitude: location.latitude, longitude: location.longitude },
          ...itinerary.map(stop => ({
            latitude: stop.latitude,
            longitude: stop.longitude,
          }))
        ];
        
        personalMapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }, 500);
  };

  // Shuffle itinerary
  const shuffleItinerary = () => {
    generatePersonalItinerary();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5200" />
        <Text style={styles.loadingText}>Generating your itineraries...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tourist Special</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Featured Banner */}
        <TouchableOpacity style={styles.featuredBanner}>
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerTitle}>Exclusive Food Tours</Text>
            <Text style={styles.bannerSubtitle}>Discover local favorites with our expert guides</Text>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Explore Now</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
          <Image
            source={{ uri: 'https://via.placeholder.com/800x400/FF5200/ffffff?text=Featured+Tour' }}
            style={styles.bannerImage}
          />
        </TouchableOpacity>

        {/* Food Trail Map Section */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>🗺️ Interactive Food Trails</Text>
          
          {/* Trail Selection Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trailTabs}
          >
            {foodTrails.map(trail => (
              <TouchableOpacity 
                key={trail.id}
                style={[
                  styles.trailTab, 
                  (selectedTrail === trail.id || (!selectedTrail && trail.id === foodTrails[0].id)) && 
                  {backgroundColor: trail.color, borderColor: trail.color}
                ]}
                onPress={() => showTrail(trail.id)}
              >
                <Text 
                  style={[
                    styles.trailTabText, 
                    (selectedTrail === trail.id || (!selectedTrail && trail.id === foodTrails[0].id)) && 
                    {color: '#fff'}
                  ]}
                >
                  {trail.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 19.0176,
                longitude: 72.8561,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              {/* Trail Polyline */}
              <Polyline
                coordinates={getSelectedTrailData().stops.map(stop => ({
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }))}
                strokeColor={getSelectedTrailData().color}
                strokeWidth={4}
                lineDashPattern={[0]}
              />
              
              {/* Food Stop Markers */}
              {getSelectedTrailData().stops.map(stop => renderMarker(stop))}
            </MapView>
            
            {/* Trail Description */}
            <View style={styles.trailDescription}>
              <Text style={styles.trailDescriptionText}>
                {getSelectedTrailData().description}
              </Text>
            </View>
          </View>
          
          {/* Food Stops List */}
          
        </View>

        

        {/* Personalized Itinerary Generator */}
        <View style={styles.personalItinerarySection}>
          <Text style={styles.sectionTitle}>🍽️ Your Personalized Food Itinerary</Text>
          
          {/* Input Form */}
          <View style={styles.itineraryForm}>
            {/* Time Available */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>⏱️ Time Available</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.optionButton, timeAvailable === '1 hr' && styles.optionButtonActive]}
                  onPress={() => setTimeAvailable('1 hr')}
                >
                  <Text style={[styles.optionText, timeAvailable === '1 hr' && styles.optionTextActive]}>1 hr</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.optionButton, timeAvailable === '2 hrs' && styles.optionButtonActive]}
                  onPress={() => setTimeAvailable('2 hrs')}
                >
                  <Text style={[styles.optionText, timeAvailable === '2 hrs' && styles.optionTextActive]}>2 hrs</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.optionButton, timeAvailable === '4 hrs' && styles.optionButtonActive]}
                  onPress={() => setTimeAvailable('4 hrs')}
                >
                  <Text style={[styles.optionText, timeAvailable === '4 hrs' && styles.optionTextActive]}>4 hrs</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Food Preference */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>🍽️ Food Preference</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.optionButton, foodPreference === 'Veg' && styles.optionButtonActive]}
                  onPress={() => setFoodPreference('Veg')}
                >
                  <Text style={[styles.optionText, foodPreference === 'Veg' && styles.optionTextActive]}>Veg</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.optionButton, foodPreference === 'Spicy' && styles.optionButtonActive]}
                  onPress={() => setFoodPreference('Spicy')}
                >
                  <Text style={[styles.optionText, foodPreference === 'Spicy' && styles.optionTextActive]}>Spicy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.optionButton, foodPreference === 'Sweet' && styles.optionButtonActive]}
                  onPress={() => setFoodPreference('Sweet')}
                >
                  <Text style={[styles.optionText, foodPreference === 'Sweet' && styles.optionTextActive]}>Sweet</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Current Location */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📍 Current Location</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={18} color="#FF5200" />
                <Text style={styles.locationText}>
                  {location ? 'Location detected' : 'Detecting location...'}
                </Text>
              </View>
            </View>
            
            {/* Generate Button */}
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generatePersonalItinerary}
              disabled={!location || personalItineraryLoading}
            >
              <Text style={styles.generateButtonText}>Generate Itinerary</Text>
              {personalItineraryLoading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
          
          {/* Generated Itinerary Results */}
          {showPersonalItinerary && (
            <View style={styles.itineraryResults}>
              {/* Map with route */}
              <View style={styles.personalMapContainer}>
                <MapView
                  ref={personalMapRef}
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={{
                    latitude: location?.latitude || 19.0176,
                    longitude: location?.longitude || 72.8561,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  showsUserLocation={true}
                >
                  {/* User's current location marker */}
                  {location && (
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                      title="Your Location"
                    >
                      <View style={styles.userLocationMarker}>
                        <Ionicons name="person" size={14} color="#fff" />
                      </View>
                    </Marker>
                  )}
                  
                  {/* Food stop markers */}
                  {personalItinerary.map((stop, index) => (
                    <Marker
                      key={stop.id}
                      coordinate={{
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                      }}
                      title={stop.name}
                      description={stop.description}
                    >
                      <View style={styles.itineraryMarker}>
                        <Text style={styles.itineraryMarkerText}>{index + 1}</Text>
                      </View>
                    </Marker>
                  ))}
                  
                  {/* Route polyline */}
                  {location && personalItinerary.length > 0 && (
                    <Polyline
                      coordinates={[
                        { latitude: location.latitude, longitude: location.longitude },
                        ...personalItinerary.map(stop => ({
                          latitude: stop.latitude,
                          longitude: stop.longitude,
                        }))
                      ]}
                      strokeColor="#FF5200"
                      strokeWidth={4}
                      lineDashPattern={[0]}
                    />
                  )}
                </MapView>
                
                {/* Total info box */}
                <View style={styles.totalInfoBox}>
                  <View style={styles.totalInfoItem}>
                    <Ionicons name="wallet-outline" size={16} color="#FF5200" />
                    <Text style={styles.totalInfoLabel}>Total Cost:</Text>
                    <Text style={styles.totalInfoValue}>{totalCost}</Text>
                  </View>
                  <View style={styles.totalInfoItem}>
                    <Ionicons name="time-outline" size={16} color="#FF5200" />
                    <Text style={styles.totalInfoLabel}>Total Time:</Text>
                    <Text style={styles.totalInfoValue}>{totalTime}</Text>
                  </View>
                </View>
              </View>
              
              {/* Itinerary list */}
              <View style={styles.itineraryList}>
                <Text style={styles.itineraryListTitle}>Your Food Trail</Text>
                
                {personalItinerary.map((stop, index) => (
                  <View key={stop.id} style={styles.itineraryItem}>
                    <View style={styles.itineraryItemHeader}>
                      <View style={styles.itineraryItemNumber}>
                        <Text style={styles.itineraryItemNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.itineraryItemDetails}>
                        <Text style={styles.itineraryItemName}>{stop.name}</Text>
                        <Text style={styles.itineraryItemDesc}>{stop.description}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.itineraryItemContent}>
                      <Image source={{ uri: stop.image }} style={styles.itineraryItemImage} />
                      
                      <View style={styles.itineraryItemStats}>
                        <View style={styles.itineraryItemStat}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.itineraryItemStatText}>{stop.timeAtStop} mins</Text>
                        </View>
                        <View style={styles.itineraryItemStat}>
                          <Ionicons name="wallet-outline" size={14} color="#666" />
                          <Text style={styles.itineraryItemStatText}>{stop.price}</Text>
                        </View>
                        <View style={styles.itineraryItemStat}>
                          <Ionicons name="walk-outline" size={14} color="#666" />
                          <Text style={styles.itineraryItemStatText}>{stop.walkingTime} mins walk</Text>
                        </View>
                        <View style={styles.itineraryItemStat}>
                          <Ionicons name="location-outline" size={14} color="#666" />
                          <Text style={styles.itineraryItemStatText}>{stop.distance} km away</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                
                {/* Shuffle button */}
                <TouchableOpacity 
                  style={styles.shuffleButton}
                  onPress={shuffleItinerary}
                  disabled={personalItineraryLoading}
                >
                  <Ionicons name="shuffle" size={18} color="#fff" />
                  <Text style={styles.shuffleButtonText}>Shuffle Itinerary</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Itineraries Section */}
        <View style={styles.itinerariesSection}>
          <Text style={styles.sectionTitle}>Your Personalized Itineraries</Text>
          <FlatList
            data={itineraries}
            renderItem={renderItineraryCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.itinerariesList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF5200',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  featuredBanner: {
    height: 180,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,0,0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  // Food Trail Map Styles
  mapSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  trailTabs: {
    paddingBottom: 12,
  },
  trailTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  trailTabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: '#FF5200',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  calloutContainer: {
    width: 200,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutPrice: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#FF5200',
  },
  calloutRating: {
    flexDirection: 'row',
  },
  trailDescription: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  trailDescriptionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  stopsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stopsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  stopNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stopNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stopDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  stopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopPrice: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#FF5200',
  },
  stopRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopRatingLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,82,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  itinerariesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  itinerariesList: {
    paddingBottom: 20,
  },
  itineraryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  itineraryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  placesList: {
    gap: 12,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeRatingText: {
    marginLeft: 4,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  // Personalized Itinerary Styles
  personalItinerarySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  itineraryForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  optionButtonActive: {
    backgroundColor: '#FF5200',
    borderColor: '#FF5200',
  },
  optionText: {
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#FF5200',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itineraryResults: {
    marginBottom: 16,
  },
  personalMapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  userLocationMarker: {
    backgroundColor: '#4285F4',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  itineraryMarker: {
    backgroundColor: '#FF5200',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryMarkerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalInfoBox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  totalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalInfoLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  totalInfoValue: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  itineraryList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  itineraryListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  itineraryItem: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5200',
  },
  itineraryItemHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itineraryItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5200',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itineraryItemNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itineraryItemDetails: {
    flex: 1,
  },
  itineraryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itineraryItemDesc: {
    fontSize: 12,
    color: '#666',
  },
  itineraryItemContent: {
    flexDirection: 'row',
  },
  itineraryItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itineraryItemStats: {
    flex: 1,
    justifyContent: 'space-around',
  },
  itineraryItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itineraryItemStatText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  shuffleButton: {
    backgroundColor: '#FF5200',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shuffleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});