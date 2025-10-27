import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

const BaseLayout = ({ title, children }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'flex-start',
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});

export default BaseLayout;
