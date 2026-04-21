import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';

const TermosDeUsoScreen = ({ navigation }) => {
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
        <Text style={[styles.title, { color: theme.text }]}>Termos de Uso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="file-contract" size={36} color="#667eea" />
          </View>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Bone Densitometry Simulator — Versão 1.0</Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: theme.isDark ? '#3a3020' : '#fff3cd', borderColor: theme.isDark ? '#6b5a2e' : '#ffc107' }]}>
          <FontAwesome5 name="exclamation-triangle" size={16} color="#ffc107" style={{ marginRight: 10 }} />
          <Text style={[styles.warningText, { color: theme.isDark ? '#ffd966' : '#856404' }]}>
            Este aplicativo é EXCLUSIVAMENTE EDUCACIONAL. Não possui nenhuma validade clínica, diagnóstica ou médica.
          </Text>
        </View>

        <Section number="1" title="Aceitação dos Termos">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Ao utilizar o Bone Densitometry Simulator ("App"), você concorda com estes termos de uso. Se não concordar, não utilize o aplicativo.
          </Text>
        </Section>

        <Section number="2" title="Finalidade do App">
          <BulletItem text="O App é uma ferramenta educacional para estudantes de radiologia e áreas da saúde" />
          <BulletItem text="Simula o fluxo de trabalho de um exame de densitometria óssea (DXA)" />
          <BulletItem text="Os valores calculados são simulações para fins didáticos" />
          <BulletItem text="Baseado no formato do equipamento Hologic Discovery™ QDR® Series" />
        </Section>

        <Section number="3" title="Limitações">
          <BulletItem bold="NÃO é um dispositivo médico" text="e não está registrado na ANVISA ou FDA" />
          <BulletItem bold="NÃO substitui" text="exames reais realizados em equipamentos certificados" />
          <BulletItem bold="NÃO deve ser usado" text="para diagnóstico, tratamento ou decisão clínica" />
          <BulletItem text="Os resultados são simulados e não refletem condições reais de saúde" />
          <BulletItem text="Nenhum raio-X real é emitido pelo aplicativo" />
        </Section>

        <Section number="4" title="Uso Adequado">
          <BulletItem text="Estudo e aprendizado de densitometria óssea" />
          <BulletItem text="Prática em sala de aula sob supervisão de professores" />
          <BulletItem text="Familiarização com o fluxo de trabalho DXA" />
          <BulletItem text="Compreensão de resultados e classificações OMS" />
        </Section>

        <Section number="5" title="Uso Proibido">
          <BulletItem text="Diagnóstico médico real de pacientes" />
          <BulletItem text="Substituição de exames em equipamentos certificados" />
          <BulletItem text="Distribuição de relatórios como se fossem documentos clínicos reais" />
          <BulletItem text="Uso comercial sem autorização" />
        </Section>

        <Section number="6" title="Propriedade Intelectual">
          <BulletItem text="O App é um projeto acadêmico de código aberto" />
          <BulletItem text="Hologic™, Discovery™ e QDR® são marcas registradas da Hologic, Inc." />
          <BulletItem text="O uso dessas referências é exclusivamente educacional" />
        </Section>

        <Section number="7" title="Isenção de Responsabilidade">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Os desenvolvedores <Text style={{ fontWeight: '700', color: theme.text }}>não se responsabilizam</Text> por qualquer uso indevido do aplicativo, incluindo mas não limitado a:
          </Text>
          <BulletItem text="Diagnósticos baseados em dados simulados" />
          <BulletItem text="Decisões clínicas tomadas com base nos relatórios gerados" />
          <BulletItem text="Perda de dados armazenados no dispositivo" />
        </Section>

        <Section number="8" title="Alterações">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Estes termos podem ser atualizados em versões futuras.
          </Text>
        </Section>

        <Section number="9" title="Aceitação">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            O uso continuado do aplicativo implica na aceitação destes termos.
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
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  warningText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
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

export default TermosDeUsoScreen;
