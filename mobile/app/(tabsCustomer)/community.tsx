import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
  Image,
  PanResponder,
} from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import * as Location from 'expo-location'
import { useAuth } from '../../contexts/AuthContext'
import { LinearGradient } from 'expo-linear-gradient'

type Comment = {
  id: string
  user_name: string
  content: string
  created_at: string
}

type Post = {
  id: string
  title: string
  content: string
  user_name?: string
  image_url?: string
  tags: string[]
  created_at: string
  distance?: number
  upvotes?: number
  downvotes?: number
  userVote?: 'up' | 'down' | null
  comments?: Comment[]
}

// Create a dedicated Post component to fix the hooks issue
const PostItem = React.memo(({ item, index, handleVote, formatDate, toggleComments, showComments }: 
  { item: Post; index: number; handleVote: Function; formatDate: Function; toggleComments: Function; showComments: {[key: string]: boolean} }) => {
  // Create staggered animation for each item
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const itemTranslateY = useRef(new Animated.Value(50)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  
  // Add swipe functionality for like/dislike
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal swiping up to a limit
        if (Math.abs(gestureState.dx) < 100) {
          swipeAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Threshold for triggering actions
        if (gestureState.dx > 80) {
          // Swiped right - like
          Animated.timing(swipeAnim, {
            toValue: 100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleVote(item.id, 'up');
            Animated.timing(swipeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        } else if (gestureState.dx < -80) {
          // Swiped left - dislike
          Animated.timing(swipeAnim, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleVote(item.id, 'down');
            Animated.timing(swipeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        } else {
          // Return to center
          Animated.spring(swipeAnim, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(itemTranslateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Calculate background colors and rotation based on swipe
  const rotateCard = swipeAnim.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: ['-5deg', '0deg', '5deg'],
  });
  
  const likeOpacity = swipeAnim.interpolate({
    inputRange: [0, 20, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  const dislikeOpacity = swipeAnim.interpolate({
    inputRange: [-100, -20, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View 
      style={[
        styles.postCard,
        {
          opacity: itemFadeAnim,
          transform: [
            { translateY: itemTranslateY },
            { translateX: swipeAnim },
            { rotate: rotateCard }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {/* Swipe Indicators */}
      <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
        <AntDesign name="like1" size={40} color="#FF5200" />
      </Animated.View>
      
      <Animated.View style={[styles.dislikeIndicator, { opacity: dislikeOpacity }]}>
        <AntDesign name="dislike1" size={40} color="#666" />
      </Animated.View>
      
      {/* Post Header with User Info */}
      <View style={styles.userInfoContainer}>
        <LinearGradient
          colors={['#FF8A5B', '#FF5200']}
          style={styles.userAvatar}
        >
          <Text style={styles.userInitial}>{(item.user_name?.[0] || 'U').toUpperCase()}</Text>
        </LinearGradient>
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
        <TouchableOpacity style={styles.moreOptionsButton}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#666" />
        </TouchableOpacity>
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
              {(tag === 'Important' || tag === 'important') && (
                <MaterialIcons name="priority-high" size={12} color="#FF5200" style={{marginRight: 4}} />
              )}
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
                <LinearGradient
                  colors={['#F0F0F0', '#E0E0E0']}
                  style={styles.commentUserAvatar}
                >
                  <Text style={styles.commentUserInitial}>
                    {comment.user_name[0].toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={styles.commentUserTextContainer}>
                  <Text style={styles.commentUser}>{comment.user_name}</Text>
                  <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                </View>
              </View>
              <View style={styles.commentContentContainer}>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
              <View style={styles.commentActions}>
                <TouchableOpacity style={styles.commentLikeButton}>
                  <AntDesign name="like2" size={14} color="#777" />
                  <Text style={styles.commentActionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentReplyButton}>
                  <Feather name="corner-up-left" size={14} color="#777" />
                  <Text style={styles.commentActionText}>Reply</Text>
                </TouchableOpacity>
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
    </Animated.View>
  );
});

export default function CommunityScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [radius, setRadius] = useState(2) // Default 2km radius
  const [createPostVisible, setCreatePostVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [activeCategory, setActiveCategory] = useState('Recent')
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted');
          setError('Permission to access location was denied');
          setLoading(false);
          // Load demo data if location access denied
          loadDemoData();
          return;
        }

        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,  // Lower accuracy for faster results
            timeInterval: 5000 // Limit how often to poll for location updates
          });
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          try {
            // Try to fetch from API
            await fetchNearbyPosts(location.coords.latitude, location.coords.longitude, radius);
          } catch (apiError) {
            console.error('API fetch error:', apiError);
            // Load demo data if API fetch fails
            loadDemoData();
          }
        } catch (locationError) {
          console.error('Location fetch error:', locationError);
          setError('Could not fetch location');
          setLoading(false);
          // Load demo data if location fetch fails
          loadDemoData();
        }
      } catch (mainError) {
        console.error('Fatal error:', mainError);
        setError('An unexpected error occurred');
        setLoading(false);
        // Load demo data for any unexpected error
        loadDemoData();
      }
    })()
  }, [])

  const fetchNearbyPosts = async (lat: number, lng: number, radius: number) => {
    setLoading(true)
    try {
      // Add a timeout to the fetch to prevent it hanging forever
      const fetchPromise = fetch('https://khalo-r5v5.onrender.com/community/getNearbyPosts', {
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
      
      // Set a timeout to abort the fetch if it takes too long
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      // Race the fetch against the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        // If the API returns empty data, use demo data
        loadDemoData();
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
      // Load demo data if fetch fails
      loadDemoData();
    } finally {
      setLoading(false)
    }
  }

  const handleRadiusChange = (value: number) => {
    setRadius(value)
    if (location) {
      fetchNearbyPosts(location.latitude, location.longitude, value)
    }
  }

  const addTag = () => {
    if (tagInput.trim() !== '') {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = [...tags]
    newTags.splice(index, 1)
    setTags(newTags)
  }

  const createPost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required')
      return
    }

    if (!location) {
      Alert.alert('Error', 'Location is not available')
      return
    }

    try {
      const response = await fetch(
        'https://khalo-r5v5.onrender.com/community/createPost',
        {
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
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Reset form and close modal
      setTitle('')
      setContent('')
      setTags([])
      setCreatePostVisible(false)

      // Refresh posts
      fetchNearbyPosts(location.latitude, location.longitude, radius)
    } catch (error) {
      console.error('Error creating post:', error)
      Alert.alert('Error', 'Failed to create post')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)

    if (diffHrs < 1) {
      return `${Math.floor(diffHrs * 60)} min ago`
    } else if (diffHrs < 24) {
      return `${Math.floor(diffHrs)}h ago`
    } else {
      return `${Math.floor(diffHrs / 24)}d ago`
    }
  }

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to vote')
      return
    }

    const endpoint =
      voteType === 'up'
        ? 'https://khalo-r5v5.onrender.com/community/upvotePost'
        : 'https://khalo-r5v5.onrender.com/community/downvotePost'

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
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Update posts locally to show the vote immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            // If user already voted the same way, remove the vote
            if (post.userVote === voteType) {
              return {
                ...post,
                upvotes:
                  voteType === 'up'
                    ? (post.upvotes || 0) - 1
                    : post.upvotes || 0,
                downvotes:
                  voteType === 'down'
                    ? (post.downvotes || 0) - 1
                    : post.downvotes || 0,
                userVote: null,
              }
            }
            // If user already voted the other way, switch the vote
            else if (post.userVote) {
              return {
                ...post,
                upvotes:
                  voteType === 'up'
                    ? (post.upvotes || 0) + 1
                    : (post.upvotes || 0) - 1,
                downvotes:
                  voteType === 'down'
                    ? (post.downvotes || 0) + 1
                    : (post.downvotes || 0) - 1,
                userVote: voteType,
              }
            }
            // If user hasn't voted yet
            else {
              return {
                ...post,
                upvotes:
                  voteType === 'up'
                    ? (post.upvotes || 0) + 1
                    : post.upvotes || 0,
                downvotes:
                  voteType === 'down'
                    ? (post.downvotes || 0) + 1
                    : post.downvotes || 0,
                userVote: voteType,
              }
            }
          }
          return post
        })
      )
    } catch (error) {
      console.error(
        `Error ${voteType === 'up' ? 'upvoting' : 'downvoting'} post:`,
        error
      )
      Alert.alert(
        'Error',
        `Failed to ${voteType === 'up' ? 'upvote' : 'downvote'} post`
      )
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  // Add a function to load demo data
  const loadDemoData = () => {
    console.log('Loading demo data');
    const demoData: Post[] = [
      {
        id: 'demo1',
        title: 'Best Food Places Nearby',
        content: 'Has anyone tried the new pizza place on Main Street? Their Margherita pizza is incredible!',
        user_name: 'FoodLover',
        tags: ['Food', 'Restaurants', 'Local'],
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        upvotes: 24,
        downvotes: 2,
        distance: 1.2,
        comments: [
          {
            id: 'comment1-demo1',
            user_name: 'User1',
            content: 'Yes! I went there last week. Their pasta is amazing too!',
            created_at: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
          },
          {
            id: 'comment2-demo1',
            user_name: 'User2',
            content: 'Thanks for the recommendation. Will check it out this weekend.',
            created_at: new Date(Date.now() - 900000).toISOString() // 15 mins ago
          }
        ]
      },
      {
        id: 'demo2',
        title: 'Community Cleanup This Weekend',
        content: 'Join us for a community cleanup at City Park this Saturday morning. Bring gloves and trash bags!',
        user_name: 'GreenEarth',
        tags: ['Community', 'Environment', 'Important'],
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        upvotes: 45,
        downvotes: 0,
        distance: 0.8,
        comments: [
          {
            id: 'comment1-demo2',
            user_name: 'User3',
            content: 'Count me in! What time does it start?',
            created_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
          }
        ]
      },
      {
        id: 'demo3',
        title: 'Lost Dog in West Area',
        content: 'My Golden Retriever got loose near West Park yesterday. He responds to "Max" and has a blue collar. Please contact if spotted!',
        user_name: 'PetLover',
        tags: ['Lost', 'Pets', 'Important'],
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        upvotes: 62,
        downvotes: 0,
        distance: 1.5,
        comments: [
          {
            id: 'comment1-demo3',
            user_name: 'User4',
            content: 'I think I saw a golden retriever near the coffee shop on Elm Street about an hour ago.',
            created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: 'comment2-demo3',
            user_name: 'User5',
            content: 'Hope you find your dog soon! Will keep an eye out.',
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ]
      }
    ];
    setPosts(demoData);
    setFilteredPosts(demoData);
    setLoading(false);
    setError('');
  };

  // Add sample posts for each category
  useEffect(() => {
    if (posts.length > 0 && !loading) {
      // Add sample comments and ensure we have posts for each category
      const enhancedPosts = posts.map((post, index) => {
        // Add random upvotes and downvotes
        const upvotes = post.upvotes || Math.floor(Math.random() * 30)
        const downvotes = post.downvotes || Math.floor(Math.random() * 10)

        // Add a category tag to some posts
        let enhancedTags = [...(post.tags || [])]
        if (index % 5 === 0) {
          enhancedTags.push('Important')
        }

        // Generate 2-3 comments for each post
        const commentCount = 2 + Math.floor(Math.random() * 2)
        const comments: any[] = []

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
              'Would love to see more posts like this!',
            ][Math.floor(Math.random() * 7)],
            created_at: new Date(
              Date.now() - Math.random() * 86400000 * 7
            ).toISOString(),
          })
        }

        return {
          ...post,
          upvotes,
          downvotes,
          tags: enhancedTags,
          comments,
        }
      })

      setPosts(enhancedPosts)
    }
  }, [posts.length, loading])

  // Filter posts based on active category
  useEffect(() => {
    if (posts.length > 0) {
      let filtered = [...posts]

      switch (activeCategory) {
        case 'Most Liked':
          filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          break
        case 'Recent':
          filtered.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          break
        case 'Important':
          filtered = filtered.filter(
            (post) =>
              post.tags?.includes('Important') ||
              post.tags?.includes('important')
          )
          break
        case 'Others':
          // Show all posts but give lower priority to posts in other categories
          const mostLiked = posts
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 3)
          const important = posts.filter(
            (post) =>
              post.tags?.includes('Important') ||
              post.tags?.includes('important')
          )

          // Remove duplicates
          const otherPosts = posts.filter(
            (post) =>
              !mostLiked.some((p) => p.id === post.id) &&
              !important.some((p) => p.id === post.id)
          )

          filtered = otherPosts
          break
      }

      setFilteredPosts(filtered)
    }
  }, [activeCategory, posts])

  const renderPost = useCallback(({ item, index }: { item: Post; index: number }) => {
    return (
      <PostItem 
        item={item} 
        index={index} 
        handleVote={handleVote} 
        formatDate={formatDate} 
        toggleComments={toggleComments} 
        showComments={showComments}
      />
    );
  }, [showComments]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Animated Background */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF8A5B', '#FF5200']}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Community</Text>
        </LinearGradient>
      </Animated.View>

      {/* Radius Selector with improved UI */}
      <Animated.View 
        style={[
          styles.radiusContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(scrollY, 0.1) }],
          },
        ]}
      >
        <View style={styles.radiusLabelContainer}>
          <MaterialIcons name="explore" size={20} color="#FF5200" />
          <Text style={styles.radiusLabel}>Discovery Radius: {radius} km</Text>
        </View>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={radius}
          onValueChange={handleRadiusChange}
          minimumTrackTintColor="#FF5200"
          maximumTrackTintColor="#FFDED0"
          thumbTintColor="#FF5200"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 }}>
          <Text style={{ fontSize: 12, color: '#999' }}>1 km</Text>
          <Text style={{ fontSize: 12, color: '#999' }}>10 km</Text>
        </View>
      </Animated.View>

      {/* Category Tabs with improved UI */}
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
              {activeCategory === category && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable content - only the posts will scroll */}
      <View style={styles.scrollableContent}>
        {/* Posts List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5200" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={60} color="#FF5200" style={{marginBottom: 16}} />
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
            <Image 
              source={{uri: 'https://cdn-icons-png.flaticon.com/512/6134/6134065.png'}} 
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No posts in this category</Text>
            <Text style={styles.emptySubText}>Try selecting a different category or be the first to post!</Text>
          </View>
        ) : (
          <Animated.FlatList
            data={filteredPosts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsList}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        )}
      </View>
      
      {/* Create Post Modal */}
      <Modal
        visible={createPostVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCreatePostVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#FF8A5B', '#FF5200']}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setCreatePostVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Title <Text style={{color: '#FF5200'}}>*</Text>
              </Text>
              <View style={styles.titleInputWrapper}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Enter post title"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  placeholderTextColor="#999"
                />
                {title.length > 0 && (
                  <Text style={styles.charCount}>{title.length}/100</Text>
                )}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Content</Text>
              <View style={styles.contentInputWrapper}>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Share something with your community..."
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <View style={styles.tagInputWrapper}>
                  <Ionicons
                    name="pricetag-outline"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add tags"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.selectedTag}
                      onPress={() => removeTag(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.selectedTagText}>{tag}</Text>
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color="white"
                        style={styles.tagRemoveIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.locationInfoContainer}>
              <View style={styles.locationIconContainer}>
                <Feather name="map-pin" size={20} color="#FF5200" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationInfoTitle}>Location</Text>
                <Text style={styles.locationInfoText}>
                  Your post will be visible to users within {radius} km of your
                  current location
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.createButton,
                !title.trim() && styles.createButtonDisabled,
              ]} 
              onPress={createPost}
              disabled={!title.trim()}
            >
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
            
            <View style={styles.formFooter}></View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Floating Create Post Button with Pulse Animation */}
      <Animated.View 
        style={[
          styles.floatingButton,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingButtonTouchable}
          onPress={() => setCreatePostVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF8A5B', '#FF5200']}
            style={styles.floatingButtonGradient}
          >
            <MaterialIcons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  fixedHeaderContainer: {
    backgroundColor: '#f8f8f8',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollableContent: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  radiusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  radiusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  radiusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 58,
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#FFF0EB',
    borderColor: '#FF5200',
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  radiusButtonTextActive: {
    color: '#FF5200',
    fontWeight: 'bold',
  },
  categoryTabsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryTabs: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#FFF0EB',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#FF5200',
    borderRadius: 3,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.6,
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    fontSize: 16,
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
  moreOptionsButton: {
    padding: 5,
  },
  postContentContainer: {
    marginBottom: 14,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    letterSpacing: 0.1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  commentActions: {
    flexDirection: 'row',
    marginLeft: 42,
    marginTop: 4,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  commentReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleInputWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    paddingRight: 50, // Space for character count
  },
  charCount: {
    position: 'absolute',
    right: 12,
    top: 14,
    fontSize: 12,
    color: '#999',
  },
  contentInputWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    minHeight: 140,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  tagInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  addTagButton: {
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5200',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
  },
  tagRemoveIcon: {
    marginLeft: 4,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#ffad8a',
    shadowOpacity: 0.1,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formFooter: {
    height: 40,
  },
  likeIndicator: {
    position: 'absolute',
    top: '40%',
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    padding: 8,
    zIndex: 10,
  },
  dislikeIndicator: {
    position: 'absolute',
    top: '40%',
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    padding: 8,
    zIndex: 10,
  },
})
