import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  FadeIn,
  FadeOut 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Manage Your Tasks',
    description: 'Create and organize tasks with ease, set priorities, and never miss a deadline again.',
    image : require('../assets/images/onboarding-1.png')
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'Monitor your productivity and achievements with beautiful visual analytics.',
    image : require('../assets/images/onboarding-2.png')
  },
  {
    id: '3',
    title: 'Achieve Your Goals',
    description: 'Reach your full potential by staying organized and focused on what matters.',
    image : require('../assets/images/onboarding-3.png')
  },
];

const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const buttonWidth = useSharedValue(56);
  
  const handleNext = () => {
    if (activeIndex === onboardingData.length - 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/(auth)/signin" as const);
    } else {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  const updateIndex = (index: number) => {
    setActiveIndex(index);
    
    // Animate button on last slide - only change width, not position
    if (index === onboardingData.length - 1) {
      buttonWidth.value = withTiming(150, { duration: 300 });
    } else {
      buttonWidth.value = withTiming(56, { duration: 300 });
    }
  };

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      width: buttonWidth.value,
    };
  });

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.image}
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const dotWidth = useSharedValue(activeIndex === index ? 20 : 8);
          const dotOpacity = useSharedValue(activeIndex === index ? 1 : 0.5);
          
          React.useEffect(() => {
            dotWidth.value = withTiming(activeIndex === index ? 20 : 8, { duration: 300 });
            dotOpacity.value = withTiming(activeIndex === index ? 1 : 0.5, { duration: 300 });
          }, [activeIndex]);
          
          const dotStyle = useAnimatedStyle(() => {
            return {
              width: dotWidth.value,
              opacity: dotOpacity.value,
              backgroundColor: activeIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
            };
          });
          
          return (
            <Animated.View
              key={index}
              style={dotStyle}
            />
          );
        })}
      </View>
    );
  };

  return (
    <AnimatedLinearGradient
      colors={['#FF9A5A', '#FF5200']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          updateIndex(index);
        }}
      />
      
      <View style={styles.bottomContainer}>
        {renderDots()}
        
        <AnimatedButton
          style={[styles.nextButton, buttonAnimStyle]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {activeIndex === onboardingData.length - 1 ? (
            <Animated.Text 
              entering={FadeIn.duration(300)}
              style={styles.getStartedText}
            >
              Get Started
            </Animated.Text>
          ) : (
            <Animated.Text style={styles.nextIcon}>⟶</Animated.Text>
          )}
        </AnimatedButton>
      </View>
    </AnimatedLinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8C00',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#fff5e6',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
    letterSpacing: 0.3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'white',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    left: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
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
    alignSelf: 'flex-end',
  },
  nextIcon: {
    color: '#FF5200',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  getStartedText: {
    color: '#FF5200',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
}); 