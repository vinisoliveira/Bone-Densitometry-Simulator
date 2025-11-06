import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';


const SobreScreen = ({ navigation }) => {
  const InfoCard = ({ icon, title, children }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          <FontAwesome5 name={icon} size={24} color="#667eea" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Sobre o Projeto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <FontAwesome5 name="bone" size={48} color="#4A90E2" />
          </View>
          <Text style={styles.appName}>Bone Densitometry</Text>
          <Text style={styles.appVersion}>Simulator v1.0</Text>
        </View>

        <InfoCard icon="bullseye" title="Propósito">
          <Text style={styles.text}>
            Este projeto é voltado para visualização e organização de exames de imagem, 
            com foco em radiografias da coluna e membros. Ele simula o ambiente de um 
            laboratório moderno, oferecendo uma experiência imersiva e funcional.
          </Text>
        </InfoCard>

        <InfoCard icon="code" title="Tecnologias">
          <View style={styles.techList}>
            <TechItem icon="react" name="React Native" />
            <TechItem icon="mobile-alt" name="Expo" />
            <TechItem icon="route" name="React Navigation" />
            <TechItem icon="font" name="FontAwesome Icons" />
          </View>
        </InfoCard>

        <InfoCard icon="users" title="Desenvolvedores">
          <View style={styles.devList}>
            <DevItem name="Bernardo Nascimento" />
            <DevItem name="Vinícius Oliveira" />
            <DevItem name="Fernando Vinícius" />
          </View>
        </InfoCard>

        <InfoCard icon="graduation-cap" title="Turma Radiologia">
          <Text style={styles.classText}>
            Projeto desenvolvido como parte do curso de Radiologia, 
            demonstrando aplicações práticas da tecnologia na área da saúde.
          </Text>
        </InfoCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 AIFP</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const TechItem = ({ icon, name }) => (
  <View style={styles.techItem}>
    <FontAwesome5 name={icon} size={16} color="#667eea" />
    <Text style={styles.techText}>{name}</Text>
  </View>
);

const DevItem = ({ name }) => (
  <View style={styles.devItem}>
    <View style={styles.devIcon}>
      <FontAwesome5 name="user" size={16} color="#667eea" />
    </View>
    <Text style={styles.devText}>{name}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f52',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  techList: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  devList: {
    gap: 12,
  },
  devItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  classText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SobreScreen;
