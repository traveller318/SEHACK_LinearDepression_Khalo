import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
import {
  getStallReview,
  getSingleStall,
  createReview,
} from '../../lib/routes/user.js'
import { getMenuItems } from '../../lib/routes/vendor.js'
// Define types for our data
interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  image: string
  isVeg: boolean
  isRecommended: boolean
  rating: number
}

interface Review {
  id: string
  userName: string
  rating: number
  date: string
  comment: string
  userImage: string
}

interface StallData {
  name: string
  rating: number
  totalReviews: number
  cuisine: string
  address: string
  distance: string
  openingTime: string
  phoneNumber: string
  hygieneScore: number
  avgPrice: string
}

// Sample data for menu items

// Sample data for stall images
const STALL_IMAGES = [
  'https://source.unsplash.com/random/800x600/?streetfood,1',
  'https://source.unsplash.com/random/800x600/?restaurant,1',
  'https://source.unsplash.com/random/800x600/?food,1',
  'https://source.unsplash.com/random/800x600/?chef,1',
]

// Sample data for reviews
// const REVIEWS: Review[] =

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF5200',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerShareButton: {
    padding: 8,
  },
  carouselContainer: {
    height: 250,
    position: 'relative',
  },
  carouselImage: {
    width,
    height: 250,
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  headerIcon: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 12,
  },
  stallInfoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stallName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cuisineText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  hygieneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  hygieneText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1EA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  contactButtonText: {
    color: '#FF5200',
    fontWeight: '500',
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF5200',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  menuContainer: {
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  activeCategoryChip: {
    backgroundColor: '#FF5200',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '500',
  },
  menuItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  nameAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vegSymbol: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  nonVegBadge: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  nonVegSymbol: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
  },
  recommendedBadge: {
    backgroundColor: '#FFF1EA',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    color: '#FF5200',
    fontWeight: '500',
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  menuItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  smallRatingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#333',
  },
  menuItemImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5200',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: '#FF5200',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reviewsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReviewText: {
    color: '#FF5200',
    marginRight: 4,
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewerInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  viewAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#FF5200',
    marginRight: 8,
  },
  infoTabContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  infoGroup: {
    marginBottom: 24,
  },
  infoGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGroupText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  directionsButton: {
    backgroundColor: '#FF5200',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  spacer: {
    height: 80,
  },
  orderButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  orderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingInputContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingInputLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starInput: {
    marginHorizontal: 4,
  },
  reviewInputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  hygieneReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  hygieneReportButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
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
    maxHeight: '80%',
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
    padding: 16,
  },
  modalButton: {
    backgroundColor: '#FF5200',
    paddingVertical: 14,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  hygieneScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hygieneScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  hygieneScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  hygieneScoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  hygieneScoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  hygieneReportSection: {
    marginBottom: 24,
  },
  hygieneReportSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  hygieneMetricItem: {
    marginBottom: 16,
  },
  hygieneMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hygieneMetricName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  hygieneMetricRating: {
    flexDirection: 'row',
  },
  hygieneMetricDescription: {
    fontSize: 13,
    color: '#666',
  },
  hygieneReportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statRatingStars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menuList: {
    paddingBottom: 20,
  },
})

const StallPage = () => {
  const [MENU_ITEMS, setMenuItems] = useState([
    {
      id: '1',
      name: 'Chicken Biryani',
      description: 'Flavorful rice dish with spiced chicken',
      price: '₹180',
      image: 'https://source.unsplash.com/random/300x200/?biryani',
      isVeg: false,
      isRecommended: true,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese with spices',
      price: '₹150',
      image: 'https://source.unsplash.com/random/300x200/?paneer',
      isVeg: true,
      isRecommended: true,
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Butter Naan',
      description: 'Soft bread coated with butter',
      price: '₹40',
      image: 'https://source.unsplash.com/random/300x200/?naan',
      isVeg: true,
      isRecommended: false,
      rating: 4.5,
    },
    {
      id: '4',
      name: 'Dal Makhani',
      description: 'Creamy lentil curry cooked overnight',
      price: '₹120',
      image: 'https://source.unsplash.com/random/300x200/?curry',
      isVeg: true,
      isRecommended: false,
      rating: 4.7,
    },
    {
      id: '5',
      name: 'Gulab Jamun',
      description: 'Sweet milk solid dumplings',
      price: '₹80',
      image: 'https://source.unsplash.com/random/300x200/?sweet',
      isVeg: true,
      isRecommended: true,
      rating: 4.9,
    },
  ])
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollY = useRef(new Animated.Value(0)).current
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>(
    'menu'
  )
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hygieneReportModalVisible, setHygieneReportModalVisible] =
    useState(false)
  const [stallData, setStallData] = useState<StallData>({
    name: 'Street Corner Delights',
    rating: 4.5,
    totalReviews: 245,
    cuisine: 'North Indian, Chinese',
    address: '123 Food Street, Mumbai',
    distance: '1.2 km',
    openingTime: '10:00 AM - 10:00 PM',
    phoneNumber: '+91 98765 43210',
    hygieneScore: 4.2,
    avgPrice: '₹150 for one',
  })
  const headerHeight = 250
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  // const temp = useAuth()
  // console.log(temp)

  const [REVIEWS, setReviews] = useState([
    {
      id: '1',
      userName: 'Priya M',
      rating: 5,
      date: '2 days ago',
      comment:
        'Absolutely loved the food! The biryani was authentic and flavorful. Highly recommended!',
      userImage: 'https://source.unsplash.com/random/100x100/?woman,1',
    },
    {
      id: '2',
      userName: 'Rahul S',
      rating: 4,
      date: '1 week ago',
      comment:
        'Great taste and value for money. The portion sizes are good and service is prompt.',
      userImage: 'https://source.unsplash.com/random/100x100/?man,1',
    },
    {
      id: '3',
      userName: 'Ananya K',
      rating: 5,
      date: '2 weeks ago',
      comment:
        'This place never disappoints! The paneer tikka is to die for. My favorite street stall in the area.',
      userImage: 'https://source.unsplash.com/random/100x100/?woman,2',
    },
  ])

  useEffect(() => {
    const fetchStallData = async () => {
      const response = await getSingleStall(id)
      setIsLoading(false)
      console.log('Hello')
      console.log(response)
      setStallData(response)
    }
    fetchStallData()
  }, [id])

  useEffect(() => {
    const fetchMenuItems = async () => {
      const response = await getMenuItems(id)
      setMenuItems(response)
      console.log('Menu items')
      console.log(response)
    }
    fetchMenuItems()
  }, [id])
  useEffect(() => {
    const fetchReviews = async () => {
      const response = await getStallReview(id)
      setReviews(response)
      console.log('Reviews')
      console.log(response)
    }
    fetchReviews()
  }, [id])
  const renderImageCarousel = () => {
    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={STALL_IMAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carouselImage} />
          )}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.headerGradient}
        />
        <TouchableOpacity
          style={[styles.backButton, { marginTop: insets.top }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.headerActions, { marginTop: insets.top }]}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="share" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="favorite-border" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderStallInfo = () => {
    return (
      <View style={styles.stallInfoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.stallName}>{stallData.name}</Text>
          <MaterialCommunityIcons
            name="check-decagram"
            size={24}
            color="#4CAF50"
          />
        </View>

        <View style={styles.tagsContainer}>
          {stallData.cuisine.split(',').map((cuisine, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{cuisine.trim()}</Text>
            </View>
          ))}
          <View style={styles.tagChip}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.tagText}>{stallData.distance}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stallData.rating}</Text>
            <View style={styles.statRatingStars}>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={14}
                    color={
                      i < Math.floor(stallData.rating) ? '#FFD700' : '#e0e0e0'
                    }
                  />
                ))}
            </View>
            <Text style={styles.statLabel}>
              {stallData.totalReviews} ratings
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stallData.hygiene_score}</Text>
            <View style={styles.statRatingStars}>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={14}
                    color={
                      i < Math.floor(stallData.hygiene_score)
                        ? '#4CAF50'
                        : '#e0e0e0'
                    }
                  />
                ))}
            </View>
            <Text style={styles.statLabel}>Hygiene</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stallData.avgPrice}</Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.hygieneReportButton}
          onPress={() => setHygieneReportModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.hygieneReportButtonText}>
            View Hygiene Report
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'menu' && styles.activeTabText,
            ]}
          >
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reviews' && styles.activeTabText,
            ]}
          >
            Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.activeTabText,
            ]}
          >
            Info
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderMenuCategories = () => {
    const categories = [
      'All',
      'Recommended',
      'Main Course',
      'Bread',
      'Desserts',
    ]

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  const renderMenuItem = ({ item }: { item: (typeof MENU_ITEMS)[0] }) => {
    const processedItem = {
      ...item,
      image: item.image_url,
      isVeg: item.traits?.type?.toLowerCase() === 'vegetarian',
    }
    return (
      <View style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemInfo}>
            <View style={styles.nameAndBadgeRow}>
              <Text style={styles.menuItemName}>{processedItem.name}</Text>
              {processedItem.isVeg ? (
                <View style={styles.vegBadge}>
                  <View style={styles.vegSymbol} />
                </View>
              ) : (
                <View style={styles.nonVegBadge}>
                  <View style={styles.nonVegSymbol} />
                </View>
              )}
            </View>
            <Text style={styles.menuItemPrice}>{processedItem.price}</Text>
            <Text style={styles.menuItemDescription}>
              {processedItem.description}
            </Text>
          </View>
          <View style={styles.menuItemImageContainer}>
            <Image
              source={{ uri: processedItem.image }}
              style={styles.menuItemImage}
            />
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  const renderReviews = () => {
    return (
      <View style={styles.reviewsContainer}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewHeaderText}>Customer Reviews</Text>
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setReviewModalVisible(true)}
          >
            <Text style={styles.addReviewText}>Write a review</Text>
            <MaterialIcons name="edit" size={18} color="#FF5200" />
          </TouchableOpacity>
        </View>

        {REVIEWS.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewerInfo}>
              <Image
                source={{
                  uri:
                    review.user_image ||
                    'https://cdn-icons-png.flaticon.com/512/149/149071.png', // fallback avatar
                }}
                style={styles.reviewerImage}
              />
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>
                  {review.user_name || 'Anonymous'}
                </Text>
                <View style={styles.reviewRatingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialIcons
                      key={star}
                      name="star"
                      size={18}
                      color={star <= review.rating ? '#FFD700' : '#e0e0e0'}
                    />
                  ))}
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>{review.review_text}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllReviews}>
          <Text style={styles.viewAllText}>
            View all {REVIEWS.length} reviews
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FF5200" />
        </TouchableOpacity>
      </View>
    )
  }

  const renderInfoTab = () => {
    return (
      <View style={styles.infoTabContainer}>
        <View style={styles.infoGroup}>
          <Text style={styles.infoGroupTitle}>Address</Text>
          <Text style={styles.infoGroupText}>{stallData.address}</Text>
          <TouchableOpacity style={styles.directionsButton}>
            <MaterialIcons name="directions" size={18} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.infoGroupTitle}>Operating Hours</Text>
          <View style={styles.hoursRow}>
            <Text style={styles.dayText}>Monday - Friday</Text>
            <Text style={styles.hoursText}>9:00 AM - 10:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.dayText}>Saturday - Sunday</Text>
            <Text style={styles.hoursText}>10:00 AM - 11:00 PM</Text>
          </View>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.infoGroupTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactRow}>
            <MaterialIcons name="call" size={18} color="#FF5200" />
            <Text style={styles.contactInfoText}>{stallData.phoneNumber}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderReviewModal = () => {
    const handleSubmitReview = async () => {
      if (!userRating || !reviewText.trim()) {
        alert('Please provide both a rating and feedback.')
        return
      }

      try {
        await createReview(
          id,
          '3c483ba7-56af-419b-8c03-8d576efcda4b',
          userRating,
          reviewText
        )
        alert('Review submitted successfully!')
        setReviewModalVisible(false)
        setUserRating(0)
        setReviewText('')
      } catch (err) {
        alert('Something went wrong while submitting your review.')
      }
    }

    return (
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingInputLabel}>Rate your experience</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setUserRating(star)}
                  >
                    <MaterialIcons
                      name={userRating >= star ? 'star' : 'star-border'}
                      size={36}
                      color={userRating >= star ? '#FFD700' : '#BDBDBD'}
                      style={styles.starInput}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.reviewInputLabel}>Share your feedback</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us about your experience with this stall..."
              multiline={true}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
            >
              <LinearGradient
                colors={['#FF9A5A', '#FF5200']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  const renderHygieneReportModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={hygieneReportModalVisible}
        onRequestClose={() => setHygieneReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hygiene Report</Text>
              <TouchableOpacity
                onPress={() => setHygieneReportModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.hygieneScoreContainer}>
                <View style={styles.hygieneScoreCircle}>
                  <Text style={styles.hygieneScoreText}>
                    {stallData.hygiene_score}
                  </Text>
                  <Text style={styles.hygieneScoreLabel}>out of 5</Text>
                </View>
                <Text style={styles.hygieneScoreTitle}>Cleanliness Score</Text>
              </View>

              <View style={styles.hygieneReportSection}>
                <Text style={styles.hygieneReportSectionTitle}>
                  Cleanliness Metrics
                </Text>

                <View style={styles.hygieneMetricItem}>
                  <View style={styles.hygieneMetricHeader}>
                    <Text style={styles.hygieneMetricName}>Food Handling</Text>
                    <View style={styles.hygieneMetricRating}>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={16}
                            color={i < 4 ? '#4CAF50' : '#e0e0e0'}
                          />
                        ))}
                    </View>
                  </View>
                  <Text style={styles.hygieneMetricDescription}>
                    Food is prepared and served with proper hygiene practices.
                  </Text>
                </View>

                <View style={styles.hygieneMetricItem}>
                  <View style={styles.hygieneMetricHeader}>
                    <Text style={styles.hygieneMetricName}>
                      Personal Hygiene
                    </Text>
                    <View style={styles.hygieneMetricRating}>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={16}
                            color={i < 5 ? '#4CAF50' : '#e0e0e0'}
                          />
                        ))}
                    </View>
                  </View>
                  <Text style={styles.hygieneMetricDescription}>
                    Staff maintains excellent personal hygiene with proper
                    attire.
                  </Text>
                </View>

                <View style={styles.hygieneMetricItem}>
                  <View style={styles.hygieneMetricHeader}>
                    <Text style={styles.hygieneMetricName}>Cooking Area</Text>
                    <View style={styles.hygieneMetricRating}>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={16}
                            color={i < 4 ? '#4CAF50' : '#e0e0e0'}
                          />
                        ))}
                    </View>
                  </View>
                  <Text style={styles.hygieneMetricDescription}>
                    Cooking area is well-maintained and cleaned regularly.
                  </Text>
                </View>

                <View style={styles.hygieneMetricItem}>
                  <View style={styles.hygieneMetricHeader}>
                    <Text style={styles.hygieneMetricName}>Food Storage</Text>
                    <View style={styles.hygieneMetricRating}>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={16}
                            color={i < 4 ? '#4CAF50' : '#e0e0e0'}
                          />
                        ))}
                    </View>
                  </View>
                  <Text style={styles.hygieneMetricDescription}>
                    Ingredients are stored at appropriate temperatures and
                    conditions.
                  </Text>
                </View>
              </View>

              <View style={styles.hygieneReportSection}>
                <Text style={styles.hygieneReportSectionTitle}>
                  Last Inspection
                </Text>
                <Text style={styles.hygieneReportText}>
                  This stall was last inspected on{' '}
                  <Text style={styles.boldText}>May 15, 2023</Text>.
                </Text>
                <Text style={styles.hygieneReportText}>
                  This report is based on inspections conducted by the Food
                  Safety Authority and customer feedback.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setHygieneReportModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          styles.animatedHeader,
          { opacity: headerOpacity, paddingTop: insets.top },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {stallData.name}
        </Text>
        <TouchableOpacity style={styles.headerShareButton}>
          <MaterialIcons name="share" size={24} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderImageCarousel()}
        {renderStallInfo()}
        {renderTabs()}

        {activeTab === 'menu' && (
          <>
            {renderMenuCategories()}
            <View style={styles.menuList}>
              {MENU_ITEMS.map((item) => renderMenuItem({ item }))}
            </View>
          </>
        )}

        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'info' && renderInfoTab()}
      </Animated.ScrollView>

      <TouchableOpacity style={styles.orderButton}>
        <LinearGradient
          colors={['#FF9A5A', '#FF5200']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.orderGradient}
        >
          <Text style={styles.orderButtonText}>Order Online</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {renderReviewModal()}
      {renderHygieneReportModal()}
    </View>
  )
}

export default StallPage
