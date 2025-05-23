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
// import { ActivityIndicator } from 'react-native'
const { width } = Dimensions.get('window')
import {
  getStallReview,
  getSingleStall,
  createReview,
} from '../../lib/routes/user.js'
import { getMenuItems } from '../../lib/routes/vendor.js'
import HygieneReportModal from '../components/HygieneReportModal'
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

// Sample data for random hygiene reports
const GOOD_PRACTICES = [
  "Regular cleaning schedule followed",
  "Proper food storage practices",
  "Staff follows hygiene protocols",
  "Fresh ingredients used daily",
  "Food preparation areas kept clean",
  "Appropriate use of gloves during food handling",
  "Regular handwashing observed",
  "Proper waste disposal methods",
  "Temperature control for perishable items",
  "Clean uniforms and appearance of staff",
  "Separate utensils for different food items",
  "Regular pest control measures"
]

const ISSUES_FOUND = [
  "Some equipment needs maintenance",
  "Minor cleaning issues in corners",
  "Storage area needs better organization",
  "Refrigeration temperature slightly high",
  "Handwashing station needs supplies",
  "Food labels missing on some containers",
  "Waste bins need more frequent emptying",
  "Some food stored at improper heights",
  "Water drainage issues in washing area",
  "Staff training records incomplete",
  "Some utensils showing signs of wear"
]

const RECOMMENDATIONS = [
  "Implement daily cleaning checklist",
  "Schedule regular deep cleaning",
  "Update staff training on hygiene practices",
  "Improve storage area organization",
  "Install better temperature monitoring system",
  "Replace worn-out equipment",
  "Add more frequent cleaning cycles",
  "Develop better inventory rotation system",
  "Install additional handwashing stations",
  "Create visual reminders for staff hygiene protocols",
  "Conduct monthly hygiene training refreshers",
  "Improve waste management procedures"
]

const OVERALL_SUMMARIES = [
  "Overall, the stall maintains good hygiene standards with some minor improvements needed.",
  "This food stall demonstrates strong hygiene practices, but a few areas could use attention to reach excellent standards.",
  "The vendor shows commitment to cleanliness with well-maintained equipment and appropriate food handling techniques.",
  "While the stall meets basic hygiene standards, there are several areas where improvements would significantly enhance food safety.",
  "Hygiene practices are generally good, though certain procedures could be streamlined for better efficiency and safety.",
  "This stall shows above-average cleanliness, with consistent application of food safety protocols.",
  "The vendor maintains a clean environment with good practices, though some inconsistencies were observed during busy periods.",
  "Food handling and storage show careful attention to hygiene standards, with only minor improvements recommended."
]

// Function to generate random opening hours
const generateRandomOpeningHours = () => {
  const openingHourOptions = [8, 9, 10, 11]
  const closingHourOptions = [19, 20, 21, 22, 23]
  
  const openingHour = openingHourOptions[Math.floor(Math.random() * openingHourOptions.length)]
  const closingHour = closingHourOptions[Math.floor(Math.random() * closingHourOptions.length)]
  
  const openingTime = `${openingHour}:00 AM - ${closingHour % 12 || 12}:00 PM`
  return openingTime
}

// Function to generate random average price
const generateRandomAvgPrice = () => {
  const prices = ['₹100', '₹150', '₹180', '₹200', '₹250', '₹120', '₹160', '₹220']
  return `${prices[Math.floor(Math.random() * prices.length)]} for one`
}

// Function to generate random hygiene score
const generateRandomHygieneScore = () => {
  // Generate a score between 2.5 and 5.0 with one decimal place
  return Math.round((Math.random() * 2.5 + 2.5) * 10) / 10
}

// Function to generate random hygiene report
const generateRandomHygieneReport = () => {
  // Select 3-5 random items from each category
  const getRandomItems = (array: string[], min = 3, max = 5) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
  
  return {
    good_practices: getRandomItems(GOOD_PRACTICES),
    issues_found: getRandomItems(ISSUES_FOUND, 2, 4),
    recommendations: getRandomItems(RECOMMENDATIONS, 2, 4),
    overall_summary: OVERALL_SUMMARIES[Math.floor(Math.random() * OVERALL_SUMMARIES.length)]
  }
}

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
  miniHygieneStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllButtonText: {
    color: '#FF5200',
    marginRight: 4,
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
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  summaryIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  ratingAlertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  ratingAlertIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  ratingAlertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  viewReportText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRatingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  averageRatingStars: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  averageRatingLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recommendedItem: {
    width: width / 2 - 24,
    marginLeft: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedItemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recommendedItemContent: {
    padding: 12,
  },
  recommendedItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5200',
    marginVertical: 4,
  },
  recommendedItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recommendedItemsContainer: {
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
  },
  recommendedItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recommendedItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
})

const StallPage = () => {
  const [MENU_ITEMS, setMenuItems] = useState([
    {
      id: '1',
      name: 'Chicken Biryani',
      description: 'Flavorful rice dish with spiced chicken',
      price: '₹180',
      image: 'https://tse4.mm.bing.net/th?id=OIP.Iq3Ly_QaB394b0G5cmPgrQHaE8&pid=Api&P=0&h=180',
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
  const [summary, setSummary] = useState('')
  const [rating, setRating] = useState('')
  const [ratingScore, setRatingScore] = useState(0)
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
  const [hygieneReportData, setHygieneReportData] = useState(generateRandomHygieneReport())
  const [stallData, setStallData] = useState<StallData>({
    name: 'Street Corner Delights',
    rating: 4.5,
    totalReviews: 245,
    cuisine: 'North Indian, Chinese',
    address: '123 Food Street, Mumbai',
    distance: '1.2 km',
    openingTime: generateRandomOpeningHours(),
    phoneNumber: '+91 98765 43210',
    hygieneScore: generateRandomHygieneScore(),
    avgPrice: generateRandomAvgPrice(),
  })
  const [stallImages, setStallImages] = useState<string[]>(STALL_IMAGES)
  const headerHeight = 250
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

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

  // Hard-coded data for different stalls
  const hardCodedStallData = {
    '1': {
      totalReviews: 342,
      distance: '0.8 km',
      phoneNumber: '+91 87654 32109'
    },
    '2': {
      totalReviews: 187,
      distance: '1.5 km',
      phoneNumber: '+91 76543 21098'
    },
    '3': {
      totalReviews: 521,
      distance: '0.6 km',
      phoneNumber: '+91 65432 10987'
    },
    '4': {
      totalReviews: 93,
      distance: '2.1 km',
      phoneNumber: '+91 54321 09876'
    },
    '5': {
      totalReviews: 267,
      distance: '1.7 km',
      phoneNumber: '+91 43210 98765'
    }
  }

  // Hard-coded menu items for each stall
  const hardCodedMenuItems = {
    '1': [
      {
        id: '1',
        name: 'Chicken Biryani Special',
        description: 'Our signature rice dish with perfectly spiced chicken',
        price: '₹220',
        image: 'https://source.unsplash.com/random/300x200/?biryani,1',
        isVeg: false,
        isRecommended: true,
        rating: 4.9,
      },
      {
        id: '2',
        name: 'Butter Paneer Masala',
        description: 'Rich and creamy paneer curry with aromatic spices',
        price: '₹180',
        image: 'https://source.unsplash.com/random/300x200/?paneer,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.8,
      },
      {
        id: '3',
        name: 'Garlic Naan',
        description: 'Soft bread with garlic flavor, perfect with curries',
        price: '₹50',
        image: 'https://source.unsplash.com/random/300x200/?naan,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.6,
      },
      {
        id: '4',
        name: 'Dal Tadka',
        description: 'Yellow lentils tempered with cumin and garlic',
        price: '₹130',
        image: 'https://source.unsplash.com/random/300x200/?dal,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.5,
      },
      {
        id: '5',
        name: 'Kulfi Falooda',
        description: 'Traditional Indian ice cream with vermicelli and rose syrup',
        price: '₹90',
        image: 'https://source.unsplash.com/random/300x200/?icecream,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.7,
      },
    ],
    '2': [
      {
        id: '1',
        name: 'South Indian Thali',
        description: 'Complete meal with variety of South Indian dishes',
        price: '₹250',
        image: 'https://source.unsplash.com/random/300x200/?thali,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.8,
      },
      {
        id: '2',
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato mixture',
        price: '₹120',
        image: 'https://source.unsplash.com/random/300x200/?dosa,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.9,
      },
      {
        id: '3',
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with lentil soup and chutney',
        price: '₹80',
        image: 'https://source.unsplash.com/random/300x200/?idli,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.7,
      },
      {
        id: '4',
        name: 'Medu Vada',
        description: 'Crispy savory doughnut made from urad dal',
        price: '₹60',
        image: 'https://source.unsplash.com/random/300x200/?vada,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.5,
      },
      {
        id: '5',
        name: 'Filter Coffee',
        description: 'Traditional South Indian coffee with chicory',
        price: '₹40',
        image: 'https://source.unsplash.com/random/300x200/?coffee,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.9,
      },
    ],
    '3': [
      {
        id: '1',
        name: 'Tandoori Chicken',
        description: 'Chicken marinated in yogurt and spices, cooked in tandoor',
        price: '₹280',
        image: 'https://source.unsplash.com/random/300x200/?tandoorichicken,1',
        isVeg: false,
        isRecommended: true,
        rating: 4.9,
      },
      {
        id: '2',
        name: 'Seekh Kebab',
        description: 'Minced meat skewers with herbs and spices',
        price: '₹220',
        image: 'https://source.unsplash.com/random/300x200/?kebab,1',
        isVeg: false,
        isRecommended: true,
        rating: 4.8,
      },
      {
        id: '3',
        name: 'Laccha Paratha',
        description: 'Multi-layered flaky Indian bread',
        price: '₹60',
        image: 'https://source.unsplash.com/random/300x200/?paratha,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.6,
      },
      {
        id: '4',
        name: 'Malai Kofta',
        description: 'Potato and paneer dumplings in a creamy sauce',
        price: '₹180',
        image: 'https://source.unsplash.com/random/300x200/?kofta,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.7,
      },
      {
        id: '5',
        name: 'Shahi Tukda',
        description: 'Royal bread pudding with saffron and nuts',
        price: '₹120',
        image: 'https://source.unsplash.com/random/300x200/?dessert,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.8,
      },
    ],
    '4': [
      {
        id: '1',
        name: 'Hakka Noodles',
        description: 'Indo-Chinese stir-fried noodles with vegetables',
        price: '₹150',
        image: 'https://source.unsplash.com/random/300x200/?noodles,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.7,
      },
      {
        id: '2',
        name: 'Chilli Chicken',
        description: 'Spicy chicken stir-fried with bell peppers and onions',
        price: '₹200',
        image: 'https://source.unsplash.com/random/300x200/?chillichicken,1',
        isVeg: false,
        isRecommended: true,
        rating: 4.8,
      },
      {
        id: '3',
        name: 'Manchurian',
        description: 'Fried vegetable balls in spicy and tangy sauce',
        price: '₹160',
        image: 'https://source.unsplash.com/random/300x200/?manchurian,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.6,
      },
      {
        id: '4',
        name: 'Fried Rice',
        description: 'Stir-fried rice with vegetables and soy sauce',
        price: '₹140',
        image: 'https://source.unsplash.com/random/300x200/?friedrice,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.5,
      },
      {
        id: '5',
        name: 'Honey Chilli Potato',
        description: 'Crispy potato fingers tossed in sweet and spicy sauce',
        price: '₹110',
        image: 'https://source.unsplash.com/random/300x200/?potato,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.9,
      },
    ],
    '5': [
      {
        id: '1',
        name: 'Pav Bhaji',
        description: 'Spiced mashed vegetables served with buttered buns',
        price: '₹120',
        image: 'https://source.unsplash.com/random/300x200/?pavbhaji,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.8,
      },
      {
        id: '2',
        name: 'Vada Pav',
        description: 'Spicy potato fritter in a bun with chutneys',
        price: '₹40',
        image: 'https://source.unsplash.com/random/300x200/?vadapav,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.9,
      },
      {
        id: '3',
        name: 'Misal Pav',
        description: 'Spicy sprouted lentil curry with bread rolls',
        price: '₹90',
        image: 'https://source.unsplash.com/random/300x200/?misal,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.7,
      },
      {
        id: '4',
        name: 'Kanda Bhaji',
        description: 'Crispy onion fritters',
        price: '₹60',
        image: 'https://source.unsplash.com/random/300x200/?fritters,1',
        isVeg: true,
        isRecommended: false,
        rating: 4.6,
      },
      {
        id: '5',
        name: 'Ragda Pattice',
        description: 'Potato patties topped with white pea curry and chutneys',
        price: '₹80',
        image: 'https://source.unsplash.com/random/300x200/?pattice,1',
        isVeg: true,
        isRecommended: true,
        rating: 4.8,
      },
    ],
  }

  useEffect(() => {
    const fetchStallData = async () => {
      try {
        const response = await getSingleStall(id)
        setIsLoading(false)
        console.log('Hello')
        console.log(response)
        
        // Apply random opening time and price to the stall data
        const updatedResponse = {
          ...response,
          openingTime: generateRandomOpeningHours(),
          avgPrice: generateRandomAvgPrice(),
          // Generate a random hygiene score if not provided
          hygieneScore: response.hygieneScore || generateRandomHygieneScore()
        }
        
        // Apply hard-coded values if they exist for this stall ID
        if (hardCodedStallData[id as keyof typeof hardCodedStallData]) {
          const hardCodedData = hardCodedStallData[id as keyof typeof hardCodedStallData];
          updatedResponse.totalReviews = hardCodedData.totalReviews;
          updatedResponse.distance = hardCodedData.distance;
          updatedResponse.phoneNumber = hardCodedData.phoneNumber;
        }
        
        setStallData(updatedResponse)
        // Generate random hygiene report data when stall data is loaded
        setHygieneReportData(generateRandomHygieneReport())
        
        // Try to get better images if they exist
        if (response.image_url) {
          setStallImages([response.image_url, ...STALL_IMAGES.slice(0, 3)])
        }
      } catch (err) {
        console.error('Error fetching stall data:', err)
        setIsLoading(false)
      }
    }
    fetchStallData()
  }, [id])

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Try to get menu items from API first
        const response = await getMenuItems(id)
        
        // Override with hardcoded menu items if available for this stall ID
        if (hardCodedMenuItems[id as keyof typeof hardCodedMenuItems]) {
          console.log('Using hardcoded menu items for stall ID:', id)
          setMenuItems(hardCodedMenuItems[id as keyof typeof hardCodedMenuItems])
        } else {
          console.log('Using API menu items')
          setMenuItems(response)
        }
      } catch (err) {
        console.error('Error fetching menu items:', err)
        // Fallback to hardcoded menu items in case of error
        if (hardCodedMenuItems[id as keyof typeof hardCodedMenuItems]) {
          setMenuItems(hardCodedMenuItems[id as keyof typeof hardCodedMenuItems])
        }
      }
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
  const FLASK_ENDPOINT = `https://cce4-103-124-122-210.ngrok-free.app/analyze/${id}`
  const GEMINI_API_KEY = 'AIzaSyBHCKPaZNHcgEic4J8lr_rtRC6zhdaB2Zk' // replace with actual key

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Step 1: Fetch from Flask
        const flaskRes = await fetch(FLASK_ENDPOINT)
        const flaskData = await flaskRes.json()

        const summaries = flaskData.review_summary.summaries.map(
          (item: any) => item.summary
        )
        const joinedSummaries = summaries.join('\n\n')
        setSummary(joinedSummaries)

        // Extract average rating from Flask response
        if (flaskData.review_summary.average_rating) {
          setRatingScore(flaskData.review_summary.average_rating)
        }

        // Step 2: Send to Gemini (remaining code stays the same)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Given these review summaries:\n\n${joinedSummaries}\n\nCan you highlight any critical issues related to water quality, hygiene, or service problems? Keep it short.`,
                    },
                  ],
                },
              ],
            }),
          }
        )

        const geminiData = await geminiRes.json()
        const criticalSummary =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

        setRating(criticalSummary.trim())
      } catch (error) {
        console.error('Error:', error)
        setRating('Unable to fetch critical review.')
        setSummary('Could not load review summaries.')
      }
    }

    if (id) fetchSummary()
  }, [id])

  const renderSummaryAndRating = () => {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>AI-Generated Review Summary</Text>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#FF5200"
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            {/* Add the numeric star rating display */}
            {ratingScore > 0 && (
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageRatingValue}>
                  {ratingScore.toFixed(1)}
                </Text>
                <View style={styles.averageRatingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialIcons
                      key={star}
                      name="star"
                      size={18}
                      color={
                        star <= Math.round(ratingScore) ? '#FFD700' : '#e0e0e0'
                      }
                    />
                  ))}
                </View>
                <Text style={styles.averageRatingLabel}>Average Rating</Text>
              </View>
            )}

            <View style={styles.summaryBox}>
              <MaterialIcons
                name="rate-review"
                size={20}
                color="#FF5200"
                style={styles.summaryIcon}
              />
              <Text style={styles.summaryText}>
                {summary || 'No review summary available'}
              </Text>
            </View>

            {rating && (
              <View style={styles.ratingAlertBox}>
                <MaterialIcons
                  name="warning"
                  size={20}
                  color="#FF9800"
                  style={styles.ratingAlertIcon}
                />
                <Text style={styles.ratingAlertText}>{rating}</Text>
              </View>
            )}
          </>
        )}
      </View>
    )
  }
  const renderImageCarousel = () => {
    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={stallImages}
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
    // Get a safe hygiene score for display
    const safeHygieneScore = typeof stallData.hygieneScore === 'number' && !isNaN(stallData.hygieneScore) 
      ? stallData.hygieneScore 
      : 4.0;
      
    return (
      <View style={styles.stallInfoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.stallName}>{stallData.name}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: 'bold' }}>
              Verified
            </Text>
          </View>
        </View>

        <Text style={styles.cuisineText}>{stallData.cuisine}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={18} color="#FFC107" />
            <Text style={styles.ratingText}>{stallData.rating}</Text>
            <Text style={styles.ratingCount}>
              ({stallData.totalReviews} reviews)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.hygieneBadge}
            onPress={() => setHygieneReportModalVisible(true)}
          >
            <MaterialIcons name="cleaning-services" size={16} color="#4CAF50" />
            <Text style={styles.hygieneText}>{safeHygieneScore.toFixed(1)}/5</Text>
            <View style={styles.miniHygieneStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name="star"
                  size={10}
                  color={star <= Math.round(safeHygieneScore) ? '#4CAF50' : '#e0e0e0'}
                  style={{ marginHorizontal: 1 }}
                />
              ))}
            </View>
            <Text style={styles.viewReportText}>View Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={16} color="#FF5200" />
            <Text style={styles.infoText}>{stallData.distance}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.infoText}>{stallData.openingTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="attach-money" size={16} color="#666" />
            <Text style={styles.infoText}>{stallData.avgPrice}</Text>
          </View>
        </View>

        <Text style={{ color: '#666', marginBottom: 12 }}>
          {stallData.address}
        </Text>

        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="directions" size={16} color="#3498db" />
            <Text style={styles.contactButtonText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="phone" size={16} color="#3498db" />
            <Text style={styles.contactButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="share" size={16} color="#3498db" />
            <Text style={styles.contactButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
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
      image: item.image,
      isVeg: item.isVeg=== true,
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
          </View>
        </View>
      </View>
    )
  }

  // To add your custom image links for recommended dishes:
  // 1. Replace the 'image' property in the MENU_ITEMS array with your desired URLs
  // 2. Or modify the source={{ uri: item.image }} in renderRecommendedMenuItem below
  const renderRecommendedMenuItem = ({ item }: { item: (typeof MENU_ITEMS)[0] }) => {
    return (
      <View style={styles.recommendedItem}>
        <Image 
          source={{ 
            uri: item.image 
          }} 
          style={styles.recommendedItemImage} 
        />
        <View style={styles.recommendedItemContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.isVeg ? (
              <View style={styles.vegBadge}>
                <View style={styles.vegSymbol} />
              </View>
            ) : (
              <View style={styles.nonVegBadge}>
                <View style={styles.nonVegSymbol} />
              </View>
            )}
            <Text style={styles.recommendedItemName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={styles.recommendedItemPrice}>{item.price}</Text>
          <View style={styles.recommendedItemRating}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={{ fontSize: 14, marginLeft: 4 }}>{item.rating}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderRecommendedMenuItems = () => {
    const recommendedItems = MENU_ITEMS.filter(item => item.isRecommended === true);
    
    if (recommendedItems.length === 0) return null;
    
    return (
      <View style={styles.recommendedItemsContainer}>
        <View style={styles.recommendedItemsHeader}>
          <Text style={styles.recommendedItemsTitle}>Recommended Dishes</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.seeAllButtonText}>View All</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FF5200" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={recommendedItems}
          renderItem={renderRecommendedMenuItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        />
      </View>
    );
  }

  // Add this component to the reviews tab
  const renderReviews = () => {
    return (
      <View style={styles.reviewsContainer}>
        {/* Add the summary and rating component at the top */}
        {renderSummaryAndRating()}

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
                    review.userImage ||
                    'https://cdn-icons-png.flaticon.com/512/149/149071.png', // fallback avatar
                }}
                style={styles.reviewerImage}
              />
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>
                  {review.userName || 'Anonymous'}
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
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllReviews}>
          <Text style={styles.seeAllButtonText}>
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
    // Get a safe hygiene score for the modal
    const safeHygieneScore = typeof stallData.hygieneScore === 'number' && !isNaN(stallData.hygieneScore) 
      ? stallData.hygieneScore 
      : 4.0;
      
    return (
      <HygieneReportModal
        visible={hygieneReportModalVisible}
        onClose={() => setHygieneReportModalVisible(false)}
        hygieneScore={safeHygieneScore}
        reportData={hygieneReportData}
      />
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
            {renderRecommendedMenuItems()}
            {renderMenuCategories()}
            <View style={styles.menuList}>
              {MENU_ITEMS.map((item) => renderMenuItem({ item }))}
            </View>
          </>
        )}

        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'info' && renderInfoTab()}
      </Animated.ScrollView>

     

      {renderReviewModal()}
      {renderHygieneReportModal()}
    </View>
  )
}

export default StallPage
