import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type TourExperience = {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  location: string;
};

const demoTours: TourExperience[] = [
  {
    id: '1',
    title: 'Traditional Food Tour',
    description: 'Experience local flavors with our guided food tour through the most authentic eateries.',
    image: 'https://via.placeholder.com/400x300/FF9A5A/ffffff?text=Food+Tour',
    rating: 4.8,
    price: '$45',
    location: 'City Center'
  },
  {
    id: '2',
    title: 'Hidden Gems Walking Tour',
    description: 'Discover secret spots and local hideaways that most tourists never see.',
    image: 'https://via.placeholder.com/400x300/FF5200/ffffff?text=Walking+Tour',
    rating: 4.9,
    price: '$35',
    location: 'Historic District'
  },
  {
    id: '3',
    title: 'Sunset Culinary Experience',
    description: 'Enjoy the best views while tasting exquisite local delicacies as the sun sets.',
    image: 'https://via.placeholder.com/400x300/FFB980/ffffff?text=Sunset+Tour',
    rating: 4.7,
    price: '$65',
    location: 'Waterfront Area'
  },
  {
    id: '4',
    title: 'Street Food Adventure',
    description: 'Navigate the exciting world of street food with a knowledgeable local guide.',
    image: 'https://via.placeholder.com/400x300/FF7E45/ffffff?text=Street+Food',
    rating: 4.6,
    price: '$30',
    location: 'Market District'
  },
];

export default function TouristSpecialScreen() {
  const insets = useSafeAreaInsets();
  
  const renderTourCard = ({ item }: { item: TourExperience }) => (
    <TouchableOpacity style={styles.tourCard}>
      <Image source={{ uri: item.image }} style={styles.tourImage} />
      <View style={styles.tourBadge}>
        <Text style={styles.tourBadgeText}>{item.price}</Text>
      </View>
      <View style={styles.tourCardContent}>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <Text style={styles.tourDescription}>{item.description}</Text>
        <View style={styles.tourDetails}>
          <View style={styles.tourRating}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.tourLocation}>
            <MaterialIcons name="place" size={16} color="#FF5200" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tourist Special</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Featured Banner */}
      <TouchableOpacity style={styles.featuredBanner}>
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
        >
          <Text style={styles.bannerTitle}>Exclusive Food Tours</Text>
          <Text style={styles.bannerSubtitle}>Discover local favorites with our expert guides</Text>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Explore Now</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </View>
        </LinearGradient>
        <Image
          source={{ uri: 'https://via.placeholder.com/800x400/FF5200/ffffff?text=Featured+Tour' }}
          style={styles.bannerImage}
        />
      </TouchableOpacity>

      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="utensils" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Food</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="walking" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Walking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="camera" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <View style={styles.categoryIcon}>
            <FontAwesome5 name="glass-cheers" size={18} color="#FF5200" />
          </View>
          <Text style={styles.categoryText}>Nightlife</Text>
        </TouchableOpacity>
      </View>

      {/* Tour Experiences */}
      <View style={styles.toursSection}>
        <Text style={styles.sectionTitle}>Recommended Experiences</Text>
        <FlatList
          data={demoTours}
          renderItem={renderTourCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.toursList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  featuredBanner: {
    height: 180,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,0,0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,82,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  toursSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  toursList: {
    paddingBottom: 80, // Extra space for the tab bar
  },
  tourCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tourImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  tourBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF5200',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tourBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tourCardContent: {
    padding: 16,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tourDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tourDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tourRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#444',
  },
  tourLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    color: '#666',
  },
});
