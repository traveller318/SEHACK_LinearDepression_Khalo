import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { MaterialIcons, Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'
import CustomerPreferencesForm from '../components/CustomerPreferencesForm'
import { checkIfProfileExists } from '../../lib/customerProfileHelpers'
import { supabase } from '../../lib/supabase'

export default function DashboardScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { height } = Dimensions.get('window');
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [address, setAddress] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showPreferences, setShowPreferences] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.user_metadata?.user_type !== 'customer') {
      router.replace('/(auth)/signin')
    }
  }, [user])

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user?.id) {
        try {
          const hasProfile = await checkIfProfileExists(user.id)
          setShowPreferences(!hasProfile) 
          setLoading(false)
        } catch (error) {
          console.error('Error checking profile:', error)
          setLoading(false)
        }
      }
    }

    if (user) {
      checkUserProfile()
    }
  }, [user])

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress('Permission to access location was denied');
          return;
        }

        // Get the current position
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        console.log('Current Location:', currentLocation);
        
        // Optionally, reverse geocode to get a human-readable address
        let addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        console.log('Address Response:', addressResponse);
        const formattedAdress = addressResponse[0].formattedAddress;
        const truncatedAddress = formattedAdress?.split(' ').slice(0, 3).join(' ') + '....';
        console.log('Truncated Address:', truncatedAddress);

        if (addressResponse.length > 0) {
          const { formattedAddress, city, region } = addressResponse[0];
          setAddress(truncatedAddress);
        } else {
          setAddress('Unable to determine address');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setAddress('Error fetching location');
      }
    })();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/(auth)/signin')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // If the user needs to complete preferences, show the form
  console.log("showPreferences", showPreferences);
  
  if (showPreferences) {
    return <CustomerPreferencesForm />
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={24} color="#333" />
          <Text style={styles.locationText}>{address}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#333" />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.cartIcon}>
            <MaterialIcons name="shopping-cart" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationIcon}>
            <MaterialIcons name="notifications" size={24} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.profileIcon}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>{user?.email?.charAt(0).toUpperCase() || "U"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <LinearGradient
          colors={['#FF9A5A', '#FF5200']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.searchBar}
        >
          <Feather name="search" size={22} color="#fff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, groceries, etc."
            placeholderTextColor="rgba(255,255,255,0.8)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <MaterialCommunityIcons name="microphone-outline" size={22} color="#fff" />
          )}
        </LinearGradient>
        <TouchableOpacity style={styles.nowButton}>
          <MaterialIcons name="schedule" size={20} color="#333" />
          <Text style={styles.nowText}>Now</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Map Placeholder - 70% of screen height */}
        <View style={[styles.mapPlaceholder, { height: height * 0.7 * 0.5 }]}>
          <MapView
            style={styles.map}
            provider="google" // Force Google Maps on Android
            initialRegion={{
              latitude: location?.coords.latitude || 19.123,
              longitude: location?.coords.longitude || 72.834,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: location?.coords.latitude || 37.78825, longitude: location?.coords.longitude || -122.4324 }}
              title={"My Location"}
              description={"You are here"}
            />
          </MapView>
        </View>

        {/* Featured Promos - Below the map */}
        <View style={styles.featuredContainer}>
          <PromoButton icon="utensils" name="$0 Delivery Fee" />
          <PromoButton icon="percent" name="Daily Deals" />
          <PromoButton icon="bolt" name="Express" />
        </View>

        {/* Popular Stalls */}
        <Text style={styles.categoriesTitle}>Popular Stalls</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stallsContainer}>
          <StallCard 
            name="Foodie Heaven" 
            image="https://via.placeholder.com/150/ffffff/000000?text=FH" 
            rating={4.7} 
            hygiene={5} 
          />
          <StallCard 
            name="Spice Corner" 
            image="https://via.placeholder.com/150/ffffff/000000?text=SC" 
            rating={4.5} 
            hygiene={4} 
          />
          <StallCard 
            name="Fresh & Tasty" 
            image="https://via.placeholder.com/150/ffffff/000000?text=FT" 
            rating={4.8} 
            hygiene={5} 
          />
          <StallCard 
            name="Quick Bites" 
            image="https://via.placeholder.com/150/ffffff/000000?text=QB" 
            rating={4.3} 
            hygiene={4} 
          />
          <StallCard 
            name="Street Delights" 
            image="https://via.placeholder.com/150/ffffff/000000?text=SD" 
            rating={4.6} 
            hygiene={4} 
          />
        </ScrollView>

        {/* Curved Orange Container */}
        <View style={styles.curvedContainer}>
          <View style={styles.groceryBanner}>
            <View style={styles.groceryTextContainer}>
              <Text style={styles.groceryTitle}>Groceries, your way.</Text>
              <Text style={styles.grocerySubtitle}>Your perfect grocery order, delivered straight to you.</Text>
              <TouchableOpacity style={styles.shopButton}>
                <Text style={styles.shopButtonText}>Shop Groceries</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://via.placeholder.com/150/ffffff/000000?text=Groceries' }}
              style={styles.groceryImage}
            />
          </View>

          <Text style={styles.sectionTitle}>Groceries, Snacks & Drinks</Text>

          <View style={styles.storeListItem}>
            <View style={styles.storeIcon}>
              <Text>🛒</Text>
            </View>
            <Text style={styles.storeName}>ALDI</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#333" />
          </View>

          <View style={styles.storeListItem}>
            <View style={styles.storeIcon}>
              <Text>🏪</Text>
            </View>
            <Text style={styles.storeName}>7-Eleven</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#333" />
          </View>

          <View style={styles.storeListItem}>
            <View style={styles.storeIcon}>
              <Text>🛍️</Text>
            </View>
            <Text style={styles.storeName}>Target</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#333" />
          </View>
        </View>

        {/* Bottom placeholder for spacing */}
        <View style={styles.bottomPlaceholder} />
      </ScrollView>
    </SafeAreaView>
  )
}

// Helper component for Stall Cards
interface StallCardProps {
  name: string;
  image: string;
  rating: number;
  hygiene: number;
}

const StallCard = ({ name, image, rating, hygiene }: StallCardProps) => (
  <View style={styles.stallCard}>
    <Image source={{ uri: image }} style={styles.stallImage} />
    <View style={styles.stallInfo}>
      <Text style={styles.stallName}>{name}</Text>
      <View style={styles.ratingContainer}>
        <View style={styles.ratingItem}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.ratingLabel}>Popularity</Text>
        </View>
        <View style={styles.ratingItem}>
          <MaterialCommunityIcons name="silverware-clean" size={16} color="#4CAF50" />
          <View style={styles.hygieneStars}>
            {Array(5).fill(0).map((_, i) => (
              <MaterialIcons 
                key={i}
                name="star" 
                size={12} 
                color={i < hygiene ? "#4CAF50" : "#e0e0e0"} 
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text style={styles.ratingLabel}>Hygiene</Text>
        </View>
      </View>
    </View>
  </View>
)

// Helper component for promo buttons
interface PromoButtonProps {
  icon: string;
  name: string;
}

const PromoButton = ({ icon, name }: PromoButtonProps) => (
  <TouchableOpacity style={styles.promoButton}>
    <FontAwesome5 name={icon as any} size={20} color="#ff4500" />
    <Text style={styles.promoName}>{name}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff8c00',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    marginRight: 12,
  },
  notificationIcon: {
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ff8c00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  nowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nowText: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  promoButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promoName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoriesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  stallsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  stallCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stallImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  stallInfo: {
    padding: 12,
  },
  stallName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hygieneStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curvedContainer: {
    backgroundColor: '#FF5200',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 30,
    marginTop: 16,
    flex: 1,
    minHeight: 300,
  },
  groceryBanner: {
    backgroundColor: '#ffebcd',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  groceryTextContainer: {
    flex: 2,
  },
  groceryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  grocerySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  shopButton: {
    backgroundColor: '#ff4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groceryImage: {
    flex: 1,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  storeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  storeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  bottomPlaceholder: {
    height: 80,
  },
})
