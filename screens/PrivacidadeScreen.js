import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';

const PrivacidadeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const Section = ({ number, title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>{number}. {title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const BulletItem = ({ text, bold }) => (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: theme.textMuted }]}>•</Text>
      {bold ? (
        <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: theme.text }}>{bold}</Text> {text}
        </Text>
      ) : (
        <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.isDark ? '#2a3142' : '#e8eaf6' }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Política de Privacidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconContainer]}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="shield-alt" size={36} color="#667eea" />
          </View>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Bone Densitometry Simulator — Versão 1.0</Text>
        </View>

        <Section number="1" title="Introdução">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            O Bone Densitometry Simulator ("App") é um aplicativo educacional que simula exames de densitometria óssea. Esta política descreve como tratamos os dados no aplicativo.
          </Text>
        </Section>

        <Section number="2" title="Dados Coletados">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            O App opera <Text style={{ fontWeight: '700', color: theme.text }}>100% offline</Text> e <Text style={{ fontWeight: '700', color: theme.text }}>não coleta, transmite ou armazena dados em servidores externos</Text>.
          </Text>
          <BulletItem bold="Todos os dados" text="ficam armazenados apenas no dispositivo do usuário" />
          <BulletItem text="Não há criação de contas ou login" />
          <BulletItem text="Não há rastreamento, analytics ou telemetria" />
          <BulletItem text="Não há cookies ou identificadores persistentes" />
        </Section>

        <Section number="3" title="Dados Inseridos pelo Usuário">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Os dados inseridos (nomes, idades, imagens) são <Text style={{ fontWeight: '700', color: theme.text }}>fictícios para fins de estudo</Text> e ficam armazenados localmente usando AsyncStorage do dispositivo.
          </Text>
          <BulletItem text="Nomes de pacientes fictícios" />
          <BulletItem text="Dados biométricos simulados" />
          <BulletItem text="Imagens selecionadas da galeria" />
        </Section>

        <Section number="4" title="Armazenamento">
          <BulletItem text="Os dados são armazenados no dispositivo via AsyncStorage" />
          <BulletItem text="Backups são salvos localmente no dispositivo" />
          <BulletItem text="O usuário pode excluir todos os dados a qualquer momento nas Configurações" />
          <BulletItem text="A desinstalação do app remove todos os dados" />
        </Section>

        <Section number="5" title="Compartilhamento">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            O App permite gerar PDFs de relatórios. O compartilhamento desses PDFs é de responsabilidade do usuário. O App não envia dados automaticamente para nenhum destino.
          </Text>
        </Section>

        <Section number="6" title="Permissões">
          <BulletItem bold="Câmera/Galeria:" text="Para selecionar imagens de exames (uso offline)" />
          <BulletItem bold="Armazenamento:" text="Para salvar PDFs e backups no dispositivo" />
        </Section>

        <Section number="7" title="Segurança">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Como o App é offline e educacional, não há riscos de vazamento de dados por rede. Os dados são tão seguros quanto o próprio dispositivo do usuário.
          </Text>
        </Section>

        <Section number="8" title="Alterações">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Esta política pode ser atualizada em versões futuras do aplicativo.
          </Text>
        </Section>

        <Section number="9" title="Contato">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Para dúvidas sobre privacidade, entre em contato com a equipe de desenvolvimento do projeto acadêmico.
          </Text>
        </Section>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Bone Densitometry Simulator v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a3142', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  iconContainer: { alignItems: 'center', paddingVertical: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(102,126,234,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2980b9', paddingBottom: 6 },
  sectionContent: {},
  paragraph: { fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', marginTop: 6, paddingLeft: 4 },
  bullet: { fontSize: 14, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
  footer: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, borderTopColor: '#3a3f52', marginTop: 12 },
  footerText: { fontSize: 13, color: '#666' },
});

export default PrivacidadeScreen;
