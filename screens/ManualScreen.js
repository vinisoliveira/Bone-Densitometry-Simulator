import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';

const ManualScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const Section = ({ number, title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>{number}. {title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SubSection = ({ number, title, children }) => (
    <View style={styles.subSection}>
      <Text style={[styles.subSectionTitle, { color: theme.text }]}>{number} {title}</Text>
      {children}
    </View>
  );

  const BulletItem = ({ text, bold, emoji }) => (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: theme.textMuted }]}>•</Text>
      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
        {bold ? <Text style={{ fontWeight: '700', color: theme.text }}>{bold}</Text> : null}
        {bold ? ' ' : null}
        {emoji ? <Text>{emoji} </Text> : null}
        {text}
      </Text>
    </View>
  );

  const NumberedItem = ({ number, text }) => (
    <View style={styles.bulletRow}>
      <Text style={[styles.numberedIndex, { color: '#4A90E2' }]}>{number}.</Text>
      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );

  const InfoBox = ({ children }) => (
    <View style={[styles.infoBox, { backgroundColor: theme.isDark ? '#1e2a1e' : '#f0faf0', borderColor: theme.isDark ? '#2d4a2d' : '#c3e6cb' }]}>
      {children}
    </View>
  );

  const TableRow = ({ exam, roi, feature, isHeader }) => (
    <View style={[styles.tableRow, isHeader && { backgroundColor: theme.isDark ? '#1a5276' : '#2980b9' }, !isHeader && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
      <Text style={[styles.tableCell, isHeader && styles.tableHeaderText, !isHeader && { color: theme.text }]}>{exam}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }, isHeader && styles.tableHeaderText, !isHeader && { color: theme.textSecondary }]}>{roi}</Text>
      <Text style={[styles.tableCell, isHeader && styles.tableHeaderText, !isHeader && { color: theme.textSecondary }]}>{feature}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.isDark ? '#2a3142' : '#e8eaf6' }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Manual do Aplicativo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="book" size={36} color="#667eea" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Bone Densitometry Simulator</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Manual Completo — Versão 1.0</Text>
        </View>

        <View style={[styles.badgeBox, { backgroundColor: theme.isDark ? '#3a3020' : '#fff3cd', borderColor: theme.isDark ? '#6b5a2e' : '#ffc107' }]}>
          <FontAwesome5 name="graduation-cap" size={14} color="#ffc107" style={{ marginRight: 8 }} />
          <Text style={[styles.badgeText, { color: theme.isDark ? '#ffd966' : '#856404' }]}>
            APLICATIVO EDUCACIONAL PARA ESTUDO DE DENSITOMETRIA ÓSSEA
          </Text>
        </View>

        <Section number="1" title="Introdução">
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            O <Text style={{ fontWeight: '700', color: theme.text }}>Bone Densitometry Simulator</Text> é um aplicativo educacional que simula o fluxo completo de um exame de densitometria óssea por DXA (Dual-Energy X-ray Absorptiometry), desde o cadastro do paciente até a geração do relatório final.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginTop: 8 }]}>
            Desenvolvido para estudantes e profissionais de radiologia, o app reproduz a interface e os cálculos de equipamentos reais como o <Text style={{ fontWeight: '700', color: theme.text }}>Hologic Discovery™ QDR® Series</Text>.
          </Text>
          <InfoBox>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <FontAwesome5 name="exclamation-triangle" size={14} color="#e67e22" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[styles.infoText, { color: theme.isDark ? '#f0c080' : '#7d4e00' }]}>
                <Text style={{ fontWeight: '700' }}>Importante:</Text> Este aplicativo é exclusivamente para fins educacionais. Não possui validade clínica e não substitui equipamentos reais certificados pela ANVISA/FDA.
              </Text>
            </View>
          </InfoBox>
        </Section>

        <Section number="2" title="Telas e Funcionalidades">

          <SubSection number="2.1" title="Tela Inicial (Home)">
            <BulletItem bold="Novo Exame:" text="Inicia o cadastro de um novo paciente e exame" />
            <BulletItem bold="Lista de Exames:" text="Visualiza todos os exames realizados" />
            <BulletItem bold="Configurações:" text="Ajustes do aplicativo, backups e documentos" />
            <BulletItem bold="Sobre:" text="Informações do projeto e equipe" />
          </SubSection>

          <SubSection number="2.2" title="Cadastro do Paciente">
            <BulletItem text="Nome completo, data de nascimento (cálculo automático de idade)" />
            <BulletItem text="Sexo (Masculino/Feminino), etnia, peso e altura" />
            <BulletItem text="Cálculo automático de IMC" />
            <BulletItem text="Seleção do tipo de exame: Coluna Lombar, Fêmur, Punho ou Corpo Total" />
            <BulletItem text="Seleção de imagem do exame (galeria ou câmera)" />
            <BulletItem text="Nome do operador/técnico" />
            <BulletItem text="Data e hora automáticas" />
          </SubSection>

          <SubSection number="2.3" title="Simulação de Escaneamento (Scan)">
            <BulletItem text="Animação de varredura simulada (scan line)" />
            <BulletItem text="Barra de progresso e indicador de status" />
            <BulletItem text="Duração de 4 segundos (simulação educacional)" />
            <BulletItem text="Redirecionamento automático para a tela de análise correta" />
          </SubSection>

          <SubSection number="2.4" title="Telas de Análise DXA (4 tipos)">
            <Text style={[styles.paragraph, { color: theme.textSecondary, marginBottom: 8 }]}>
              Cada tipo de exame possui sua tela de análise específica:
            </Text>
            <View style={[styles.table, { borderColor: theme.border }]}>
              <TableRow exam="Exame" roi="Regiões de Interesse (ROI)" feature="Características" isHeader />
              <TableRow exam="Coluna Lombar" roi="L1, L2, L3, L4" feature="Análise vertebral AP" />
              <TableRow exam="Fêmur Proximal" roi="Colo, Trocânter, Ward, Total" feature="Avaliação FRAX®" />
              <TableRow exam="Punho/Antebraço" roi="Ultra Distal, MID, 1/3, Total" feature="Análise rádio/ulna" />
              <TableRow exam="Corpo Total" roi="Cabeça, Braços, Tronco, Pelve, Pernas" feature="Composição corporal" />
            </View>
          </SubSection>

          <SubSection number="2.5" title="Ferramentas de Análise">
            <BulletItem bold="Seletor (Select):" text="Selecionar regiões de interesse" />
            <BulletItem bold="Pan:" text="Mover a imagem" />
            <BulletItem bold="Zoom In/Out:" text="Ampliar ou reduzir a imagem" />
            <BulletItem bold="ROI (Region of Interest):" text="Posicionar e redimensionar os retângulos de análise" />
            <BulletItem bold="Brilho:" text="Ajustar brilho da imagem" />
            <BulletItem bold="Contraste:" text="Ajustar contraste da imagem" />
            <BulletItem bold="Reset:" text="Restaurar posições originais dos ROI" />
            <BulletItem bold="Slider de Tamanho ROI:" text="Ajustar o tamanho das regiões de interesse" />
          </SubSection>

          <SubSection number="2.6" title="Dados Calculados por Região">
            <BulletItem bold="BMD (g/cm²):" text="Densidade Mineral Óssea" />
            <BulletItem bold="T-Score:" text="Comparação com adulto jovem saudável (referência OMS)" />
            <BulletItem bold="Z-Score:" text="Comparação com mesma faixa etária e sexo" />
            <BulletItem bold="Classificação OMS:" text="Normal (T≥-1), Osteopenia (-2.5≤T<-1), Osteoporose (T<-2.5)" />
          </SubSection>

          <SubSection number="2.7" title="Relatório PDF">
            <BulletItem text="Relatório específico para cada tipo de exame" />
            <BulletItem text="Dados do paciente, informações do exame e operador" />
            <BulletItem text="Tabela de resultados por região" />
            <BulletItem text="Gráfico de T-Score vs Idade com zonas de classificação" />
            <BulletItem text="Interpretação e recomendações clínicas" />
            <BulletItem text="Download direto do PDF para compartilhar" />
            <BulletItem text="Aviso educacional em destaque" />
          </SubSection>

          <SubSection number="2.8" title="Lista de Exames">
            <BulletItem text="Visualização de todos os exames cadastrados" />
            <BulletItem text="Filtro por tipo de exame" />
            <BulletItem text="Acesso aos detalhes de cada exame" />
            <BulletItem text="Exclusão individual de exames" />
          </SubSection>

          <SubSection number="2.9" title="Detalhes do Exame">
            <BulletItem text="Dados completos do paciente e exame" />
            <BulletItem text="Imagem do exame (quando disponível)" />
            <BulletItem text="Botão para editar/reanalisar na tela de DXA" />
            <BulletItem text="Geração de relatório PDF" />
            <BulletItem text="Exclusão do exame" />
          </SubSection>

          <SubSection number="2.10" title="Configurações">
            <BulletItem text="Modo escuro/claro" />
            <BulletItem text="Notificações" />
            <BulletItem text="Criar, restaurar e gerenciar backups" />
            <BulletItem text="Limpar dados (preserva backups)" />
            <BulletItem text="Manual do aplicativo" />
            <BulletItem text="Política de privacidade e Termos de uso" />
          </SubSection>

          <SubSection number="2.11" title="Backups">
            <BulletItem text="Criação de backups com dados e imagens" />
            <BulletItem text="Listagem com data, hora e quantidade de pacientes" />
            <BulletItem text="Restauração com confirmação" />
            <BulletItem text="Exclusão individual de backups" />
          </SubSection>
        </Section>

        <Section number="3" title="Base Científica">
          <InfoBox>
            <Text style={[styles.infoLabel, { color: theme.text }]}>Padrões utilizados:</Text>
            <BulletItem text="Classificação OMS para osteoporose (T-Score)" />
            <BulletItem text="Referências ISCD (International Society for Clinical Densitometry)" />
            <BulletItem text="Formato de relatório baseado no Hologic Discovery™ QDR® Series" />
            <BulletItem text="Curvas de referência populacionais por tipo de exame" />
            <BulletItem text="Cálculos de BMD, BMC, T-Score e Z-Score" />
          </InfoBox>
        </Section>

        <Section number="4" title="Tipos de Exame Suportados">
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginBottom: 8 }]}>
            O simulador reproduz os 4 principais tipos de exame de densitometria óssea:
          </Text>
          <BulletItem bold="Coluna Lombar (AP Spine L1-L4):" text="Exame mais comum, avalia vértebras lombares" />
          <BulletItem bold="Fêmur Proximal (Hip):" text="Avalia colo femoral, trocânter e Triângulo de Ward" />
          <BulletItem bold="Punho/Antebraço (Forearm):" text="Avalia rádio distal e ulna" />
          <BulletItem bold="Corpo Total (Whole Body):" text="Avaliação completa com composição corporal" />
        </Section>

        <Section number="5" title="Fluxo de Uso">
          <NumberedItem number="1" text="Abrir o app → Tela Inicial" />
          <NumberedItem number="2" text={'Clicar em “Novo Exame” → Cadastrar paciente'} />
          <NumberedItem number="3" text="Preencher dados, selecionar tipo de exame e imagem" />
          <NumberedItem number="4" text="Salvar → Animação de scan" />
          <NumberedItem number="5" text="Tela de análise DXA → Usar ferramentas para posicionar ROIs" />
          <NumberedItem number="6" text={'Selecionar região → Clicar “Salvar Exame”'} />
          <NumberedItem number="7" text="Ir para Lista de Exames → Clicar no exame" />
          <NumberedItem number="8" text="Ver Detalhes → Gerar Relatório PDF → Baixar" />
        </Section>

        <Section number="6" title="Equipe de Desenvolvimento">
          <BulletItem text="Projeto acadêmico do curso de Radiologia" />
          <BulletItem text="Desenvolvido com React Native / Expo" />
          <BulletItem text="Referências: Manual técnico Hologic Discovery QDR Series (080-1085)" />
        </Section>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Bone Densitometry Simulator v1.0</Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>Aplicativo exclusivamente educacional</Text>
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
  appName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  badgeBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  badgeText: { flex: 1, fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, borderBottomWidth: 2, paddingBottom: 6 },
  sectionContent: {},
  subSection: { marginBottom: 16 },
  subSectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  paragraph: { fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', marginTop: 5, paddingLeft: 4 },
  bullet: { fontSize: 14, marginRight: 8, lineHeight: 22 },
  numberedIndex: { fontSize: 14, marginRight: 8, lineHeight: 22, fontWeight: '700', minWidth: 20 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
  infoBox: { borderRadius: 8, borderWidth: 1, padding: 12, marginTop: 10, marginBottom: 4 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 22 },
  infoLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  table: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, marginTop: 4 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, padding: 8, fontSize: 12, lineHeight: 18 },
  tableHeaderText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  footer: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, marginTop: 12 },
  footerText: { fontSize: 13, color: '#666', fontWeight: '600' },
  footerSub: { fontSize: 12, marginTop: 4 },
});

export default ManualScreen;
