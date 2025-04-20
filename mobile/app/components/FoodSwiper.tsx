import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native'
import { TinderCard } from 'rn-tinder-card'
import { LinearGradient } from 'expo-linear-gradient'
import { FontAwesome5 } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')
const CARD_WIDTH = width * 0.9
const CARD_HEIGHT = height * 0.6

// Sample food data - replace with your actual data
const FOOD_DATA = [
  {
    id: '1',
    name: 'Chicken Rice',
    image:
      'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Traditional Hainanese chicken rice',
    cuisine: 'Chinese',
  },
  {
    id: '2',
    name: 'Laksa',
    image:
      'https://images.unsplash.com/photo-1570275239925-4af0aa89617b?q=80&w=2071',
    description: 'Spicy coconut noodle soup',
    cuisine: 'Peranakan',
  },
  {
    id: '3',
    name: 'Char Kway Teow',
    image:
      'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1974',
    description: 'Stir-fried rice noodles with prawn and Chinese sausage',
    cuisine: 'Chinese',
  },
  {
    id: '4',
    name: 'Roti Prata',
    image:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071',
    description: 'Crispy flatbread served with curry',
    cuisine: 'Indian',
  },
  {
    id: '5',
    name: 'Nasi Lemak',
    image:
      'https://images.unsplash.com/photo-1626409595896-30adce1f769a?q=80&w=2070',
    description: 'Fragrant rice dish cooked in coconut milk',
    cuisine: 'Malay',
  },
  {
    id: '6',
    name: 'Satay',
    image:
      'https://images.unsplash.com/photo-1529563021893-cc68e7419ca3?q=80&w=2070',
    description: 'Grilled meat skewers with peanut sauce',
    cuisine: 'Malay/Indonesian',
  },
  {
    id: '7',
    name: 'Chili Crab',
    image:
      'https://images.unsplash.com/photo-1623653407811-f3b1a8149382?q=80&w=2070',
    description: 'Crab in a spicy, sweet and savory tomato-based sauce',
    cuisine: 'Singaporean',
  },
  {
    id: '8',
    name: 'Hokkien Mee',
    image:
      'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Stir-fried noodles with prawns, squid, and pork',
    cuisine: 'Chinese',
  },
  {
    id: '9',
    name: 'Carrot Cake (Chai Tow Kway)',
    image:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=2070',
    description: 'Fried radish cake with eggs and preserved radish',
    cuisine: 'Chinese',
  },
  {
    id: '10',
    name: 'Fish Head Curry',
    image:
      'https://images.unsplash.com/photo-1613844237766-e49adcb45ec7?q=80&w=2077',
    description: 'Fish head cooked in curry with vegetables',
    cuisine: 'Indian-Singaporean',
  },
]

// Explicitly set component displayName to fix the error
const FoodSwiper = ({
  onFinish,
}: {
  onFinish?: (selectedFoods: any[]) => void
}) => {
  const [selectedFoods, setSelectedFoods] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentIndex / FOOD_DATA.length) * 100,
      duration: 300,
      useNativeDriver: false, // Layout animation cannot use native driver
    }).start()
  }, [currentIndex])

  const handleSwipeRight = (index: number) => {
    // Animation for successful swipe
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    
    // Add to selected foods
    setSelectedFoods([...selectedFoods, FOOD_DATA[index]])

    // Check if we've reached the end
    if (index >= FOOD_DATA.length - 1) {
      handleFinishSwiping()
    } else {
      setCurrentIndex(index + 1)
    }
  }

  const handleSwipeLeft = (index: number) => {
    // Animation for rejection swipe
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    
    // Check if we've reached the end
    if (index >= FOOD_DATA.length - 1) {
      handleFinishSwiping()
    } else {
      setCurrentIndex(index + 1)
    }
  }

  const handleFinishSwiping = () => {
    setIsFinished(true)
    if (onFinish) {
      onFinish(selectedFoods)
    }
  }

  // Overlay components for swipe directions
  const OverlayRight = () => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'rgba(76, 217, 100, 0.8)',
            right: 20,
            transform: [{ rotate: '10deg' }],
          },
        ]}
      >
        <FontAwesome5 name="heart" size={24} color="white" />
        <Text style={styles.overlayLabelText}>YUM!</Text>
      </View>
    )
  }

  const OverlayLeft = () => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'rgba(255, 59, 48, 0.8)',
            left: 20,
            transform: [{ rotate: '-10deg' }],
          },
        ]}
      >
        <FontAwesome5 name="times-circle" size={24} color="white" />
        <Text style={styles.overlayLabelText}>SKIP</Text>
      </View>
    )
  }

  const renderFoodCard = (item: any, index: number) => {
    return (
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]} 
        key={item.id}
      >
        <TinderCard
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
          OverlayLabelRight={OverlayRight}
          OverlayLabelLeft={OverlayLeft}
          cardStyle={styles.card}
          onSwipedRight={() => handleSwipeRight(index)}
          onSwipedLeft={() => handleSwipeLeft(index)}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.cuisineTag}>
              <FontAwesome5 name="utensils" size={12} color="white" />
              <Text style={styles.cuisineText}>{item.cuisine}</Text>
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </TinderCard>
      </Animated.View>
    )
  }

  if (isFinished) {
    return (
      <View style={styles.finishedContainer}>
        <Text style={styles.finishedTitle}>Thanks for your selections!</Text>
        <Text style={styles.finishedSubtitle}>
          We'll use your preferences to find the perfect stalls for you.
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) 
            }
          ]}
        />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          <Text style={styles.currentIndexText}>{currentIndex + 1}</Text>/{FOOD_DATA.length}
        </Text>
        <Text style={styles.instructionText}>
          Swipe right on foods you like!
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {FOOD_DATA.map((item, index) => {
          // Only render the current card
          if (index === currentIndex) {
            return renderFoodCard(item, index)
          }
          return null
        })}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dislikeButton]}
          onPress={() => handleSwipeLeft(currentIndex)}
        >
          <FontAwesome5 name="times" size={26} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => handleSwipeRight(currentIndex)}
        >
          <FontAwesome5 name="heart" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// Explicitly set displayName to fix the error
FoodSwiper.displayName = 'FoodSwiper'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginHorizontal: 20,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF5200',
    borderRadius: 3,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  currentIndexText: {
    fontWeight: 'bold',
    color: '#FF5200',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cuisineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 0, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  cuisineText: {
    marginLeft: 6,
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlayLabelContainer: {
    position: 'absolute',
    top: 50,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  overlayLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#FF3B30',
  },
  likeButton: {
    backgroundColor: '#4CD964',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finishedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})

export default FoodSwiper
