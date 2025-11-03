import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Card = ({ 
  children, 
  style = {}, 
  onPress,
  gradient = false,
  shadow = 'md',
  padding = 16,
  ...props 
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  const shadowStyles = {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  };

  const cardStyle = [
    styles.card,
    shadowStyles[shadow],
    { 
      padding: padding,
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
    },
    style
  ];

  if (gradient) {
    return (
      <CardComponent onPress={onPress} style={[cardStyle, { padding: 0 }]} {...props}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={[styles.gradientCard, { padding: padding }]}
        >
          {children}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent onPress={onPress} style={cardStyle} {...props}>
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  gradientCard: {
    borderRadius: 16,
  },
});

export default Card;