import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome, AntDesign, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';

type Comment = {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  user_name?: string;
  image_url?: string;
  tags: string[];
  created_at: string;
  distance?: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'up' | 'down' | null;
  comments?: Comment[];
};

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState(2); // Default 2km radius
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [activeCategory, setActiveCategory] = useState('Recent');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        fetchNearbyPosts(location.coords.latitude, location.coords.longitude, radius);
      } catch (err) {
        setError('Could not fetch location');
        setLoading(false);
      }
    })();
  }, []);

  const fetchNearbyPosts = async (lat: number, lng: number, radius: number) => {
    setLoading(true);
    try {
      const response = await fetch('https://khalo-r5v5.onrender.com/community/getNearbyPosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lng,
          radius: radius * 1000, // Convert km to meters
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    if (location) {
      fetchNearbyPosts(location.latitude, location.longitude, value);
    }
  };

  const addTag = () => {
    if (tagInput.trim() !== '') {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const createPost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is not available');
      return;
    }

    try {
      const response = await fetch('https://khalo-r5v5.onrender.com/community/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          title: title.trim(),
          content: content.trim(),
          tags,
          lat: location.latitude,
          lng: location.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Reset form and close modal
      setTitle('');
      setContent('');
      setTags([]);
      setCreatePostVisible(false);
      
      // Refresh posts
      fetchNearbyPosts(location.latitude, location.longitude, radius);
      
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
      return `${Math.floor(diffHrs * 60)} min ago`;
    } else if (diffHrs < 24) {
      return `${Math.floor(diffHrs)}h ago`;
    } else {
      return `${Math.floor(diffHrs / 24)}d ago`;
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to vote');
      return;
    }

    const endpoint = voteType === 'up'
      ? 'https://khalo-r5v5.onrender.com/community/upvotePost'
      : 'https://khalo-r5v5.onrender.com/community/downvotePost';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // user_id: user.id,
          post_id: postId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Update posts locally to show the vote immediately
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            // If user already voted the same way, remove the vote
            if (post.userVote === voteType) {
              return {
                ...post,
                upvotes: voteType === 'up' ? (post.upvotes || 0) - 1 : (post.upvotes || 0),
                downvotes: voteType === 'down' ? (post.downvotes || 0) - 1 : (post.downvotes || 0),
                userVote: null
              };
            }
            // If user already voted the other way, switch the vote
            else if (post.userVote) {
              return {
                ...post,
                upvotes: voteType === 'up' 
                  ? (post.upvotes || 0) + 1 
                  : (post.upvotes || 0) - 1,
                downvotes: voteType === 'down'
                  ? (post.downvotes || 0) + 1
                  : (post.downvotes || 0) - 1,
                userVote: voteType
              };
            }
            // If user hasn't voted yet
            else {
              return {
                ...post,
                upvotes: voteType === 'up' ? (post.upvotes || 0) + 1 : (post.upvotes || 0),
                downvotes: voteType === 'down' ? (post.downvotes || 0) + 1 : (post.downvotes || 0),
                userVote: voteType
              };
            }
          }
          return post;
        })
      );
      
    } catch (error) {
      console.error(`Error ${voteType === 'up' ? 'upvoting' : 'downvoting'} post:`, error);
      Alert.alert('Error', `Failed to ${voteType === 'up' ? 'upvote' : 'downvote'} post`);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Add sample posts for each category
  useEffect(() => {
    if (posts.length > 0 && !loading) {
      // Add sample comments and ensure we have posts for each category
      const enhancedPosts = posts.map((post, index) => {
        // Add random upvotes and downvotes
        const upvotes = post.upvotes || Math.floor(Math.random() * 30);
        const downvotes = post.downvotes || Math.floor(Math.random() * 10);
        
        // Add a category tag to some posts
        let enhancedTags = [...(post.tags || [])];
        if (index % 5 === 0) {
          enhancedTags.push('Important');
        }
        
        // Generate 2-3 comments for each post
        const commentCount = 2 + Math.floor(Math.random() * 2);
        const comments : any[] = [];
        
        for (let i = 0; i < commentCount; i++) {
          comments.push({
            id: `comment${i}-${post.id}`,
            user_name: `User${Math.floor(Math.random() * 10) + 1}`,
            content: [
              'Great post! Very helpful information.',
              'I agree with this. Thanks for sharing!',
              'This is exactly what I was looking for.',
              'Has anyone else experienced this problem?',
              'Thanks for bringing this to our attention.',
              'I had a similar experience last week.',
              'Would love to see more posts like this!'
            ][Math.floor(Math.random() * 7)],
            created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
          });
        }
        
        return {
          ...post,
          upvotes,
          downvotes,
          tags: enhancedTags,
          comments
        };
      });
      
      setPosts(enhancedPosts);
    }
  }, [posts.length, loading]);

  // Filter posts based on active category
  useEffect(() => {
    if (posts.length > 0) {
      let filtered = [...posts];
      
      switch (activeCategory) {
        case 'Most Liked':
          filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
        case 'Recent':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'Important':
          filtered = filtered.filter(post => post.tags?.includes('Important') || post.tags?.includes('important'));
          break;
        case 'Others':
          // Show all posts but give lower priority to posts in other categories
          const mostLiked = posts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3);
          const important = posts.filter(post => post.tags?.includes('Important') || post.tags?.includes('important'));
          
          // Remove duplicates
          const otherPosts = posts.filter(post => 
            !mostLiked.some(p => p.id === post.id) && 
            !important.some(p => p.id === post.id)
          );
          
          filtered = otherPosts;
          break;
      }
      
      setFilteredPosts(filtered);
    }
  }, [activeCategory, posts]);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header with User Info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{(item.user_name?.[0] || 'U').toUpperCase()}</Text>
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>{item.user_name || 'Anonymous User'}</Text>
          <View style={styles.postMetaContainer}>
            <Text style={styles.timeAgo}>{formatDate(item.created_at)}</Text>
            {item.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Feather name="map-pin" size={10} color="#666" />
                <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Post Title and Content */}
      <View style={styles.postContentContainer}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>
      </View>
      
      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View 
              key={index} 
              style={[
                styles.tag,
                (tag === 'Important' || tag === 'important') && styles.importantTag
              ]}
            >
              <Text 
                style={[
                  styles.tagText,
                  (tag === 'Important' || tag === 'important') && styles.importantTagText
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={[styles.voteButton, item.userVote === 'up' && styles.activeVoteButton]}
            onPress={() => handleVote(item.id, 'up')}
          >
            <AntDesign 
              name="like1" 
              size={20} 
              color={item.userVote === 'up' ? '#FF5200' : '#666'} 
            />
            <Text style={[styles.voteCount, item.userVote === 'up' && styles.activeVote]}>
              {item.upvotes || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.voteButton, item.userVote === 'down' && styles.activeVoteButton]}
            onPress={() => handleVote(item.id, 'down')}
          >
            <AntDesign 
              name="dislike1" 
              size={20} 
              color={item.userVote === 'down' ? '#FF5200' : '#666'} 
            />
            <Text style={[styles.voteCount, item.userVote === 'down' && styles.activeVote]}>
              {item.downvotes || 0}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.commentButton,
            showComments[item.id] && styles.activeCommentButton
          ]}
          onPress={() => toggleComments(item.id)}
        >
          <FontAwesome 
            name="comment" 
            size={18} 
            color={showComments[item.id] ? "#FF5200" : "#666"} 
          />
          <Text style={[
            styles.commentCount,
            showComments[item.id] && styles.activeCommentCount
          ]}>
            {item.comments?.length || 0} Comments
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Comments Section */}
      {showComments[item.id] && item.comments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsDivider} />
          <Text style={styles.commentsHeader}>Comments</Text>
          
          {item.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentUserInfo}>
                <View style={styles.commentUserAvatar}>
                  <Text style={styles.commentUserInitial}>
                    {comment.user_name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentUserTextContainer}>
                  <Text style={styles.commentUser}>{comment.user_name}</Text>
                  <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                </View>
              </View>
              <View style={styles.commentContentContainer}>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            </View>
          ))}
          
          {/* Add Comment Input */}
          <View style={styles.addCommentContainer}>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.sendCommentButton}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Radius: {radius} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={radius}
          onValueChange={handleRadiusChange}
          minimumTrackTintColor="#FF5200"
          maximumTrackTintColor="#D3D3D3"
          thumbTintColor="#FF5200"
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {['Recent', 'Most Liked', 'Important', 'Others'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                activeCategory === category && styles.activeTab
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryTabText,
                  activeCategory === category && styles.activeTabText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5200" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => location && fetchNearbyPosts(location.latitude, location.longitude, radius)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts in this category</Text>
          <Text style={styles.emptySubText}>Try selecting a different category or be the first to post!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
        />
      )}
      
      {/* Create Post Modal */}
      <Modal
        visible={createPostVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCreatePostVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => setCreatePostVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter post title"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Enter post content"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add tags"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.tag}
                      onPress={() => removeTag(index)}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                      <Ionicons name="close-circle" size={16} color="#666" style={styles.tagRemoveIcon} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.createButton} onPress={createPost}>
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Floating Create Post Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setCreatePostVisible(true)}
      >
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  radiusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  categoryTabsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabs: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FFF0EB',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF5200',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 8,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  postMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
  },
  postContentContainer: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  importantTag: {
    backgroundColor: '#FFEBD9',
    borderWidth: 1,
    borderColor: '#FFCEB3',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  importantTagText: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  tagRemoveIcon: {
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginVertical: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  activeVoteButton: {
    backgroundColor: '#FFF0EB',
  },
  voteCount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeVote: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  activeCommentButton: {
    backgroundColor: '#FFF0EB',
  },
  commentCount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCommentCount: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  commentsSection: {
    marginTop: 8,
    paddingTop: 8,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentUserInitial: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentUserTextContainer: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentTime: {
    fontSize: 11,
    color: '#888',
  },
  commentContentContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginLeft: 42,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5200',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  commentInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendCommentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
