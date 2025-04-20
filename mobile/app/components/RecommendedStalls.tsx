import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STALL_CARD_WIDTH = width * 0.9;

type StallItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  cuisine: string;
  distance: string;
  deliveryTime: string;
  rating: number;
  hygieneScore: string;
  verified: boolean;
  tags: string[];
};

interface RecommendedStallsProps {
  stalls: StallItem[];
  onBackToSwiper: () => void;
}

const RecommendedStalls = ({ stalls, onBackToSwiper }: RecommendedStallsProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesome5 key={i} name="star" size={14} color="#FFD700" style={{marginRight: 2}} />);
      } else if (i === fullStars && halfStar) {
        stars.push(<FontAwesome5 key={i} name="star-half-alt" size={14} color="#FFD700" style={{marginRight: 2}} />);
      } else {
        stars.push(<FontAwesome5 key={i} name="star" size={14} color="#E0E0E0" style={{marginRight: 2}} />);
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {stars}
        </View>
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const openMaps = (location: string) => {
    const query = encodeURIComponent(`${location}, Singapore`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(mapsUrl);
  };

  const renderStall = ({ item, index }: { item: StallItem; index: number }) => {
    // Calculate animation delay based on index
    const animationDelay = index * 150;

    return (
      <Animated.View
        style={[
          styles.stallCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.stallImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageOverlayContent}>
            <Text style={styles.stallName}>{item.name}</Text>
            {renderRatingStars(item.rating)}
          </View>
          
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <FontAwesome5 name="check-circle" size={14} color="#3498db" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.stallContent}>
          <View style={styles.tagRow}>
            <View style={styles.cuisineTag}>
              <FontAwesome5 name="utensils" size={12} color="#FF5200" />
              <Text style={styles.cuisineText}>{item.cuisine}</Text>
            </View>
            
            {item.hygieneScore && (
              <View style={styles.hygieneScore}>
                <Text style={styles.hygieneScoreText}>{item.hygieneScore}</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={2} style={styles.stallDescription}>
            {item.description}
          </Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome5 name="clock" size={14} color="#666" />
              <Text style={styles.detailText}>{item.deliveryTime}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => openMaps(item.location)}
          >
            <FontAwesome5 name="directions" size={16} color="white" />
            <Text style={styles.locationText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Recommended For You
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToSwiper}
        >
          <FontAwesome5 name="sync-alt" size={18} color="#FF5200" />
          <Text style={styles.backButtonText}>New Search</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        Based on your food preferences
      </Text>
      
      <FlatList
        data={stalls}
        renderItem={renderStall}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    marginLeft: 5,
    color: '#FF5200',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  stallCard: {
    width: STALL_CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  stallImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  imageOverlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  stallContent: {
    padding: 16,
  },
  stallName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cuisineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cuisineText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF5200',
    fontWeight: '600',
  },
  hygieneScore: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hygieneScoreText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  stallDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5200',
    paddingVertical: 10,
    borderRadius: 25,
  },
  locationText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  ratingText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RecommendedStalls; 
export default RecommendedStalls; 