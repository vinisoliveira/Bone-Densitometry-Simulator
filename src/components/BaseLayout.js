import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const BaseLayout = ({ 
  title, 
  children, 
  showBackButton = false, 
  navigation,
  headerIcon,
  gradient = true 
}) => {
  // Gradiente adaptado para web
  const Container = gradient 
    ? (Platform.OS === 'web' 
        ? ({ children, colors, style }) => (
            <View style={[style, { background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})` }]}>
              {children}
            </View>
          )
        : LinearGradient)
    : View;
    
  const containerProps = gradient 
    ? { colors: ['#F8FAFC', '#F1F5F9'] } 
    : { style: { backgroundColor: '#F8FAFC' } };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Container {...containerProps} style={styles.container}>
        {/* Header */}
        {(title || showBackButton) && (
          <View style={styles.header}>
            {showBackButton && navigation && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Icon 
                  name={faArrowLeft} 
                  size={20} 
                  color="#1F2937" 
                />
              </TouchableOpacity>
            )}
            
            {title && (
              <View style={styles.titleContainer}>
                {headerIcon && (
                  <View style={styles.headerIconContainer}>
                    <Icon 
                      name={headerIcon} 
                      size={24} 
                      color="#2563EB" 
                    />
                  </View>
                )}
                <Text style={styles.title}>{title}</Text>
              </View>
            )}
          </View>
        )}

        {/* Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.content}>
            {children}
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
});

export default BaseLayout;
