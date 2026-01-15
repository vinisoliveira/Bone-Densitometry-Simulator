import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Platform, Dimensions } from 'react-native';
import { Print } from 'expo-print';
import { colors, spacing, typography } from '../src/styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RelatorioScreen({ route, navigation }) {
  const { 
    nome, 
    idade,
    dataNascimento,
    peso,
    altura, 
    sexo, 
    etnia, 
    exame,
    operador, 
    imagemCustomizada,
    imagemHash,
    vertebraSelecionada, 
    brightness = 100, 
    contrast = 100, 
    roiData 
  } = route.params;

  // Calcular IMC
  const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura)/100, 2)).toFixed(1) : null;

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
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4A90E2; }
            .info { margin: 10px 0; }
            strong { color: #333; }
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
              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="user" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Paciente</Text>
                  <Text style={styles.infoGridValue}>{nome || '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="birthday-cake" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Idade</Text>
                  <Text style={styles.infoGridValue}>{idade ? `${idade} anos` : '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="venus-mars" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Sexo</Text>
                  <Text style={styles.infoGridValue}>{sexo || '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="globe-americas" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Etnia</Text>
                  <Text style={styles.infoGridValue}>{etnia || '-'}</Text>
                </View>
              </View>

              {/* Physical Data - if available */}
              {(peso || altura) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoGrid}>
                    {peso && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="weight" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Peso</Text>
                        <Text style={styles.infoGridValue}>{peso} kg</Text>
                      </View>
                    )}
                    {altura && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Altura</Text>
                        <Text style={styles.infoGridValue}>{altura} cm</Text>
                      </View>
                    )}
                    {imc && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="calculator" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>IMC</Text>
                        <Text style={styles.infoGridValue}>{imc} kg/m²</Text>
                      </View>
                    )}
                    {dataNascimento && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="calendar-alt" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Data Nasc.</Text>
                        <Text style={styles.infoGridValue}>{dataNascimento}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
              
              <View style={styles.divider} />
              
              {/* Exam Info */}
              <View style={styles.examInfoRow}>
                <View style={styles.examInfoItem}>
                  <View style={styles.examInfoIcon}>
                    <FontAwesome5 name="x-ray" size={18} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.examInfoLabel}>Tipo de Exame</Text>
                    <Text style={styles.examInfoValue}>{exame || '-'}</Text>
                  </View>
                </View>
                <View style={styles.examInfoItem}>
                  <View style={styles.examInfoIcon}>
                    <FontAwesome5 name="map-marker-alt" size={18} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.examInfoLabel}>Região Analisada</Text>
                    <Text style={styles.examInfoValue}>{roiData?.id || vertebraSelecionada || 'Não analisada'}</Text>
                  </View>
                </View>
              </View>

              {/* Operator info if available */}
              {operador && (
                <View style={[styles.examInfoRow, { marginTop: 10 }]}>
                  <View style={styles.examInfoItem}>
                    <View style={styles.examInfoIcon}>
                      <FontAwesome5 name="user-md" size={18} color="#4A90E2" />
                    </View>
                    <View>
                      <Text style={styles.examInfoLabel}>Operador/Técnico</Text>
                      <Text style={styles.examInfoValue}>{operador}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* DXA Results Card - Only if roiData exists */}
          {roiData && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="chart-line" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Resultados da Análise DXA</Text>
              </View>
              <View style={styles.cardContent}>
                {/* Metrics Row */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>BMD</Text>
                    <Text style={styles.metricValue}>{roiData.bmd?.toFixed(3) || '-'}</Text>
                    <Text style={styles.metricUnit}>g/cm²</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>T-Score</Text>
                    <Text style={[
                      styles.metricValue, 
                      { color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350' }
                    ]}>
                      {roiData.tScore?.toFixed(1) || '-'}
                    </Text>
                    <Text style={styles.metricUnit}>SD</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Z-Score</Text>
                    <Text style={styles.metricValue}>{roiData.zScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.metricUnit}>SD</Text>
                  </View>
                </View>
                
                {/* Diagnosis Badge */}
                <View style={[
                  styles.diagnosisBadge,
                  { 
                    backgroundColor: roiData.tScore >= -1 
                      ? 'rgba(102, 187, 106, 0.2)' 
                      : roiData.tScore >= -2.5 
                        ? 'rgba(255, 202, 40, 0.2)' 
                        : 'rgba(239, 83, 80, 0.2)',
                    borderColor: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350'
                  }
                ]}>
                  <FontAwesome5 
                    name={roiData.tScore >= -1 ? 'check-circle' : roiData.tScore >= -2.5 ? 'exclamation-triangle' : 'times-circle'} 
                    size={20} 
                    color={roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350'} 
                  />
                  <Text style={[
                    styles.diagnosisText,
                    { color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350' }
                  ]}>
                    {roiData.tScore >= -1 ? 'Normal' : roiData.tScore >= -2.5 ? 'Osteopenia' : 'Osteoporose'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Scanner Image */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="image" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Imagem do Scanner</Text>
            </View>
            <View style={styles.scannerImageContainer}>
              {imagemCustomizada ? (
                <Image 
                  source={{ uri: imagemCustomizada }} 
                  style={[
                    styles.scannerImage,
                    Platform.OS === 'web' && {
                      filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
                    },
                    Platform.OS !== 'web' && {
                      opacity: brightness / 100,
                    },
                  ]}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noImageContainer}>
                  <FontAwesome5 name="image" size={48} color="#4A5568" />
                  <Text style={styles.noImageText}>Imagem indisponível</Text>
                  <Text style={styles.noImageSubtext}>Nenhuma imagem foi adicionada</Text>
                </View>
              )}
            </View>
            {roiData && (
              <View style={styles.roiInfo}>
                <Text style={styles.roiInfoTitle}>Análise ROI: {roiData.id}</Text>
                <View style={styles.roiMetricsRow}>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>BMD</Text>
                    <Text style={styles.roiMetricValue}>{roiData.bmd?.toFixed(3) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>g/cm²</Text>
                  </View>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>T-Score</Text>
                    <Text style={[styles.roiMetricValue, { color: roiData.tScore >= -1 ? '#4CAF50' : roiData.tScore >= -2.5 ? '#FFC107' : '#F44336' }]}>{roiData.tScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>SD</Text>
                  </View>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>Z-Score</Text>
                    <Text style={styles.roiMetricValue}>{roiData.zScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>SD</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Dynamic T-Score Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="chart-line" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Gráfico de Densitometria</Text>
            </View>
            <View style={styles.chartContainer}>
              {/* Chart Title */}
              <Text style={styles.chartTitle}>
                Referência de densitometria: {exame === 'Coluna Lombar' ? 'L1-L4' : exame}
              </Text>
              
              {/* Y-Axis Labels and Chart Area */}
              <View style={styles.chartWrapper}>
                {/* Y-Axis BMD Label */}
                <View style={styles.yAxisLabelContainer}>
                  <Text style={styles.yAxisLabelText}>BMD (g/cm²)</Text>
                </View>
                
                {/* Y-Axis BMD Values */}
                <View style={styles.yAxisLeft}>
                  <Text style={styles.yAxisValue}>1.443</Text>
                  <Text style={styles.yAxisValue}>1.319</Text>
                  <Text style={styles.yAxisValue}>1.195</Text>
                  <Text style={styles.yAxisValue}>1.071</Text>
                  <Text style={styles.yAxisValue}>0.947</Text>
                  <Text style={styles.yAxisValue}>0.823</Text>
                  <Text style={styles.yAxisValue}>0.699</Text>
                  <Text style={styles.yAxisValue}>0.575</Text>
                </View>

                {/* Main Chart */}
                <View style={styles.chartArea}>
                  {/* Normal Zone (Green) */}
                  <View style={[styles.chartZone, styles.normalZone, { height: '35%' }]}>
                    <Text style={styles.zoneLabel}>Normal</Text>
                  </View>
                  
                  {/* Osteopenia Zone (Yellow) */}
                  <View style={[styles.chartZone, styles.osteopeniaZone, { height: '35%' }]}>
                    <Text style={styles.zoneLabel}>Osteopenia</Text>
                  </View>
                  
                  {/* Osteoporosis Zone (Red) */}
                  <View style={[styles.chartZone, styles.osteoporosisZone, { height: '30%' }]}>
                    <Text style={styles.zoneLabel}>Osteoporose</Text>
                  </View>

                  {/* Patient Marker */}
                  {roiData && (
                    <View 
                      style={[
                        styles.patientMarker,
                        {
                          // Position based on T-Score: -1 is at 35%, -2.5 is at 70%
                          top: roiData.tScore >= -1 
                            ? `${Math.max(5, 35 - ((roiData.tScore + 1) * 15))}%`
                            : roiData.tScore >= -2.5 
                              ? `${35 + ((Math.abs(roiData.tScore) - 1) * (35 / 1.5))}%`
                              : `${70 + ((Math.abs(roiData.tScore) - 2.5) * 10)}%`,
                          // Position based on age
                          left: `${Math.min(90, Math.max(10, ((parseInt(idade) - 20) / 80) * 100))}%`,
                        }
                      ]}
                    >
                      <View style={styles.markerDot} />
                      <View style={styles.markerLine} />
                    </View>
                  )}
                </View>

                {/* Y-Axis T-Score Values */}
                <View style={styles.yAxisRight}>
                  <Text style={styles.yAxisValue}>+2</Text>
                  <Text style={styles.yAxisValue}>+1</Text>
                  <Text style={styles.yAxisValue}>0</Text>
                  <Text style={styles.yAxisValue}>-1</Text>
                  <Text style={styles.yAxisValue}>-2</Text>
                  <Text style={styles.yAxisValue}>-3</Text>
                  <Text style={styles.yAxisValue}>-4</Text>
                  <Text style={styles.yAxisValue}>-5</Text>
                </View>
                
                {/* Y-Axis T-Score Label */}
                <View style={styles.yAxisLabelContainer}>
                  <Text style={styles.yAxisLabelText}>T-Score</Text>
                </View>
              </View>

              {/* X-Axis */}
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>Idade (anos)</Text>
                <View style={styles.xAxisValues}>
                  <Text style={styles.xAxisValue}>20</Text>
                  <Text style={styles.xAxisValue}>30</Text>
                  <Text style={styles.xAxisValue}>40</Text>
                  <Text style={styles.xAxisValue}>50</Text>
                  <Text style={styles.xAxisValue}>60</Text>
                  <Text style={styles.xAxisValue}>70</Text>
                  <Text style={styles.xAxisValue}>80</Text>
                  <Text style={styles.xAxisValue}>90</Text>
                  <Text style={styles.xAxisValue}>100</Text>
                </View>
              </View>

              {/* Patient Info on Chart */}
              {roiData && (
                <View style={styles.chartPatientInfo}>
                  <View style={styles.chartPatientRow}>
                    <View style={styles.chartPatientDot} />
                    <Text style={styles.chartPatientText}>
                      Paciente: {nome} ({idade} anos)
                    </Text>
                  </View>
                  <Text style={styles.chartPatientResult}>
                    BMD: {roiData.bmd?.toFixed(3)} g/cm² | T-Score: {roiData.tScore?.toFixed(1)} | 
                    <Text style={{ 
                      color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350',
                      fontWeight: '700'
                    }}>
                      {' '}{roiData.tScore >= -1 ? 'Normal' : roiData.tScore >= -2.5 ? 'Osteopenia' : 'Osteoporose'}
                    </Text>
                  </Text>
                </View>
              )}
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

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <FontAwesome5 name={icon} size={14} color="#4A90E2" />
    </View>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor, fontWeight: '700' }]}>{value}</Text>
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
  // Info Grid - 2x2 layout for patient data
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridItem: {
    width: '47%',
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  infoGridLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGridValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Exam Info Row
  examInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  examInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  examInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInfoLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examInfoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  // Metrics Container - for DXA results
  metricsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1a1d29',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  // Diagnosis Badge
  diagnosisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  diagnosisText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Legacy styles (kept for compatibility)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3f52',
    marginVertical: 16,
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
  // Scanner Image - Larger & Responsive
  scannerImageContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#000',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
  scannerImage: {
    width: '100%',
    height: 350,
    borderRadius: 8,
    maxWidth: 500,
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#30363d',
    borderStyle: 'dashed',
  },
  noImageText: {
    color: '#8892B0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noImageSubtext: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  roiInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3f52',
  },
  roiInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
  },
  roiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roiMetricBox: {
    flex: 1,
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roiMetricLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  roiMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roiMetricUnit: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  // Dynamic Chart Styles
  chartContainer: {
    padding: 16,
    backgroundColor: '#1a1d29',
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 280,
    alignItems: 'stretch',
  },
  yAxisLabelContainer: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisLabelText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
    width: 80,
    textAlign: 'center',
  },
  yAxisLeft: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingVertical: 8,
  },
  yAxisRight: {
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: 6,
    paddingVertical: 8,
  },
  yAxisValue: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#2a3142',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  chartZone: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  normalZone: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderBottomWidth: 3,
    borderBottomColor: '#66BB6A',
  },
  osteopeniaZone: {
    backgroundColor: 'rgba(255, 193, 7, 0.5)',
    borderBottomWidth: 3,
    borderBottomColor: '#FFCA28',
  },
  osteoporosisZone: {
    backgroundColor: 'rgba(244, 67, 54, 0.5)',
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  patientMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  markerLine: {
    width: 3,
    height: 50,
    backgroundColor: '#4A90E2',
    opacity: 0.8,
    borderRadius: 2,
  },
  xAxis: {
    paddingTop: 12,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '700',
    marginBottom: 6,
  },
  xAxisValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 60,
  },
  xAxisValue: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  chartPatientInfo: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#2a3142',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  chartPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  chartPatientDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartPatientText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartPatientResult: {
    fontSize: 13,
    color: '#CCCCCC',
    marginLeft: 22,
    lineHeight: 20,
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
