import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { TinderCard } from 'rn-tinder-card';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

// Sample food data - replace with your actual data
const FOOD_DATA = [
  {
    id: '1',
    name: 'Chicken Rice',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Traditional Hainanese chicken rice',
  },
  {
    id: '2',
    name: 'Laksa',
    image: 'https://images.unsplash.com/photo-1570275239925-4af0aa89617b?q=80&w=2071',
    description: 'Spicy coconut noodle soup',
  },
  {
    id: '3',
    name: 'Char Kway Teow',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1974',
    description: 'Stir-fried rice noodles with prawn and Chinese sausage',
  },
  {
    id: '4',
    name: 'Roti Prata',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071',
    description: 'Crispy flatbread served with curry',
  },
  {
    id: '5',
    name: 'Nasi Lemak',
    image: 'https://images.unsplash.com/photo-1626409595896-30adce1f769a?q=80&w=2070',
    description: 'Fragrant rice dish cooked in coconut milk',
  },
  {
    id: '6',
    name: 'Satay',
    image: 'https://images.unsplash.com/photo-1529563021893-cc68e7419ca3?q=80&w=2070',
    description: 'Grilled meat skewers with peanut sauce',
  },
  {
    id: '7',
    name: 'Chili Crab',
    image: 'https://images.unsplash.com/photo-1623653407811-f3b1a8149382?q=80&w=2070',
    description: 'Crab in a spicy, sweet and savory tomato-based sauce',
  },
  {
    id: '8',
    name: 'Hokkien Mee',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=2070',
    description: 'Stir-fried noodles with prawns, squid, and pork',
  },
  {
    id: '9',
    name: 'Carrot Cake (Chai Tow Kway)',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=2070',
    description: 'Fried radish cake with eggs and preserved radish',
  },
  {
    id: '10',
    name: 'Fish Head Curry',
    image: 'https://images.unsplash.com/photo-1613844237766-e49adcb45ec7?q=80&w=2077',
    description: 'Fish head cooked in curry with vegetables',
  },
];

// Explicitly set component displayName to fix the error
const FoodSwiper = ({ onFinish }: { onFinish?: (selectedFoods: any[]) => void }) => {
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleSwipeRight = (index: number) => {
    // Add to selected foods
    setSelectedFoods([...selectedFoods, FOOD_DATA[index]]);
    
    // Check if we've reached the end
    if (index >= FOOD_DATA.length - 1) {
      handleFinishSwiping();
    } else {
      setCurrentIndex(index + 1);
    }
  };

  const handleSwipeLeft = (index: number) => {
    // Check if we've reached the end
    if (index >= FOOD_DATA.length - 1) {
      handleFinishSwiping();
    } else {
      setCurrentIndex(index + 1);
    }
  };

  const handleFinishSwiping = () => {
    setIsFinished(true);
    if (onFinish) {
      onFinish(selectedFoods);
    }
  };

  // Overlay components for swipe directions
  const OverlayRight = () => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'rgba(76, 217, 100, 0.8)',
          },
        ]}
      >
        <Text style={styles.overlayLabelText}>LIKE</Text>
      </View>
    );
  };

  const OverlayLeft = () => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: 'rgba(255, 59, 48, 0.8)',
          },
        ]}
      >
        <Text style={styles.overlayLabelText}>NOPE</Text>
      </View>
    );
  };

  const renderFoodCard = (item: any, index: number) => {
    return (
      <View style={styles.cardContainer} key={item.id}>
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
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </TinderCard>
      </View>
    );
  };

  if (isFinished) {
    return (
      <View style={styles.finishedContainer}>
        <Text style={styles.finishedTitle}>Thanks for your selections!</Text>
        <Text style={styles.finishedSubtitle}>
          We'll use your preferences to find the perfect stalls for you.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {currentIndex + 1}/{FOOD_DATA.length}
        </Text>
      </View>
      
      <View style={styles.cardsContainer}>
        {FOOD_DATA.map((item, index) => {
          // Only render the current card
          if (index === currentIndex) {
            return renderFoodCard(item, index);
          }
          return null;
        })}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.dislikeButton]}
          onPress={() => handleSwipeLeft(currentIndex)}
        >
          <FontAwesome name="times" size={32} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.likeButton]}
          onPress={() => handleSwipeRight(currentIndex)}
        >
          <FontAwesome name="heart" size={32} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Explicitly set displayName to fix the error
FoodSwiper.displayName = 'FoodSwiper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    padding: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    padding: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#f0f0f0',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  overlayLabelContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayLabelText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CD964',
  },
  dislikeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FoodSwiper; 