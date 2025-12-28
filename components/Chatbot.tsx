import { HelpCircle, ChevronRight, X, ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { KISAN_FAQ_DATA, FAQItem, getFAQByCategory } from '@/utils/kisanDostData';

const { height: screenHeight } = Dimensions.get('window');

// Data for Categories
const HELP_CATEGORIES = [
  { id: 'account', label: 'Account & Login', icon: '👤' },
  { id: 'feature', label: 'App Features', icon: '📱' },
  { id: 'farming', label: 'Farming Tips', icon: '🌱' },
];

export default function Chatbot() { // Component name kept as Chatbot to avoid breaking imports, but logic is Helper
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [viewState, setViewState] = useState<'categories' | 'questions' | 'solution'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<FAQItem | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: screenHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isOpen]);

  const resetFlow = () => {
    setViewState('categories');
    setSelectedCategory(null);
    setSelectedQuestion(null);
    setFeedbackGiven(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetFlow, 300); // Reset after animation
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewState('questions');
  };

  const handleQuestionSelect = (item: FAQItem) => {
    setSelectedQuestion(item);
    setViewState('solution');
    setFeedbackGiven(false);
  };

  const handleBack = () => {
    if (viewState === 'solution') {
      setViewState('questions');
      setSelectedQuestion(null);
    } else if (viewState === 'questions') {
      setViewState('categories');
      setSelectedCategory(null);
    }
  };

  // -- RENDERERS --

  const renderCategoryItem = ({ item }: { item: typeof HELP_CATEGORIES[0] }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.catIconContainer}>
        <Text style={{fontSize: 24}}>{item.icon}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.catTitle}>{item.label}</Text>
        <Text style={styles.catSubtitle}>Tap to view solutions</Text>
      </View>
      <ChevronRight size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );

  const renderQuestionItem = ({ item }: { item: FAQItem }) => (
    <TouchableOpacity 
      style={styles.questionItem} 
      onPress={() => handleQuestionSelect(item)}
    >
      <Text style={styles.questionText}>{item.question}</Text>
      <ChevronRight size={16} color={Colors.textLight} />
    </TouchableOpacity>
  );

  const renderSolutionView = () => {
    if (!selectedQuestion) return null;
    
    return (
      <ScrollView contentContainerStyle={styles.solutionContainer}>
        <Text style={styles.solutionQuestion}>{selectedQuestion.question}</Text>
        
        <View style={styles.solutionCard}>
          <Text style={styles.solutionTitle}>Solution:</Text>
          <Text style={styles.solutionText}>{selectedQuestion.answer}</Text>
        </View>

        {!feedbackGiven ? (
            <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Did this help?</Text>
                <View style={styles.feedbackButtons}>
                    <TouchableOpacity style={styles.thumbBtn} onPress={() => setFeedbackGiven(true)}>
                        <ThumbsUp size={20} color={Colors.primary} />
                        <Text style={styles.thumbText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.thumbBtn} onPress={() => setFeedbackGiven(true)}>
                        <ThumbsDown size={20} color={Colors.error} />
                        <Text style={styles.thumbText}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View style={styles.feedbackThankYou}>
                <Text style={styles.feedbackThankYouText}>Thanks for your feedback!</Text>
            </View>
        )}

        <TouchableOpacity style={styles.mainMenuBtn} onPress={resetFlow}>
             <Text style={styles.mainMenuText}>Go to Main Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // -- MAIN RENDER --

  const getFilteredQuestions = () => {
    if (!selectedCategory) return [];
    // Ensure KISAN_FAQ_DATA is available
    if (!KISAN_FAQ_DATA) return [];
    return getFAQByCategory(selectedCategory);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.floaterBtn, { bottom: insets.bottom + 20 }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <HelpCircle size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={isOpen}
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} />
            
            <Animated.View style={[
                styles.sheetContainer,
                { transform: [{ translateY: slideAnim }] }
            ]}>
                {/* Header */}
                <View style={styles.header}>
                    {viewState !== 'categories' && (
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <ChevronLeft size={24} color={Colors.text} />
                        </TouchableOpacity>
                    )}
                    
                    <Text style={styles.headerTitle}>
                        {viewState === 'categories' ? 'Kisan Help Center' : 
                         viewState === 'questions' ? 'Select Problem' : 'Solution'}
                    </Text>

                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                        <X size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {viewState === 'categories' && (
                        <FlatList
                            data={HELP_CATEGORIES}
                            renderItem={renderCategoryItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{padding: 16}}
                        />
                    )}

                    {viewState === 'questions' && (
                         <FlatList
                            data={getFilteredQuestions()}
                            renderItem={renderQuestionItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{padding: 16}}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No questions found for this category.</Text>
                            }
                        />
                    )}

                    {viewState === 'solution' && renderSolutionView()}
                </View>
            </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floaterBtn: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%', // Occupy 85% of screen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  backBtn: { padding: 4 },
  closeBtn: { padding: 4 },
  
  contentArea: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Light gray background for contrast
  },

  // Categories
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    elevation: 1, // Mild shadow
  },
  catIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  catSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },

  // Questions
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  questionText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textLight,
  },

  // Solution
  solutionContainer: {
    padding: 20,
  },
  solutionQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  solutionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 24,
    elevation: 2,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  solutionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  feedbackSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  thumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  thumbText: {
    marginLeft: 8,
    fontWeight: '600',
    color: Colors.text,
  },
  feedbackThankYou: {
    alignItems: 'center',
    padding: 20,
  },
  feedbackThankYouText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  mainMenuBtn: {
    marginTop: 30,
    alignItems: 'center',
    padding: 15,
  },
  mainMenuText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  }
});