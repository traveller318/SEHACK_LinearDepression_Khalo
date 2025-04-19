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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

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
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && halfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFD700" />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" />);
      }
    }

    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const openMaps = (location: string) => {
    const query = encodeURIComponent(`${location}, Singapore`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(mapsUrl);
  };

  const renderStall = ({ item }: { item: StallItem }) => {
    return (
      <View style={styles.stallCard}>
        <Image source={{ uri: item.image }} style={styles.stallImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check-circle" size={16} color="#3498db" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        <View style={styles.stallContent}>
          <Text style={styles.stallName}>{item.name}</Text>
          <View style={styles.infoRow}>
            {renderRatingStars(item.rating)}
            <View style={styles.hygieneScore}>
              <Text style={styles.hygieneScoreText}>{item.hygieneScore}</Text>
            </View>
          </View>
          <Text style={styles.stallDescription}>{item.description}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <FontAwesome name="cutlery" size={14} color="#666" />
              <Text style={styles.detailText}>{item.cuisine}</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="map-marker" size={14} color="#666" />
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="clock-o" size={14} color="#666" />
              <Text style={styles.detailText}>{item.deliveryTime}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => openMaps(item.location)}
          >
            <FontAwesome name="map-marker" size={16} color="#FF5200" />
            <Text style={styles.locationText}>{item.location}</Text>
          </TouchableOpacity>
          
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Recommended Stalls
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToSwiper}
        >
          <FontAwesome name="refresh" size={20} color="#FF5200" />
          <Text style={styles.backButtonText}>Swipe Again</Text>
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
    backgroundColor: '#f8f8f8',
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
    padding: 8,
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
    height: 280, // Increased height to accommodate more info
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  stallImage: {
    width: '100%',
    height: 140,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    padding: 12,
  },
  stallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  hygieneScore: {
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hygieneScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  stallDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#444',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

// Explicitly set displayName to fix the error
RecommendedStalls.displayName = 'RecommendedStalls';

export default RecommendedStalls; 