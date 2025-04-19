import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import { MaterialIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'

// import { StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const { height } = Dimensions.get('window');
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null)
  const [address, setAddress] = React.useState<string>('')


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
          <TouchableOpacity style={styles.profileIcon}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>U</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#333" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search DoorDash"
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity style={styles.nowButton}>
          <MaterialIcons name="schedule" size={20} color="#333" />
          <Text style={styles.nowText}>Now</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Featured Promos - Replacing service buttons */}
        <View style={styles.featuredContainer}>
          <PromoButton icon="utensils" name="$0 Delivery Fee" />
          <PromoButton icon="percent" name="Daily Deals" />
          <PromoButton icon="bolt" name="Express" />
        </View>

        {/* Map Placeholder - 70% of screen height */}
        <View style={[styles.mapPlaceholder, { height: height * 0.7 * 0.7 }]}>
          <MapView
            style={styles.map}
            provider="google" // Force Google Maps on Android
            initialRegion={{
              latitude: location?.coords.latitude || 37.78825,
              longitude: location?.coords.longitude || -122.4324,
              latitudeDelta: 0,
              longitudeDelta: 0,
            }}
          >
            <Marker
              coordinate={{ latitude: location?.coords.latitude || 37.78825, longitude: location?.coords.longitude || -122.4324 }}
              title={"My Marker"}
              description={"This is a marker example"}
            />
          </MapView>
        </View>

        {/* Food Categories - Moved below map */}
        <Text style={styles.categoriesTitle}>Popular Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <FoodCategory icon="🍕" name="Pizza" price="$3.25" />
          <FoodCategory icon="🌯" name="Burrito" price="$4.15" />
          <FoodCategory icon="🥗" name="Bowls" price="$2.75" />
          <FoodCategory icon="🥐" name="Bakery" price="$3.27" />
          <FoodCategory icon="🍗" name="Chicken" price="$2.99" />
          <FoodCategory icon="🍔" name="Burgers" price="$3.50" />
          <FoodCategory icon="🍦" name="Dessert" price="$4.00" />
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

        {/* Bottom Navigation - Just a placeholder to match the image */}
        <View style={styles.bottomPlaceholder} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#ff8c00" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="search" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="receipt" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="shopping-cart" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// Helper component for food categories
interface FoodCategoryProps {
  icon: string;
  name: string;
  price: string;
}

const FoodCategory = ({ icon, name, price }: FoodCategoryProps) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryIconContainer}>
      <Text style={styles.categoryIcon}>{icon}</Text>
    </View>
    <Text style={styles.categoryName}>{name}</Text>
    <Text style={styles.categoryPrice}>{price}</Text>
  </View>
)

// Helper component for promo buttons (replacing service buttons)
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  nowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
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
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    elevation: 3,
  },
  promoName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  mapText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapButton: {
    backgroundColor: '#ff4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 16,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebcd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryPrice: {
    fontSize: 14,
    color: '#ff4500',
    textAlign: 'center',
    fontWeight: '500',
  },
  curvedContainer: {
    backgroundColor: '#fff8f0',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 60, // Extra padding for bottom nav
    marginTop: 16,
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
    color: '#222',
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
    height: 60,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
})
