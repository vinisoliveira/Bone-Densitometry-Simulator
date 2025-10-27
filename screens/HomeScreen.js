import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../src/styles/theme';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bone Densitometry Simulator</Text>

      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate('Lista')}
          >
            <Ionicons name="people" size={32} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Exames</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Ionicons name="add-circle" size={32} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Adicionar Exame</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate('Sobre')}
          >
            <Ionicons name="information-circle" size={32} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Sobre</Text>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.surface,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  circleButton: {
    backgroundColor: colors.surface,
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonLabel: {
    marginTop: spacing.sm,
    color: colors.surface,
    fontSize: 14,
    textAlign: 'center',
  },
});
