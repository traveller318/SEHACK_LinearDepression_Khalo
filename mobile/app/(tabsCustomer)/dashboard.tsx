import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import {
  MaterialIcons,
  Feather,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import CustomerPreferencesForm from '../components/CustomerPreferencesForm'
import { checkIfProfileExists } from '../../lib/customerProfileHelpers'
import { supabase } from '../../lib/supabase'

export default function DashboardScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { height } = Dimensions.get('window')
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [address, setAddress] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showPreferences, setShowPreferences] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(['Bestseller'])
  const [allStalls, setAllStalls] = useState([])
  const [nearbyStalls, setNearbyStalls] = useState([
    {
      name: 'Street Corner',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=SC',
      rating: 4.2,
      hygiene: 4,
      distance: '0.3 km',
    },
    {
      name: 'Local Delights',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=LD',
      rating: 4.4,
      hygiene: 4,
      distance: '0.5 km',
    },
    {
      name: 'Metro Eats',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=ME',
      rating: 4.1,
      hygiene: 3,
      distance: '0.8 km',
    },
    {
      name: 'Urban Bites',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=UB',
      rating: 4.6,
      hygiene: 5,
      distance: '1.2 km',
    },
    {
      name: 'City Flavors',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=CF',
      rating: 4.3,
      hygiene: 4,
      distance: '1.5 km',
    },
  ])
  useEffect(() => {
    const fetchAllStalls = async () => {
      try {
        const response = await fetch(
          'https://khalo-r5v5.onrender.com/customer/getAllStalls'
        )
        const data = await response.json()
        console.log(data)

        setAllStalls(data)
      } catch (error) {
        console.error('Error fetching all stalls:', error)
      }
    }

    fetchAllStalls()
  }, [])

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
    ;(async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setAddress('Permission to access location was denied')
          return
        }

        // Get the current position
        let currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation)
        console.log('Current Location:', currentLocation)

        // Optionally, reverse geocode to get a human-readable address
        let addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        })
        console.log('Address Response:', addressResponse)
        const formattedAdress = addressResponse[0].formattedAddress
        const truncatedAddress =
          formattedAdress?.split(' ').slice(0, 3).join(' ') + '....'
        console.log('Truncated Address:', truncatedAddress)

        if (addressResponse.length > 0) {
          const { formattedAddress, city, region } = addressResponse[0]
          setAddress(truncatedAddress)
        } else {
          setAddress('Unable to determine address')
        }
      } catch (error) {
        console.error('Error fetching location:', error)
        setAddress('Error fetching location')
      }
    })()
  }, [])
  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const response = await fetch(
          'https://khalo-r5v5.onrender.com/customer/getNearbyStalls',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lat: 19.123537,
              lng: 72.836067,
            }),
          }
        )

        const data = await response.json()
        setNearbyStalls(data)
      } catch (error) {
        console.error('Error fetching nearby stalls:', error)
      }
    }

    fetchStalls()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/(auth)/signin')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible)
  }

  // Function to toggle tag selection
  const toggleTagSelection = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagName))
    } else {
      setSelectedTags([...selectedTags, tagName])
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
  console.log('showPreferences', showPreferences)

  if (showPreferences) {
    return <CustomerPreferencesForm />
  }

  // const fetchNearbyStalls = async () => {
  //   if (!location?.coords?.latitude || !location?.coords?.longitude) {
  //     console.error('Location coordinates are missing');
  //     setLoadingStalls(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch('https://khalo-r5v5.onrender.com/customer/getNearbyStalls', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         lat: location.coords.latitude,
  //         lng: location.coords.longitude,
  //         radius: 4000,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to fetch nearby stalls');
  //     }
  //     // console.log("response", response);

  //     const data = await response.json();
  //     setNearbyStalls(data);
  //   } catch (error: any) {
  //     console.error('Error fetching nearby stalls:', error.message);
  //     Alert.alert('Error', error.message || 'Failed to fetch nearby stalls');
  //   } finally {
  //     setLoadingStalls(false);
  //   }
  // };

  const icons = {
    chinese: require('./icons/noodles.png'),
    north_indian: require('./icons/turban.png'),
    italian: require('./icons/pizza.png'),
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="#333" />
            <Text style={styles.locationText}>{address}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#333" />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.filterIcon}
              onPress={toggleFilterModal}
            >
              <MaterialIcons name="filter-list" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartIcon}>
              <MaterialIcons name="shopping-cart" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationIcon}>
              <MaterialIcons name="notifications" size={24} color="#333" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.profileIcon}
            >
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
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
            <Feather
              name="search"
              size={22}
              color="#fff"
              style={styles.searchIcon}
            />
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
              <MaterialCommunityIcons
                name="microphone-outline"
                size={22}
                color="#fff"
              />
            )}
          </LinearGradient>
          <TouchableOpacity style={styles.nowButton}>
            <MaterialIcons name="schedule" size={20} color="#333" />
            <Text style={styles.nowText}>Now</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Map Placeholder - increased by 20% */}
          <View style={[styles.mapPlaceholder, { height: height * 0.8 * 0.6 }]}>
            <MapView
              style={styles.map}
              provider="google" // Force Google Maps on Android
              initialRegion={{
                latitude: location?.coords.latitude || 19.123,
                longitude: location?.coords.longitude || 72.834,
                latitudeDelta: 0.0075, // Zoomed in a bit more
                longitudeDelta: 0.0075,
              }}
              showsUserLocation
              showsMyLocationButton
              showsCompass
            >
              <Marker
                coordinate={{
                  latitude: location?.coords.latitude || 19.1196,
                  longitude: location?.coords.longitude || 72.8367,
                }}
                title={'My Location'}
                description={'You are here'}
                pinColor="#FF5200"
                // image={require('./icons/pizza.png')}
              />
              {nearbyStalls.map((stall, index) => {
                let markerImage // Declare markerImage
                if (stall.cuisine === 'Chinese') {
                  markerImage = icons.chinese
                }
                if (stall.cuisine === 'Italian') {
                  markerImage = icons.north_indian
                }
                if (stall.cuisine === 'North Indian') {
                  markerImage = icons.north_indian
                }

                return (
                  <Marker
                    key={index}
                    coordinate={{ latitude: stall.lat, longitude: stall.lng }}
                    title={stall.name}
                    description={stall.cuisine}
                  >
                    {/* Custom Marker with Styled Image */}
                    <Image
                      source={markerImage}
                      style={{ width: 30, height: 30 }} // Adjust size as needed
                      resizeMode="contain" // Ensure proper scaling
                    />
                  </Marker>
                )
              })}
            </MapView>
          </View>

          {/* Nearby Stalls - Below the map */}
          <Text style={styles.categoriesTitle}>Nearby Stalls</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stallsContainer}
          >
            {nearbyStalls.map((stall, index) => (
              <StallCard
                key={index}
                name={stall.name}
                image={stall.image_url}
                rating={stall.rating}
                hygiene={stall.hygiene_score}
                distance={stall.distance}
              />
            ))}
          </ScrollView>

          {/* Popular Stalls */}
          <Text style={styles.categoriesTitle}>Popular Stalls</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stallsContainer}
          >
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

          {/* Curved Orange Container - ONLY for filters and All Stalls */}
          <View style={styles.curvedContainer}>
            {/* Filter Button */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.filterButtonText}>Filters and Sorting</Text>
              <MaterialIcons name="tune" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>All Stalls</Text>

            <View style={styles.allStallsContainer}>
              {allStalls.map((stall, index) => (
                <VerticalStallCard key={index} {...stall} />
              ))}
            </View>
          </View>

          {/* Bottom placeholder for spacing */}
          <View style={styles.bottomPlaceholder} />
        </ScrollView>
      </SafeAreaView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleFilterModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters and Sorting</Text>
              <TouchableOpacity onPress={toggleFilterModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              {/* Sort by section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeader}>Sort by</Text>
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[styles.sortOption, styles.sortOptionWithIcon]}
                  >
                    <MaterialIcons name="arrow-upward" size={18} color="#666" />
                    <Text style={styles.sortOptionText}>
                      Price - low to high
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortOption, styles.sortOptionWithIcon]}
                  >
                    <MaterialIcons
                      name="arrow-downward"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.sortOptionText}>
                      Price - high to low
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      styles.sortOptionWithIcon,
                      styles.sortOptionActive,
                    ]}
                  >
                    <MaterialIcons name="star" size={18} color="#FF5200" />
                    <Text style={[styles.sortOptionText, { color: '#FF5200' }]}>
                      Rating - high to low
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pure veg toggle */}
              <View style={styles.filterSection}>
                <View style={styles.pureVegRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={styles.sectionHeader}>
                    Pure vegetarian options only
                  </Text>
                </View>
              </View>

              {/* Top picks */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeader}>Top picks</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity
                    style={[styles.filterChip, styles.filterChipActive]}
                  >
                    <MaterialIcons
                      name="local-fire-department"
                      size={18}
                      color="#FF5722"
                    />
                    <Text style={styles.filterChipText}>Bestseller</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialIcons name="star" size={18} color="#FFD700" />
                    <Text style={styles.filterChipText}>Rated 4+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={18}
                      color="#9C27B0"
                    />
                    <Text style={styles.filterChipText}>Premium</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dietary preference */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeader}>Dietary preference</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialCommunityIcons
                      name="chili-mild"
                      size={18}
                      color="#FF0000"
                    />
                    <Text style={styles.filterChipText}>Spicy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={18}
                      color="#4CAF50"
                    />
                    <Text style={styles.filterChipText}>Vegan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialCommunityIcons
                      name="food-apple"
                      size={18}
                      color="#8BC34A"
                    />
                    <Text style={styles.filterChipText}>Healthy</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Offers */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeader}>Offers</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialIcons
                      name="local-offer"
                      size={18}
                      color="#2196F3"
                    />
                    <Text style={styles.filterChipText}>Items @ 50% OFF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialIcons name="loyalty" size={18} color="#FF9800" />
                    <Text style={styles.filterChipText}>Buy 1 Get 1</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Distance */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionHeader}>Distance</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity
                    style={[styles.filterChip, styles.filterChipActive]}
                  >
                    <MaterialIcons name="place" size={18} color="#E91E63" />
                    <Text style={styles.filterChipText}>Less than 1 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialIcons name="place" size={18} color="#9C27B0" />
                    <Text style={styles.filterChipText}>1-3 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterChip}>
                    <MaterialIcons name="place" size={18} color="#3F51B5" />
                    <Text style={styles.filterChipText}>3-5 km</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={toggleFilterModal}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={toggleFilterModal}
              >
                <LinearGradient
                  colors={['#FF9A5A', '#FF5200']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyButtonGradient}
                >
                  <Text style={styles.applyButtonText}>Apply (120)</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

// Helper component for Stall Cards
interface StallCardProps {
  name: string
  image: string
  rating: number
  hygiene: number
  distance?: string
}

const StallCard = ({
  name,
  image,
  rating,
  hygiene,
  distance,
}: StallCardProps) => (
  <View style={styles.stallCard}>
    <Image source={{ uri: image }} style={styles.stallImage} />
    <View style={styles.stallOverlay}>
      <View style={styles.stallBadge}>
        <Text style={styles.stallBadgeText}>Popular</Text>
      </View>
    </View>
    <View style={styles.stallInfo}>
      <Text style={styles.stallName}>{name}</Text>
      <View style={styles.ratingContainer}>
        <View style={styles.ratingItem}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.ratingLabel}>Popularity</Text>
        </View>
        <View style={styles.ratingItem}>
          <MaterialCommunityIcons
            name="silverware-clean"
            size={16}
            color="#4CAF50"
          />
          <View style={styles.hygieneStars}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={12}
                  color={i < hygiene ? '#4CAF50' : '#e0e0e0'}
                  style={{ marginRight: 2 }}
                />
              ))}
          </View>
          <Text style={styles.ratingLabel}>Hygiene</Text>
        </View>
      </View>
      {distance && (
        <View style={styles.distanceContainer}>
          <MaterialIcons name="place" size={14} color="#666" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      )}
    </View>
  </View>
)

// Helper component for promo buttons
interface PromoButtonProps {
  icon: string
  name: string
}

const PromoButton = ({ icon, name }: PromoButtonProps) => (
  <TouchableOpacity style={styles.promoButton}>
    <FontAwesome5 name={icon as any} size={20} color="#ff4500" />
    <Text style={styles.promoName}>{name}</Text>
  </TouchableOpacity>
)

// Helper component for filter tags
interface FilterTagProps {
  icon: React.ReactNode
  name: string
  active?: boolean
  onPress?: () => void
}

const FilterTag = ({ icon, name, active = false, onPress }: FilterTagProps) => (
  <TouchableOpacity
    style={[styles.filterTag, active && styles.filterTagActive]}
    onPress={onPress}
  >
    <View style={styles.filterTagIcon}>{icon}</View>
    <Text style={styles.filterTagText}>{name}</Text>
  </TouchableOpacity>
)

// New Vertical Stall Card Component
interface VerticalStallCardProps {
  name: string
  image?: string
  cuisine: string
  distance: string
  deliveryTime: string
  rating: number
  hygieneScore: number
  verified?: boolean
}

const VerticalStallCard = ({
  name,
  image_url,
  cuisine,
  distance,
  deliveryTime,
  rating,
  hygiene_score,
  verified = false,
}: VerticalStallCardProps) => (
  <View style={styles.verticalStallCard}>
    <View style={styles.verticalStallContent}>
      <View style={styles.verticalStallImageContainer}>
        <Image
          source={{
            uri:
              image_url ||
              `https://via.placeholder.com/150/ffffff/000000?text=${name
                .split(' ')
                .map((s) => s[0])
                .join('')}`,
          }}
          style={styles.verticalStallImage}
        />
      </View>
      <View style={styles.verticalStallInfo}>
        <View style={styles.verticalStallHeader}>
          <Text style={styles.verticalStallName}>{name}</Text>
          {verified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
        <Text style={styles.verticalStallCuisine}>{cuisine}</Text>
        <View style={styles.verticalStallDetails}>
          <View style={styles.verticalStallDetail}>
            <MaterialIcons name="place" size={14} color="#666" />
            <Text style={styles.verticalStallDetailText}>{distance}</Text>
          </View>
          <View style={styles.verticalStallDetail}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.verticalStallDetailText}>{deliveryTime}</Text>
          </View>
        </View>
        <View style={styles.verticalStallRatings}>
          <View style={styles.verticalStallRating}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.verticalStallRatingText}>{rating}</Text>
          </View>
          <View style={styles.verticalStallHygiene}>
            <MaterialCommunityIcons
              name="silverware-clean"
              size={16}
              color="#4CAF50"
            />
            <View style={styles.hygieneStars}>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={12}
                    color={i < hygiene_score ? '#4CAF50' : '#e0e0e0'}
                    style={{ marginRight: 2 }}
                  />
                ))}
            </View>
          </View>
        </View>
      </View>
    </View>
    <MaterialIcons
      name="chevron-right"
      size={24}
      color="#999"
      style={styles.verticalStallArrow}
    />
  </View>
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
  filterIcon: {
    marginRight: 12,
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
    backgroundColor: '#ffffff',
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stallImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  stallOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  stallBadge: {
    backgroundColor: 'rgba(255, 82, 0, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  stallBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stallInfo: {
    padding: 16,
  },
  stallName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
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
    minHeight: 800,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  allStallsContainer: {
    marginBottom: 24,
  },
  verticalStallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  verticalStallContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalStallImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
  },
  verticalStallImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verticalStallInfo: {
    flex: 1,
  },
  verticalStallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verticalStallName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  verifiedBadge: {
    padding: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  verticalStallCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  verticalStallDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  verticalStallDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  verticalStallDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  verticalStallRatings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalStallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  verticalStallRatingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  verticalStallHygiene: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verticalStallArrow: {
    marginLeft: 8,
  },
  bottomPlaceholder: {
    height: 100,
    backgroundColor: '#FF5200',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 16,
    maxHeight: 500, // Make the modal more scrollable
  },
  modalContentContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pureVegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortOptions: {
    flexDirection: 'column',
    gap: 12,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  sortOptionWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: '#fff4e8',
    borderLeftWidth: 3,
    borderLeftColor: '#FF5200',
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#fff4e8',
    borderColor: '#FF5200',
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  clearButtonText: {
    color: '#ff4757',
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  filterTagActive: {
    backgroundColor: '#FFE0CC',
    borderColor: '#FF5200',
    borderWidth: 1,
  },
  filterTagIcon: {
    marginRight: 6,
  },
  filterTagText: {
    fontSize: 14,
    color: '#333',
  },
})
