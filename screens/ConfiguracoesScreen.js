import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const ConfiguracoesScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const SettingItem = ({ icon, title, subtitle, type, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <FontAwesome5 name={icon} size={20} color="#667eea" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#3a3f52', true: '#4A90E2' }}
          thumbColor={value ? '#FFFFFF' : '#999'}
        />
      )}
      {type === 'arrow' && (
        <FontAwesome5 name="chevron-right" size={14} color="#666" />
      )}
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
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
        <Text style={styles.title}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="GERAL">
          <SettingItem
            icon="bell"
            title="Notificações"
            subtitle="Receber alertas sobre exames"
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="moon"
            title="Modo Escuro"
            subtitle="Tema escuro para a interface"
            type="switch"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="save"
            title="Auto-Salvamento"
            subtitle="Salvar dados automaticamente"
            type="switch"
            value={autoSaveEnabled}
            onValueChange={setAutoSaveEnabled}
          />
        </SettingSection>

        <SettingSection title="DADOS">
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem
              icon="cloud-upload-alt"
              title="Backup"
              subtitle="Fazer backup dos dados"
              type="arrow"
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem
              icon="download"
              title="Restaurar"
              subtitle="Restaurar dados do backup"
              type="arrow"
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem
              icon="trash-alt"
              title="Limpar Dados"
              subtitle="Excluir todos os dados locais"
              type="arrow"
            />
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="SOBRE">
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Sobre')}
          >
            <SettingItem
              icon="info-circle"
              title="Sobre o Aplicativo"
              subtitle="Informações e créditos"
              type="arrow"
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem
              icon="shield-alt"
              title="Privacidade"
              subtitle="Política de privacidade"
              type="arrow"
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem
              icon="file-contract"
              title="Termos de Uso"
              subtitle="Termos e condições"
              type="arrow"
            />
          </TouchableOpacity>
        </SettingSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3f52',
    marginLeft: 64,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: '#666',
  },
});

export default ConfiguracoesScreen;
