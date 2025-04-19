import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { MaterialIcons } from '@expo/vector-icons'

export default function VendorLeaderboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('today')
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])

  useEffect(() => {
    fetchLeaderboardData()
  }, [selectedTab])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockUsers = [
        { id: 1, name: 'Lena McCall', score: 5255, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 2, name: 'Leia Johnson', score: 4155, image: 'https://randomuser.me/api/portraits/women/68.jpg' },
        { id: 3, name: 'Tom Edwards', score: 3255, image: 'https://randomuser.me/api/portraits/men/42.jpg' },
        { id: 4, name: 'Dora Anderson', score: 2255, image: 'https://randomuser.me/api/portraits/women/65.jpg' },
        { id: 5, name: 'Kayla Horne', score: 1000, image: 'https://randomuser.me/api/portraits/women/58.jpg' },
        { id: 6, name: 'Sondra Himes', score: 589, image: 'https://randomuser.me/api/portraits/women/54.jpg' },
        { id: 7, name: 'Loren Mirales', score: 281, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 8, name: 'David Kim', score: 180, image: 'https://randomuser.me/api/portraits/men/11.jpg' },
        { id: 9, name: 'Sarah Wright', score: 120, image: 'https://randomuser.me/api/portraits/women/90.jpg' },
        { id: 10, name: 'James Fletcher', score: 75, image: 'https://randomuser.me/api/portraits/men/67.jpg' },
      ];
      
      // Sort users by score in descending order
      const sortedUsers = [...mockUsers].sort((a, b) => b.score - a.score);
      
      // Set top 3 performers
      setTopPerformers(sortedUsers.slice(0, 3));
      
      // Add rank to each user
      const rankedUsers = sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      setLeaderboardData(rankedUsers);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6f00" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'today' && styles.activeTab]} 
            onPress={() => setSelectedTab('today')}
          >
            <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'week' && styles.activeTab]} 
            onPress={() => setSelectedTab('week')}
          >
            <Text style={[styles.tabText, selectedTab === 'week' && styles.activeTabText]}>Week</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.topThreeContainer}>
          {topPerformers.map((performer, index) => {
            // Determine position (left, center, right)
            const position = index === 0 ? 1 : index === 1 ? 0 : 2; // Center, Left, Right
            
            return (
              <View 
                key={performer.id} 
                style={[
                  styles.topPerformerContainer,
                  { 
                    zIndex: position === 0 ? 3 : 1,
                    marginTop: position === 0 ? 0 : 20
                  }
                ]}
              >
                {position === 0 && (
                  <View style={styles.crownContainer}>
                    <MaterialIcons name="emoji-events" size={22} color="#FFD700" />
                  </View>
                )}
                <View style={[styles.imageContainer, position === 0 && styles.firstPlaceImage]}>
                  <Image source={{ uri: performer.image }} style={styles.topPerformerImage} />
                </View>
                <View style={[styles.rankBadge, 
                  position === 0 ? styles.firstPlaceBadge : 
                  position === 1 ? styles.secondPlaceBadge : 
                  styles.thirdPlaceBadge
                ]}>
                  <Text style={styles.rankBadgeText}>{position + 1}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {leaderboardData.map((item) => (
          <View key={item.id} style={styles.leaderboardItem}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            
            <Image 
              source={{ uri: item.image }} 
              style={styles.userImage} 
            />
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
            </View>
            
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6f00',
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 5,
    marginHorizontal: 100,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ff6f00',
    fontWeight: 'bold',
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
    marginBottom: 10,
    height: 120,
  },
  topPerformerContainer: {
    alignItems: 'center',
    marginHorizontal: -5,
  },
  imageContainer: {
    padding: 2,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  firstPlaceImage: {
    padding: 3,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  topPerformerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
    backgroundColor: '#ff6f00',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -10,
    width: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstPlaceBadge: {
    backgroundColor: '#FFD700',
  },
  secondPlaceBadge: {
    backgroundColor: '#C0C0C0',
  },
  thirdPlaceBadge: {
    backgroundColor: '#CD7F32',
  },
  rankBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rankContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff6f00',
  },
});
