import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface HygieneReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportData: {
    good_practices: string[];
    issues_found: string[];
    recommendations: string[];
    overall_summary: string;
  };
  hygieneScore: number;
}

const ScoreIndicator = ({ score }: { score: number }) => {
  // Calculate the percentage for the circular progress
  const percentage = (score / 5) * 100;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 4) return ['#4CAF50', '#2E7D32'];
    if (score >= 3) return ['#8BC34A', '#558B2F'];
    if (score >= 2) return ['#FFC107', '#FFA000'];
    return ['#F44336', '#D32F2F'];
  };

  const colors = getColor();
  
  return (
    <View style={styles.scoreContainer}>
      <LinearGradient
        colors={colors}
        style={styles.scoreCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.scoreText}>{score.toFixed(1)}</Text>
        <Text style={styles.scoreMaxText}>/5</Text>
      </LinearGradient>
      <Text style={styles.scoreLabel}>Hygiene Score</Text>
    </View>
  );
};

const ListItem = ({ 
  text, 
  icon, 
  color, 
  index 
}: { 
  text: string; 
  icon: string; 
  color: string; 
  index: number 
}) => (
  <Animated.View 
    entering={FadeInDown.delay(100 * index).springify()} 
    style={styles.listItemContainer}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <FontAwesome5 name={icon} size={16} color={color} />
    </View>
    <Text style={styles.listItemText}>{text}</Text>
  </Animated.View>
);

const SectionHeader = ({ title, icon, color }: { title: string; icon: string; color: string }) => (
  <View style={styles.sectionHeader}>
    <MaterialIcons name={icon} size={20} color={color} />
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
  </View>
);

const HygieneReportModal = ({
  visible,
  onClose,
  reportData,
  hygieneScore,
}: HygieneReportModalProps) => {
  const { good_practices, issues_found, recommendations, overall_summary } = reportData;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialIcons name="cleaning-services" size={24} color="#3498db" />
              <Text style={styles.title}>Hygiene Report</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ScoreIndicator score={hygieneScore} />

            {overall_summary && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Overall Summary</Text>
                <Text style={styles.summaryText}>{overall_summary}</Text>
              </View>
            )}

            {good_practices.length > 0 && (
              <View style={styles.section}>
                <SectionHeader 
                  title="Good Practices" 
                  icon="thumb-up" 
                  color="#4CAF50" 
                />
                {good_practices.map((practice, index) => (
                  <ListItem 
                    key={`practice-${index}`} 
                    text={practice} 
                    icon="check-circle" 
                    color="#4CAF50" 
                    index={index}
                  />
                ))}
              </View>
            )}

            {issues_found.length > 0 && (
              <View style={styles.section}>
                <SectionHeader 
                  title="Issues Found" 
                  icon="error" 
                  color="#F44336" 
                />
                {issues_found.map((issue, index) => (
                  <ListItem 
                    key={`issue-${index}`} 
                    text={issue} 
                    icon="exclamation-circle" 
                    color="#F44336" 
                    index={index}
                  />
                ))}
              </View>
            )}

            {recommendations.length > 0 && (
              <View style={styles.section}>
                <SectionHeader 
                  title="Recommendations" 
                  icon="lightbulb" 
                  color="#FF9800" 
                />
                {recommendations.map((recommendation, index) => (
                  <ListItem 
                    key={`recommendation-${index}`} 
                    text={recommendation} 
                    icon="lightbulb" 
                    color="#FF9800" 
                    index={index}
                  />
                ))}
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                <Text style={styles.actionButtonText}>Close Report</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scoreMaxText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HygieneReportModal; 