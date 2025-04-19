import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

type CommunityPost = {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

const demoPosts: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Sarah Johnson',
    authorAvatar: 'https://via.placeholder.com/150/ffffff/000000?text=SJ',
    timeAgo: '2h ago',
    content: 'Just discovered this amazing street food stall near Central Market! The spicy noodles are to die for. Anyone else tried it? 🍜 #StreetFoodAdventures',
    image: 'https://via.placeholder.com/600x400/FF9A5A/ffffff?text=Street+Food',
    likes: 42,
    comments: 8,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    authorName: 'Mark Wilson',
    authorAvatar: 'https://via.placeholder.com/150/ffffff/000000?text=MW',
    timeAgo: '5h ago',
    content: 'Looking for recommendations for the best local breakfast places. I\'ve been to Morning Brew and Sunrise Cafe so far, but would love to try more authentic spots!',
    likes: 17,
    comments: 25,
    isLiked: true,
    isSaved: false,
  },
  {
    id: '3',
    authorName: 'Emma Chen',
    authorAvatar: 'https://via.placeholder.com/150/ffffff/000000?text=EC',
    timeAgo: '1d ago',
    content: 'My experience with the "Taste of Local" food tour was phenomenal! The guide was knowledgeable and we got to try so many dishes I would have never found on my own. Highly recommend! 👌',
    image: 'https://via.placeholder.com/600x400/FF5200/ffffff?text=Food+Tour',
    likes: 89,
    comments: 12,
    isLiked: false,
    isSaved: true,
  },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<CommunityPost[]>(demoPosts);
  const [activeTab, setActiveTab] = useState('popular');

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked 
            } 
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, isSaved: !post.isSaved } 
          : post
      )
    );
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
          <View>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={item.isLiked ? "#FF5200" : "#666"} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={() => handleSave(item.id)}
        >
          <Ionicons 
            name={item.isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={item.isSaved ? "#FF5200" : "#666"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* New Post Input */}
      <View style={styles.newPostContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/150/ffffff/000000?text=ME' }} 
          style={styles.userAvatar} 
        />
        <TouchableOpacity style={styles.postInput}>
          <Text style={styles.postInputText}>Share your food experience...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'popular' && styles.activeTab]} 
          onPress={() => setActiveTab('popular')}
        >
          <Text style={[styles.tabText, activeTab === 'popular' && styles.activeTabText]}>
            Popular
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]} 
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'following' && styles.activeTab]} 
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
      />
      
      {/* Floating Create Post Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  newPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInput: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  postInputText: {
    color: '#888',
  },
  cameraButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#FF5200',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 60, // Adjusted for the custom tab bar height
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 70, // Adjusted to be above the custom tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
