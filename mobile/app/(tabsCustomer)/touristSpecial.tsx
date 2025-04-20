import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function TouristSpecialScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

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

      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="utensils" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="walking" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Walking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="camera" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="glass-cheers" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Nightlife</Text>
        </TouchableOpacity>
      </View>

      {/* Itineraries Section */}
      <View style={styles.itinerariesSection}>
        <Text style={styles.sectionTitle}>Your Personalized Itineraries</Text>
        <FlatList
          data={itineraries}
          renderItem={renderItineraryCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itinerariesList}
        />
      </View>
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
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  itinerariesList: {
    paddingBottom: 80, // Extra space for the tab bar
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
});