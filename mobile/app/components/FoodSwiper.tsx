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
// Import all images at the top of your file
const ramen = require('../../assets/images/ramen.png');
const bakery = require('../../assets/images/bakery.png');
const coffee = require('../../assets/images/coffee.png');
const thali = require('../../assets/images/thali.png');
const pasta = require('../../assets/images/pasta.png');
const foodtruck = require('../../assets/images/foodtruck.png');
const sushi = require('../../assets/images/sushi.png');
const pani = require('../../assets/images/pani.png');
const icecream = require('../../assets/images/icecream.png');
const shawarma = require('../../assets/images/shawarma.png');


// import bakery from '../../assets/images/bakery.png';
// import coffee from '../../assets/images/coffee.png';
// import thali from '../../assets/images/thali.png';
// import pasta from '../../assets/images/pasta.png';
// import foodtruck from '../../assets/images/foodtruck.png';
// import sushi from '../../assets/images/sushi.png';
// import pani from '../../assets/images/pani.png';
// import icecream from '../../assets/images/icecream.png';
// import shawarma from '../../assets/images/shawarma.png';
const { width, height } = Dimensions.get('window')
const CARD_WIDTH = width * 0.9
const CARD_HEIGHT = height * 0.6




// Sample food data - replace with your actual data
const FOOD_DATA = [
  {
    id: '1',
    name: 'Kokoshi Ramen',
    image: 'https://images.pexels.com/photos/17593640/pexels-photo-17593640/free-photo-of-soup-with-egg.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Japanese noodle soup with broth and toppings.',
    cuisine: 'Japanese',
  },
  {
    id: '2',
    name: 'Bliss Bakes',
    image: 'https://images.pexels.com/photos/1674064/pexels-photo-1674064.jpeg?auto=compress&cs=tinysrgb&w=600', 
    description: 'Sweet baked dessert, often decorated.',
    cuisine: 'Bakery',
  },
  {
    id: '3',
    name: 'Chauhan Coffee Stall',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Brewed beverage made from roasted coffee beans.',
    cuisine: 'Cafe',
  },
  {
    id: '4',
    name: 'Paaji Da Dhaba',
    image: 'https://images.pexels.com/photos/8148149/pexels-photo-8148149.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Crispy flatbread served with curry',
    cuisine: 'North Indian',
  },
  {
    id: '5',
    name: 'Si Nonna',
    image: 'https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Italian pasta dish with various sauces',
    cuisine: 'Italian',
  },
  {
    id: '6',
    name: 'Pablo Taco Truck',
    image: 'https://images.pexels.com/photos/4609255/pexels-photo-4609255.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Mexican tacos with various fillings',
    cuisine: 'Mexican',
  },
  {
    id: '7',
    name: 'Yang Chow Sushi Bar',
    image: 'https://images.pexels.com/photos/1028427/pexels-photo-1028427.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Japanese sushi with fresh fish and rice',
    cuisine: 'Japanese',
  },
  {
    id: '8',
    name: 'Ashoks Pani Puri Stall',
    image: 'https://images.pexels.com/photos/13041629/pexels-photo-13041629.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Crispy puris filled with spicy water and fillings',
    cuisine: 'Indian',
  },
  {
    id: '9',
    name: 'Chandrakanth Ice Cream Parlour',
    image: 'https://images.pexels.com/photos/1346341/pexels-photo-1346341.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Frozen dessert made from cream and flavors',
    cuisine: 'Dessert',
  },
  {
    id: '10',
    name: 'Saleems Shawarma Corner',
    image: 'https://images.pexels.com/photos/5602502/pexels-photo-5602502.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Middle Eastern wrap with meat and vegetables',
    cuisine: 'Middle Eastern',
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
