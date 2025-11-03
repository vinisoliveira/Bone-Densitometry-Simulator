import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExameScreen({ route, navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { id, nome, idade, sexo, etnia, exame } = route.params;

  const nomeExame = exame === 'coluna_lombar_ap.jpg'
    ? 'Coluna Lombar AP'
    : exame === 'femur_esquerdo.jpg'
    ? 'Fêmur Esquerdo'
    : exame;

  const imagemExame = exame === 'coluna_lombar_ap.jpg'
    ? require('../assets/coluna_lombar_ap.jpg')
    : exame === 'femur.jpeg'
    ? require('../assets/femur.jpeg')
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.colors.backgroundLight, theme.colors.surface] 
          : [theme.colors.info, theme.colors.infoLight]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={[styles.backButton, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIconContainer, { 
            backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>🩺</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Detalhes do Exame
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card do Paciente */}
        <View style={[styles.patientCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.lg,
        }]}>
          <LinearGradient
            colors={[theme.colors.info + '15', 'transparent']}
            style={styles.cardGradient}
          />
          <View style={styles.patientHeader}>
            <LinearGradient
              colors={[theme.colors.info, theme.colors.infoLight]}
              style={styles.patientAvatar}
            >
              <Text style={styles.patientAvatarText}>
                {nome.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.patientHeaderInfo}>
              <Text style={[styles.patientName, { color: theme.colors.text }]}>
                {nome}
              </Text>
              <Text style={[styles.patientId, { color: theme.colors.textSecondary }]}>
                ID: {id}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>🎂</Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Idade</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{idade} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>{sexo === 'Masculino' ? '♂️' : '♀️'}</Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Sexo</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{sexo}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>👤</Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Etnia</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{etnia}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoEmoji}>🦴</Text>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Exame</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{nomeExame}</Text>
            </View>
          </View>
        </View>

        {/* Imagem do Exame */}
        {imagemExame && (
          <View style={[styles.imageCard, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.md,
          }]}>
            <View style={styles.imageHeader}>
              <Text style={styles.imageIcon}>📸</Text>
              <Text style={[styles.imageTitle, { color: theme.colors.text }]}>
                Imagem do Exame
              </Text>
            </View>
            <View style={[styles.imageContainer, { borderColor: theme.colors.border }]}>
              <Image 
                source={imagemExame} 
                style={styles.image} 
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Ações */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { ...theme.shadows.md }]}
            onPress={() => navigation.navigate('Lista')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Ver Lista de Exames</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { ...theme.shadows.md }]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.secondaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>🏠</Text>
              <Text style={styles.actionText}>Voltar para Início</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -44,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  patientCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  patientAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientAvatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  patientHeaderInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  imageCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  image: {
    width: '100%',
    height: 250,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
