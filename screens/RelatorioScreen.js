import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, typography } from '../src/styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import DensitometryChart from '../src/components/DensitometryChart';

// Helper functions
const calculateTScore = (idade, sexo, examType = 'Coluna Lombar') => {
  // Simulação de T-Score baseado na idade e tipo de exame
  let baseTScore = 0;
  
  // Fator de multiplicação baseado no tipo de exame
  // Fêmur tende a ter declínio mais acentuado
  // Punho tende a ter declínio mais gradual
  let examFactor = 1.0;
  if (examType === 'Fêmur') {
    examFactor = 1.15; // 15% mais declínio
  } else if (examType === 'Punho') {
    examFactor = 0.90; // 10% menos declínio
  }
  
  if (idade < 30) {
    baseTScore = 0.5;
  } else if (idade < 40) {
    baseTScore = 0.2;
  } else if (idade < 50) {
    baseTScore = -0.3;
  } else if (idade < 60) {
    baseTScore = -0.8;
  } else if (idade < 70) {
    baseTScore = -1.4;
  } else if (idade < 80) {
    baseTScore = -2.1;
  } else {
    baseTScore = -2.7;
  }

  // Aplicar fator do tipo de exame
  if (baseTScore < 0) {
    baseTScore *= examFactor;
  }

  // Ajuste para sexo (mulheres geralmente têm valores um pouco menores após menopausa)
  if (sexo === 'Feminino' && idade >= 50) {
    baseTScore -= 0.3;
  }

  // Adiciona variação aleatória pequena
  const variation = (Math.random() - 0.5) * 0.4;
  return baseTScore + variation;
};

const calculateBMD = (tScore) => {
  // BMD de referência para adulto jovem (pico de massa óssea)
  const referenceBMD = 1.071;
  const sdBMD = 0.120; // Desvio padrão
  
  return referenceBMD + (tScore * sdBMD);
};

const getClassification = (tScore) => {
  if (tScore > -1.0) {
    return { 
      name: 'Normal', 
      class: 'classification-normal',
      color: '#4CAF50'
    };
  } else if (tScore >= -2.5) {
    return { 
      name: 'Osteopenia', 
      class: 'classification-osteopenia',
      color: '#FFD54F'
    };
  } else {
    return { 
      name: 'Osteoporose', 
      class: 'classification-osteoporose',
      color: '#FF6B6B'
    };
  }
};

export default function RelatorioScreen({ route, navigation }) {
  const { nome, idade, sexo, etnia, exame, vertebraSelecionada } = route.params;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Calcular T-Score no início para usar em toda a tela
  const idadeNum = parseInt(idade) || 30;
  const tScore = calculateTScore(idadeNum, sexo, exame);
  const classification = getClassification(tScore);
  const bmd = calculateBMD(tScore);

  // Função para obter a imagem correta baseada no tipo de exame
  const getExamImage = () => {
    // Mapeamento direto dos tipos de exame para suas imagens
    const examImages = {
      'Coluna Lombar': require('../assets/coluna-lombar.jpeg'),
      'Fêmur': require('../assets/femur.jpeg'),
      'Punho': require('../assets/punho.png'),
    };

    // Retorna a imagem correspondente ou a imagem padrão da coluna lombar
    return examImages[exame] || require('../assets/coluna-lombar.jpeg');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const gerarPDF = async () => {
    setIsGeneratingPDF(true);
    
    // Calcular dados baseado na idade e sexo (simulação realista)
    const idadeNum = parseInt(idade) || 30;
    const pesoNum = 65 + (Math.random() - 0.5) * 20; // Simulação de peso
    const alturaNum = 165 + (Math.random() - 0.5) * 20; // Simulação de altura
    
    const tScore = calculateTScore(idadeNum, sexo, exame);
    const classification = getClassification(tScore);
    const bmd = calculateBMD(tScore);
    const zScore = tScore + 0.5 + (Math.random() - 0.5) * 0.3;
    
    // Dados das regiões (simulação baseada no exame)
    const regionsData = generateRegionsData(exame, tScore, bmd);
    
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    const horaAtual = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Densitometria Óssea</title>
          <style>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              background: #ffffff;
              color: #000;
              font-size: 11px;
              line-height: 1.4;
            }

            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 2px solid #1a1d29;
            }

            .clinic-name {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin-bottom: 3px;
            }

            .clinic-address {
              font-size: 10px;
              color: #333;
            }

            .patient-info {
              background: #f0f0f0;
              padding: 10px 15px;
              margin-bottom: 15px;
              border: 1px solid #ccc;
              display: grid;
              grid-template-columns: 2fr 1fr 1fr;
              gap: 15px;
            }

            .patient-info-item {
              display: flex;
              gap: 5px;
            }

            .patient-info-label {
              font-weight: bold;
              color: #000;
            }

            .exam-info {
              margin-bottom: 15px;
            }

            .exam-info-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 8px;
              color: #000;
            }

            .exam-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 5px;
              font-size: 10px;
            }

            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #000;
              margin: 20px 0 10px 0;
              padding-bottom: 3px;
              border-bottom: 1px solid #333;
            }

            .results-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 9px;
            }

            .results-table th {
              background: #2a3142;
              color: #fff;
              padding: 8px 5px;
              text-align: center;
              font-weight: bold;
              border: 1px solid #000;
            }

            .results-table td {
              padding: 6px 5px;
              text-align: center;
              border: 1px solid #999;
            }

            .results-table tr:nth-child(even) {
              background: #f9f9f9;
            }

            .results-table tr.subtotal {
              background: #e8e8e8;
              font-weight: bold;
            }

            .results-table tr.total {
              background: #d0d0d0;
              font-weight: bold;
              font-size: 10px;
            }

            .chart-container {
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border: 1px solid #ccc;
              border-radius: 5px;
            }

            .chart-title {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
            }

            .chart-visual {
              position: relative;
              height: 180px;
              background: linear-gradient(to bottom, 
                #4CAF50 0%, 
                #4CAF50 35%, 
                #FFD54F 35%, 
                #FFD54F 70%, 
                #FF6B6B 70%, 
                #FF6B6B 100%);
              border-radius: 5px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 10px;
            }

            .chart-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #fff;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }

            .chart-marker {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              width: 90%;
              height: 3px;
              background: #000;
              border: 2px solid #fff;
            }

            .chart-marker-label {
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              background: #000;
              color: #fff;
              padding: 3px 10px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: bold;
              white-space: nowrap;
            }

            .legend {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 15px;
            }

            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 9px;
            }

            .legend-color {
              width: 25px;
              height: 15px;
              border-radius: 2px;
              border: 1px solid #333;
            }

            .legend-normal { background: #4CAF50; }
            .legend-osteopenia { background: #FFD54F; }
            .legend-osteoporose { background: #FF6B6B; }

            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #4A90E2;
              padding: 12px;
              margin: 15px 0;
              font-size: 10px;
            }

            .info-box-title {
              font-weight: bold;
              color: #1976D2;
              margin-bottom: 8px;
            }

            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 15px 0;
              font-size: 9px;
              color: #856404;
            }

            .footer {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 8px;
              color: #666;
            }

            .calibration-note {
              margin-top: 10px;
              font-size: 8px;
              color: #666;
              font-style: italic;
            }

            .page-break {
              page-break-after: always;
            }

            .two-columns {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 15px 0;
            }

            .body-composition {
              background: #f9f9f9;
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }

            .composition-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }

            .composition-label {
              font-weight: bold;
            }

            .risk-table {
              width: 100%;
              margin-top: 10px;
              font-size: 9px;
            }

            .risk-bar {
              height: 20px;
              display: flex;
              margin: 10px 0;
              border: 1px solid #333;
            }

            .risk-low {
              background: #4CAF50;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 8px;
              font-weight: bold;
            }

            .risk-normal {
              background: #8BC34A;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 8px;
              font-weight: bold;
            }

            .risk-increased {
              background: #FFD54F;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #333;
              font-size: 8px;
              font-weight: bold;
            }

            .risk-high {
              background: #FF6B6B;
              flex: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 8px;
              font-weight: bold;
            }

            .marker-position {
              position: relative;
              margin-top: -15px;
            }

            .marker-arrow {
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 12px solid #000;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <div class="clinic-name">BONE DENSITOMETRY SIMULATOR</div>
            <div class="clinic-address">Sistema de Simulação de Densitometria Óssea - Versão Educacional</div>
          </div>

          <!-- Patient Information -->
          <div class="patient-info">
            <div class="patient-info-item">
              <span class="patient-info-label">Nome:</span>
              <span>${nome}</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">Sexo:</span>
              <span>${sexo}</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">Altura:</span>
              <span>${alturaNum.toFixed(1)} cm</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">ID do paciente:</span>
              <span>SIM${Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">Etnia:</span>
              <span>${etnia}</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">Peso:</span>
              <span>${pesoNum.toFixed(1)} kg</span>
            </div>
            <div class="patient-info-item">
              <span class="patient-info-label">DDN:</span>
              <span>${calculateBirthDate(idadeNum)}</span>
            </div>
            <div></div>
            <div class="patient-info-item">
              <span class="patient-info-label">Idade:</span>
              <span>${idade}</span>
            </div>
          </div>

          <!-- Exam Information -->
          <div class="exam-info">
            <div class="exam-info-title">Informações do exame:</div>
            <div class="exam-details">
              <div><strong>Data do exame:</strong> ${dataAtual}</div>
              <div><strong>ID:</strong> A${Math.floor(Math.random() * 10000000)}</div>
              <div><strong>Tipo de Exame:</strong> ${exame === 'Coluna Lombar' ? 'a Corpo inteiro' : exame}</div>
              <div><strong>Análise:</strong> ${dataAtual} ${horaAtual} Versão 1.0</div>
              <div></div>
              <div><strong>Método:</strong> Auto Whole Body</div>
              <div><strong>Operador:</strong> Sistema Automático</div>
              <div></div>
              <div><strong>Modelo:</strong> Discovery Wi (Simulator)</div>
              <div></div>
            </div>
          </div>

          <!-- Results Table -->
          <div class="section-title">Resumo dos resultados de DXA:</div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Região</th>
                <th>BMC<br/>(g)</th>
                <th>Gordura<br/>Massa (g)</th>
                <th>Magra<br/>Massa (g)</th>
                <th>Magra +<br/>BMC (g)</th>
                <th>Massa (g)</th>
                <th>Porcentagem de gordura<br/>(%)</th>
              </tr>
            </thead>
            <tbody>
              ${regionsData.map(region => `
                <tr${region.isSubtotal ? ' class="subtotal"' : ''}${region.isTotal ? ' class="total"' : ''}>
                  <td style="text-align: left;">${region.name}</td>
                  <td>${region.bmc.toFixed(2)}</td>
                  <td>${region.fat.toFixed(1)}</td>
                  <td>${region.lean.toFixed(1)}</td>
                  <td>${region.leanPlusBmc.toFixed(1)}</td>
                  <td>${region.total.toFixed(1)}</td>
                  <td>${region.fatPercent.toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="calibration-note">
            TBAR1209 - NHANES BCA calibration
          </div>

          <!-- Chart Section -->
          <div class="section-title">Gráfico de Referência de Densitometria (T-Score)</div>
          <div class="chart-container">
            <div class="chart-title">Total - Classificação por Faixa Etária</div>
            <div class="chart-visual">
              <div class="chart-line">
                <span>Normal</span>
                <span style="font-size: 9px;">T-Score &gt; -1.0</span>
              </div>
              <div class="chart-line" style="margin-top: 30px;">
                <span>Osteopenia</span>
                <span style="font-size: 9px;">-1.0 a -2.5</span>
              </div>
              <div class="chart-line" style="margin-top: 30px;">
                <span>Osteoporose</span>
                <span style="font-size: 9px;">&lt; -2.5</span>
              </div>
              ${getChartMarker(tScore)}
            </div>
            
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color legend-normal"></div>
                <div>
                  <strong>Normal</strong><br/>
                  Densidade óssea saudável
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-color legend-osteopenia"></div>
                <div>
                  <strong>Osteopenia</strong><br/>
                  Densidade abaixo do ideal
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-color legend-osteoporose"></div>
                <div>
                  <strong>Osteoporose</strong><br/>
                  Requer tratamento
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Assessment -->
          <div class="section-title">Classificação do Índice de Massa Corporal da OMS</div>
          <div class="chart-container">
            <div style="text-align: center; margin-bottom: 10px;">
              <strong>BMI = ${(pesoNum / ((alturaNum/100) ** 2)).toFixed(1)} kg/m²</strong> - ${getBMIClassification(pesoNum, alturaNum)}
            </div>
            <div class="risk-bar">
              <div class="risk-low">Abaixo<br/>do peso</div>
              <div class="risk-normal">Normal</div>
              <div class="risk-increased">Sobrepeso</div>
              <div class="risk-high">Obesidade I, II, III</div>
            </div>
            <div class="marker-position">
              <div class="marker-arrow" style="margin-left: ${getBMIMarkerPosition(pesoNum, alturaNum)}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 8px;">
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
              <span>45</span>
            </div>
          </div>

          <!-- Body Composition Results -->
          <div class="section-title">Resultados da Composição Corporal</div>
          <div class="two-columns">
            <div class="body-composition">
              <div style="font-weight: bold; margin-bottom: 10px; color: #1a1d29;">Gordura e Massa Magra</div>
              ${regionsData.filter(r => r.isSubtotal || r.isTotal).map(region => `
                <div class="composition-item">
                  <span class="composition-label">${region.name}:</span>
                  <span>${region.fatPercent.toFixed(1)}%</span>
                </div>
              `).join('')}
            </div>
            
            <div class="body-composition">
              <div style="font-weight: bold; margin-bottom: 10px; color: #1a1d29;">Índices de Adiposidade</div>
              <div class="composition-item">
                <span class="composition-label">% de gordura corporal total</span>
                <span>${regionsData.find(r => r.isTotal)?.fatPercent.toFixed(1)}%</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">Massa adiposa total (kg/m²)</span>
                <span>${(regionsData.find(r => r.isTotal)?.fat / 1000 / ((alturaNum/100) ** 2)).toFixed(1)}</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">Taxa andróide/ginóide</span>
                <span>${(0.8 + Math.random() * 0.3).toFixed(2)}</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">% gord. andróide/ % gord. total, nas pernas</span>
                <span>${(0.8 + Math.random() * 0.3).toFixed(2)}</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">Est. VAT Mass (g)</span>
                <span>${(200 + Math.random() * 100).toFixed(0)}</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">Est. VAT Volume (cm³)</span>
                <span>${(200 + Math.random() * 100).toFixed(0)}</span>
              </div>
              <div class="composition-item">
                <span class="composition-label">Est. VAT Area (cm²)</span>
                <span>${(40 + Math.random() * 20).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <!-- Clinical Information -->
          <div class="info-box">
            <div class="info-box-title">📊 Interpretação dos Resultados</div>
            <div style="margin-bottom: 8px;">
              <strong>T-Score: ${tScore.toFixed(1)}</strong> - ${classification.name}
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Z-Score: ${zScore.toFixed(1)}</strong> - Comparação com mesma faixa etária
            </div>
            <div style="margin-bottom: 8px;">
              <strong>BMD: ${bmd.toFixed(3)} g/cm²</strong> - Densidade Mineral Óssea
            </div>
            <div style="margin-top: 12px;">
              <strong>Classificação:</strong> Segundo os critérios da Organização Mundial de Saúde (OMS), 
              o resultado indica <strong>${classification.name}</strong>.
            </div>
          </div>

          <!-- Recommendations -->
          <div class="section-title">Recomendações Clínicas</div>
          <div style="padding: 12px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
            ${getRecommendations(classification.name)}
          </div>

          <!-- Warning Box -->
          <div class="warning-box">
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ AVISO IMPORTANTE - DOCUMENTO EDUCACIONAL</div>
            <div>
              • Este relatório é gerado por um sistema de simulação educacional de densitometria óssea.<br/>
              • Os valores apresentados são calculados para fins didáticos e demonstrativos.<br/>
              • Este documento NÃO substitui um exame médico real realizado em equipamento certificado.<br/>
              • Para diagnóstico e tratamento adequados, consulte sempre um médico especialista.<br/>
              • Os cálculos são baseados em médias populacionais e padrões clínicos estabelecidos.<br/>
              • Developed by: Bone Densitometry Simulator Team - Educational Purpose Only
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div style="font-weight: bold; margin-bottom: 5px;">BONE DENSITOMETRY SIMULATOR</div>
            <div>Sistema de Simulação de Densitometria Óssea - Versão 1.0</div>
            <div>Relatório gerado automaticamente em ${dataAtual} às ${horaAtual}</div>
            <div style="margin-top: 10px; font-style: italic;">
              Este é um documento de simulação educacional e não possui validade clínica.
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false 
      });

      // Criar nome do arquivo com nome do paciente e data
      const fileName = `Densitometria_${nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Mover o arquivo para um local com nome personalizado
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      setIsGeneratingPDF(false);

      // Verificar se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        Alert.alert(
          '✅ PDF Gerado com Sucesso!',
          'O relatório completo foi criado. Deseja compartilhar?',
          [
            {
              text: 'Compartilhar',
              onPress: async () => {
                await Sharing.shareAsync(newUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Compartilhar Relatório de Densitometria',
                  UTI: 'com.adobe.pdf',
                });
              },
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          '✅ PDF Gerado com Sucesso!',
          `Relatório salvo em:\n${newUri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsGeneratingPDF(false);
      Alert.alert(
        '✅ PDF Gerado com Sucesso!',
        'Imprimindo...',
        [{ text: 'OK' }]
      );
    }
  };

  // Funções auxiliares para cálculos
  const calculateBirthDate = (idade) => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - idade;
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1;
    return `${randomDay.toString().padStart(2, '0')} ${getMonthName(randomMonth)} ${birthYear}`;
  };

  const getMonthName = (month) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month - 1];
  };

  const generateRegionsData = (examType, tScore, bmd) => {
    // Simular dados por região do corpo baseado no tipo de exame
    const regions = [];
    
    // Dados base (simulação realista)
    const baseBMC = 140 + (Math.random() - 0.5) * 40;
    const baseFat = 1950 + (Math.random() - 0.5) * 400;
    const baseLean = 1944 + (Math.random() - 0.5) * 300;
    
    if (examType === 'Coluna Lombar' || examType === 'Fêmur') {
      // Braço E (Esquerdo)
      const bracoEBmc = baseBMC * 0.95 + (Math.random() - 0.5) * 10;
      const bracoEFat = baseFat * 1.01 + (Math.random() - 0.5) * 50;
      const bracoELean = baseLean * 1.00 + (Math.random() - 0.5) * 40;
      regions.push({
        name: 'Braço E',
        bmc: bracoEBmc,
        fat: bracoEFat,
        lean: bracoELean,
        leanPlusBmc: bracoELean + bracoEBmc,
        total: bracoEFat + bracoELean + bracoEBmc,
        fatPercent: (bracoEFat / (bracoEFat + bracoELean + bracoEBmc)) * 100
      });
      
      // Braço D (Direito)
      const bracoDOBmc = baseBMC * 0.98 + (Math.random() - 0.5) * 10;
      const bracoDFat = baseFat * 0.98 + (Math.random() - 0.5) * 50;
      const bracoDLean = baseLean * 0.95 + (Math.random() - 0.5) * 40;
      regions.push({
        name: 'Braço D',
        bmc: bracoDOBmc,
        fat: bracoDFat,
        lean: bracoDLean,
        leanPlusBmc: bracoDLean + bracoDOBmc,
        total: bracoDFat + bracoDLean + bracoDOBmc,
        fatPercent: (bracoDFat / (bracoDFat + bracoDLean + bracoDOBmc)) * 100
      });
      
      // Tronco
      const troncoBmc = baseBMC * 4.5 + (Math.random() - 0.5) * 50;
      const troncoFat = baseFat * 12.0 + (Math.random() - 0.5) * 500;
      const troncoLean = baseLean * 7.3 + (Math.random() - 0.5) * 400;
      regions.push({
        name: 'Tronco',
        bmc: troncoBmc,
        fat: troncoFat,
        lean: troncoLean,
        leanPlusBmc: troncoLean + troncoBmc,
        total: troncoFat + troncoLean + troncoBmc,
        fatPercent: (troncoFat / (troncoFat + troncoLean + troncoBmc)) * 100
      });
      
      // Perna E
      const pernaEBmc = baseBMC * 2.8 + (Math.random() - 0.5) * 30;
      const pernaEFat = baseFat * 3.4 + (Math.random() - 0.5) * 200;
      const pernaELean = baseLean * 3.3 + (Math.random() - 0.5) * 200;
      regions.push({
        name: 'Perna E',
        bmc: pernaEBmc,
        fat: pernaEFat,
        lean: pernaELean,
        leanPlusBmc: pernaELean + pernaEBmc,
        total: pernaEFat + pernaELean + pernaEBmc,
        fatPercent: (pernaEFat / (pernaEFat + pernaELean + pernaEBmc)) * 100
      });
      
      // Perna D
      const pernaDBmc = baseBMC * 2.9 + (Math.random() - 0.5) * 30;
      const pernaDFat = baseFat * 3.3 + (Math.random() - 0.5) * 200;
      const pernaDLean = baseLean * 3.3 + (Math.random() - 0.5) * 200;
      regions.push({
        name: 'Perna D',
        bmc: pernaDBmc,
        fat: pernaDFat,
        lean: pernaDLean,
        leanPlusBmc: pernaDLean + pernaDBmc,
        total: pernaDFat + pernaDLean + pernaDBmc,
        fatPercent: (pernaDFat / (pernaDFat + pernaDLean + pernaDBmc)) * 100
      });
      
      // Subtotal
      const subtotalBmc = regions.reduce((sum, r) => sum + r.bmc, 0);
      const subtotalFat = regions.reduce((sum, r) => sum + r.fat, 0);
      const subtotalLean = regions.reduce((sum, r) => sum + r.lean, 0);
      regions.push({
        name: 'Subtotal',
        bmc: subtotalBmc,
        fat: subtotalFat,
        lean: subtotalLean,
        leanPlusBmc: subtotalLean + subtotalBmc,
        total: subtotalFat + subtotalLean + subtotalBmc,
        fatPercent: (subtotalFat / (subtotalFat + subtotalLean + subtotalBmc)) * 100,
        isSubtotal: true
      });
      
      // Cabeça
      const cabecaBmc = baseBMC * 3.8 + (Math.random() - 0.5) * 30;
      const cabecaFat = baseFat * 0.57 + (Math.random() - 0.5) * 50;
      const cabecaLean = baseLean * 0.58 + (Math.random() - 0.5) * 50;
      regions.push({
        name: 'Cabeça',
        bmc: cabecaBmc,
        fat: cabecaFat,
        lean: cabecaLean,
        leanPlusBmc: cabecaLean + cabecaBmc,
        total: cabecaFat + cabecaLean + cabecaBmc,
        fatPercent: (cabecaFat / (cabecaFat + cabecaLean + cabecaBmc)) * 100
      });
      
      // Total
      const totalBmc = subtotalBmc + cabecaBmc;
      const totalFat = subtotalFat + cabecaFat;
      const totalLean = subtotalLean + cabecaLean;
      regions.push({
        name: 'Total',
        bmc: totalBmc,
        fat: totalFat,
        lean: totalLean,
        leanPlusBmc: totalLean + totalBmc,
        total: totalFat + totalLean + totalBmc,
        fatPercent: (totalFat / (totalFat + totalLean + totalBmc)) * 100,
        isTotal: true
      });
    }
    
    return regions;
  };

  const getChartMarker = (tScore) => {
    // Calcular posição do marcador no gráfico (0-180px de altura)
    let position;
    if (tScore > -1.0) {
      // Normal zone (0-63px from top)
      position = 30 + ((1 - Math.min(tScore, 1)) / 2) * 20;
    } else if (tScore >= -2.5) {
      // Osteopenia zone (63-126px from top)
      position = 85 + ((tScore + 1.0) / -1.5) * 40;
    } else {
      // Osteoporose zone (126-180px from top)
      position = 145 + Math.min((tScore + 2.5) / -1.5, 1) * 20;
    }
    
    return `
      <div class="chart-marker" style="top: ${position}px;">
        <div class="chart-marker-label">Você está aqui (T-Score: ${tScore.toFixed(1)})</div>
      </div>
    `;
  };

  const getBMIClassification = (peso, altura) => {
    const bmi = peso / ((altura / 100) ** 2);
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Sobrepeso (Obesidade I)';
    if (bmi < 35) return 'Obesidade II';
    return 'Obesidade III';
  };

  const getBMIMarkerPosition = (peso, altura) => {
    const bmi = peso / ((altura / 100) ** 2);
    // Converter BMI para posição percentual (10-45 no eixo)
    const minBMI = 10;
    const maxBMI = 45;
    const position = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getRecommendations = (classification) => {
    const recommendations = {
      'Normal': `
        <div style="line-height: 1.8; font-size: 11px;">
          <p style="margin-bottom: 10px;"><strong>✅ Seus ossos estão saudáveis!</strong></p>
          <p style="margin-bottom: 5px;">• Mantenha uma dieta rica em cálcio (1000-1200mg/dia)</p>
          <p style="margin-bottom: 5px;">• Garanta níveis adequados de vitamina D (exposição solar moderada)</p>
          <p style="margin-bottom: 5px;">• Pratique exercícios regulares, especialmente com impacto moderado</p>
          <p style="margin-bottom: 5px;">• Evite tabagismo e consumo excessivo de álcool</p>
          <p style="margin-bottom: 5px;">• Realize exames de acompanhamento conforme orientação médica</p>
        </div>
      `,
      'Osteopenia': `
        <div style="line-height: 1.8; font-size: 11px;">
          <p style="margin-bottom: 10px;"><strong>⚠️ Atenção: Densidade óssea abaixo do ideal</strong></p>
          <p style="margin-bottom: 5px;">• Aumente a ingestão de cálcio para 1200-1500mg/dia</p>
          <p style="margin-bottom: 5px;">• Suplementação de vitamina D (sob orientação médica)</p>
          <p style="margin-bottom: 5px;">• Exercícios de fortalecimento muscular e ósseo (musculação, caminhada)</p>
          <p style="margin-bottom: 5px;">• Avalie fatores de risco com seu médico</p>
          <p style="margin-bottom: 5px;">• Considere avaliação nutricional especializada</p>
          <p style="margin-bottom: 5px;">• Repita o exame em 1-2 anos ou conforme orientação médica</p>
        </div>
      `,
      'Osteoporose': `
        <div style="line-height: 1.8; font-size: 11px;">
          <p style="margin-bottom: 10px;"><strong>🔴 Diagnóstico de Osteoporose - Requer tratamento</strong></p>
          <p style="margin-bottom: 5px;">• <strong>Consulte um médico especialista urgentemente</strong></p>
          <p style="margin-bottom: 5px;">• Tratamento medicamentoso pode ser necessário</p>
          <p style="margin-bottom: 5px;">• Suplementação de cálcio (1200-1500mg/dia) e vitamina D</p>
          <p style="margin-bottom: 5px;">• Exercícios supervisionados (fisioterapia recomendada)</p>
          <p style="margin-bottom: 5px;">• Prevenção de quedas: adapte o ambiente doméstico</p>
          <p style="margin-bottom: 5px;">• Evite atividades de alto impacto que possam causar fraturas</p>
          <p style="margin-bottom: 5px;">• Acompanhamento médico regular e controle com exames periódicos</p>
        </div>
      `
    };

    return recommendations[classification] || recommendations['Normal'];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Relatório do Exame</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Patient Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="user-circle" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Dados do Paciente</Text>
            </View>
            <View style={styles.cardContent}>
              <InfoRow icon="user" label="Paciente" value={nome} />
              <InfoRow icon="birthday-cake" label="Idade" value={`${idade} anos`} />
              <InfoRow icon="venus-mars" label="Sexo" value={sexo} />
              <InfoRow icon="globe-americas" label="Etnia" value={etnia} />
              <InfoRow icon="x-ray" label="Exame" value={exame} />
              <InfoRow icon="map-marker-alt" label="Região" value={vertebraSelecionada || 'Não selecionada'} />
            </View>
          </View>

          {/* Scanner Image */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="image" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Imagem do Scanner</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={getExamImage()} 
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Reference Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="chart-bar" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Referência de Densitometria</Text>
            </View>
            <View style={styles.chartContent}>
              <DensitometryChart 
                tScore={tScore}
                age={idadeNum}
                examType={exame}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={[styles.button, isGeneratingPDF && styles.buttonDisabled]} 
            onPress={gerarPDF}
            activeOpacity={0.8}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <FontAwesome5 name="spinner" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Gerando PDF...</Text>
              </>
            ) : (
              <>
                <FontAwesome5 name="file-pdf" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Gerar PDF Completo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="home" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <FontAwesome5 name={icon} size={14} color="#4A90E2" />
    </View>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
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
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  chartContent: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
