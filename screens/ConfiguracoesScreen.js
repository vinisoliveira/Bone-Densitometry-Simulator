import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deletarTodosPacientes, limparCache, criarBackup, listarBackups, restaurarBackup,
} from '../utils/storage';
import CustomAlert from '../src/components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import { useTheme } from '../src/contexts/ThemeContext';

const ConfiguracoesScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();

  const handleCriarBackup = async () => {
    try {
      const novoBackup = await criarBackup();
      showAlert({
        title: 'Backup Criado', type: 'success', buttons: [{ text: 'OK' }],
        message: `Backup "${novoBackup.nome}" criado!\n• ${novoBackup.totalPacientes} pacientes\n• ${novoBackup.totalImagens} imagens`,
      });
    } catch (error) {
      showAlert({ title: 'Erro', message: 'Não foi possível criar o backup.', type: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  const handleRestaurarBackup = async () => {
    try {
      const backups = await listarBackups();
      if (backups.length === 0) {
        showAlert({ title: 'Nenhum Backup', message: 'Crie um backup primeiro.', type: 'info', buttons: [{ text: 'OK' }] });
        return;
      }
      navigation.navigate('Backups');
    } catch (error) {
      showAlert({ title: 'Erro', message: 'Erro ao carregar backups.', type: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  const handleClearData = () => {
    showAlert({
      title: 'Limpar Dados', type: 'warning',
      message: 'Excluir todos os exames? Backups NÃO serão afetados.',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar', style: 'destructive',
          onPress: async () => {
            try {
              await deletarTodosPacientes();
              await limparCache();
              hideAlert();
              setTimeout(() => showAlert({ title: 'Sucesso', message: 'Dados removidos. Backups mantidos.', type: 'success', buttons: [{ text: 'OK' }] }), 300);
            } catch (error) {
              hideAlert();
              setTimeout(() => showAlert({ title: 'Erro', message: 'Erro ao limpar dados.', type: 'error', buttons: [{ text: 'OK' }] }), 300);
            }
          },
        },
      ],
    });
  };

  const SettingItem = ({ icon, title, subtitle, type, value, onValueChange, loading }) => (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: theme.isDark ? '#1e2235' : '#e8eaf6' }]}><FontAwesome5 name={icon} size={20} color="#667eea" /></View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
      {type === 'switch' && <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#3a3f52', true: '#4A90E2' }} thumbColor={value ? '#FFF' : '#999'} />}
      {type === 'arrow' && !loading && <FontAwesome5 name="chevron-right" size={14} color={theme.textMuted} />}
      {loading && <ActivityIndicator size="small" color="#4A90E2" />}
    </View>
  );

  const SettingDivider = () => <View style={[styles.divider, { backgroundColor: theme.border }]} />;

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}><Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text><View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>{children}</View></View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.isDark ? '#2a3142' : '#e8eaf6' }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SettingSection title="GERAL">
          <SettingItem icon="moon" title="Modo Escuro" subtitle="Tema escuro para a interface" type="switch" value={isDark} onValueChange={toggleTheme} />
        </SettingSection>

        <SettingSection title="DADOS">
          <TouchableOpacity activeOpacity={0.7} onPress={handleCriarBackup}><SettingItem icon="cloud-upload-alt" title="Criar Backup" subtitle="Salvar dados e imagens atuais" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={handleRestaurarBackup}><SettingItem icon="download" title="Restaurar Backup" subtitle="Restaurar dados de um backup" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Backups')}><SettingItem icon="archive" title="Gerenciar Backups" subtitle="Ver, restaurar ou excluir backups" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={handleClearData}><SettingItem icon="trash-alt" title="Limpar Dados" subtitle="Excluir exames (não afeta backups)" type="arrow" /></TouchableOpacity>
        </SettingSection>

        <SettingSection title="SOBRE">
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Manual')}><SettingItem icon="book" title="Manual do Aplicativo" subtitle="Todas as funções do aplicativo" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Sobre')}><SettingItem icon="info-circle" title="Sobre o Aplicativo" subtitle="Informações e créditos" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Privacidade')}><SettingItem icon="shield-alt" title="Privacidade" subtitle="Política de privacidade" type="arrow" /></TouchableOpacity>
          <SettingDivider />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('TermosDeUso')}><SettingItem icon="file-contract" title="Termos de Uso" subtitle="Termos e condições" type="arrow" /></TouchableOpacity>
        </SettingSection>

        <View style={[styles.versionContainer]}><Text style={[styles.versionText, { color: theme.textMuted }]}>Versão 1.0.0</Text></View>
      </ScrollView>
      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#1a1d29'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:50,paddingHorizontal:20,paddingBottom:20},
  backButton:{width:40,height:40,borderRadius:20,backgroundColor:'#2a3142',justifyContent:'center',alignItems:'center'},
  title:{fontSize:20,fontWeight:'700',color:'#FFF'},
  scrollView:{flex:1},scrollContent:{paddingHorizontal:20,paddingBottom:40},
  section:{marginBottom:24},
  sectionTitle:{fontSize:12,fontWeight:'700',color:'#666',marginBottom:12,letterSpacing:1},
  sectionCard:{backgroundColor:'#2a3142',borderRadius:12,overflow:'hidden'},
  settingItem:{flexDirection:'row',alignItems:'center',padding:16},
  settingIcon:{width:36,height:36,borderRadius:18,backgroundColor:'rgba(74,144,226,0.15)',justifyContent:'center',alignItems:'center',marginRight:12},
  settingContent:{flex:1},
  settingTitle:{fontSize:15,fontWeight:'600',color:'#FFF',marginBottom:2},
  settingSubtitle:{fontSize:13,color:'#999'},
  divider:{height:1,backgroundColor:'#3a3f52',marginLeft:64},
  versionContainer:{alignItems:'center',paddingVertical:24},
  versionText:{fontSize:13,color:'#666'},
});

export default ConfiguracoesScreen;
