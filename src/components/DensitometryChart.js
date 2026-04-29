import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Circle } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 80;
const CHART_HEIGHT = 260;
const PADDING = { top: 20, right: 20, bottom: 50, left: 20 };

export default function DensitometryChart({ tScore, age, examType }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  // Zonas de classificação baseadas em T-Score
  const zones = [
    { name: 'Normal', color: '#4CAF50', tScoreMin: -1, tScoreMax: 3, label: 'T-Score: > -1' },
    { name: 'Osteopenia', color: '#D4A853', tScoreMin: -2.5, tScoreMax: -1, label: 'T-Score: -1 a -2.5' },
    { name: 'Osteoporose', color: '#C85252', tScoreMin: -5, tScoreMax: -2.5, label: 'T-Score: < -2.5' },
  ];

  // Eixo X: Idade (30 a 90 anos)
  const ageRange = { min: 30, max: 90 };
  const ageMarkers = [30, 40, 50, 60, 70, 80, 90];
  
  // Curvas de referência específicas para cada tipo de exame
  const getReferenceCurve = () => {
    // Fêmur (colo do fêmur) - declínio mais acentuado, especialmente após 50 anos
    if (examType === 'Fêmur') {
      return [
        { age: 30, tScore: 0.6 },
        { age: 40, tScore: 0.3 },
        { age: 50, tScore: -0.3 },
        { age: 60, tScore: -1.0 },
        { age: 70, tScore: -1.9 },
        { age: 80, tScore: -2.6 },
        { age: 90, tScore: -3.2 },
      ];
    }
    // Coluna Lombar (L1-L4) - declínio moderado
    else if (examType === 'Coluna Lombar') {
      return [
        { age: 30, tScore: 0.5 },
        { age: 40, tScore: 0.2 },
        { age: 50, tScore: -0.5 },
        { age: 60, tScore: -1.2 },
        { age: 70, tScore: -1.8 },
        { age: 80, tScore: -2.3 },
        { age: 90, tScore: -2.7 },
      ];
    }
    // Punho (rádio distal) - declínio mais gradual
    else if (examType === 'Punho') {
      return [
        { age: 30, tScore: 0.4 },
        { age: 40, tScore: 0.1 },
        { age: 50, tScore: -0.4 },
        { age: 60, tScore: -1.0 },
        { age: 70, tScore: -1.6 },
        { age: 80, tScore: -2.1 },
        { age: 90, tScore: -2.5 },
      ];
    }
    // Default (Coluna Lombar)
    return [
      { age: 30, tScore: 0.5 },
      { age: 40, tScore: 0.2 },
      { age: 50, tScore: -0.5 },
      { age: 60, tScore: -1.2 },
      { age: 70, tScore: -1.8 },
      { age: 80, tScore: -2.3 },
      { age: 90, tScore: -2.7 },
    ];
  };

  const referenceCurve = getReferenceCurve();
  
  // Função para converter valores para coordenadas do gráfico
  const getX = (age) => {
    const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const ratio = (age - ageRange.min) / (ageRange.max - ageRange.min);
    return PADDING.left + (ratio * chartWidth);
  };

  const getYForZone = (zoneIndex) => {
    const zoneHeight = (CHART_HEIGHT - PADDING.top - PADDING.bottom) / zones.length;
    return PADDING.top + (zoneIndex * zoneHeight);
  };

  const getZoneHeight = () => {
    return (CHART_HEIGHT - PADDING.top - PADDING.bottom) / zones.length;
  };

  // Converter T-Score para posição Y no gráfico
  const getTScoreY = (tScore) => {
    // Normalizar T-Score para um valor entre 0 e 1 dentro do range total
    const totalRange = zones[0].tScoreMax - zones[zones.length - 1].tScoreMin;
    const normalizedScore = (zones[0].tScoreMax - tScore) / totalRange;
    const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    return PADDING.top + (normalizedScore * chartHeight);
  };

  // Criar path da curva de referência
  const curvePath = referenceCurve.map((point, index) => {
    const x = getX(point.age);
    const y = getTScoreY(point.tScore);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Calcular posição do indicador do paciente
  const getPatientPosition = () => {
    if (!age || tScore === undefined) return null;
    
    return {
      x: getX(Math.min(Math.max(age, ageRange.min), ageRange.max)),
      y: getTScoreY(tScore),
    };
  };

  const patientPos = getPatientPosition();

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Zonas coloridas horizontais */}
          {zones.map((zone, index) => {
            const y = getYForZone(index);
            const height = getZoneHeight();
            return (
              <Rect
                key={index}
                x={PADDING.left}
                y={y}
                width={CHART_WIDTH - PADDING.left - PADDING.right}
                height={height}
                fill={zone.color}
                opacity={0.6}
              />
            );
          })}

          {/* Linhas de separação entre zonas */}
          {zones.map((zone, index) => {
            if (index === zones.length - 1) return null;
            const y = getYForZone(index + 1);
            return (
              <Line
                key={`separator-${index}`}
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke={theme.surface}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}

          {/* Linhas verticais de grade para idade */}
          {ageMarkers.map((age, index) => (
            <Line
              key={`v-grid-${index}`}
              x1={getX(age)}
              y1={PADDING.top}
              x2={getX(age)}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke={theme.border}
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity={0.5}
            />
          ))}

          {/* Curva de referência */}
          <Path
            d={curvePath}
            stroke="#4A90E2"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Pontos na curva de referência */}
          {referenceCurve.map((point, index) => {
            const x = getX(point.age);
            const y = getTScoreY(point.tScore);
            return (
              <Circle
                key={`curve-point-${index}`}
                cx={x}
                cy={y}
                r="3"
                fill="#4A90E2"
              />
            );
          })}

          {/* Eixos */}
          <Line
            x1={PADDING.left}
            y1={CHART_HEIGHT - PADDING.bottom}
            x2={CHART_WIDTH - PADDING.right}
            y2={CHART_HEIGHT - PADDING.bottom}
            stroke={theme.text}
            strokeWidth="2"
          />

          {/* Labels do eixo X (Idade) */}
          {ageMarkers.map((age, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={getX(age)}
              y={CHART_HEIGHT - PADDING.bottom + 20}
              fill={theme.text}
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
            >
              {age}
            </SvgText>
          ))}

          {/* Título do eixo X */}
          <SvgText
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT - 10}
            fill={theme.text}
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            Idade (anos)
          </SvgText>

          {/* Indicador do paciente */}
          {patientPos && (
            <>
              {/* Linha vertical indicadora */}
              <Line
                x1={patientPos.x}
                y1={PADDING.top}
                x2={patientPos.x}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="#FF4081"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                opacity={0.8}
              />
              
              {/* Ponto do paciente */}
              <Circle
                cx={patientPos.x}
                cy={patientPos.y}
                r="7"
                fill="#FF4081"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              
              {/* Label do paciente */}
              <Rect
                x={patientPos.x - 50}
                y={patientPos.y - 35}
                width="100"
                height="24"
                rx="6"
                fill="#FF4081"
                opacity="0.95"
              />
              <SvgText
                x={patientPos.x}
                y={patientPos.y - 18}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                Você: T-Score {tScore.toFixed(1)}
              </SvgText>
            </>
          )}
        </Svg>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>
          Classificação de Densitometria - {examType || 'L1-L4'}
        </Text>
        <View style={styles.legendItems}>
          {zones.map((zone, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: zone.color }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendName}>{zone.name}</Text>
                <Text style={styles.legendScore}>{zone.label}</Text>
              </View>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#4A90E2' }]} />
            <View style={styles.legendInfo}>
              <Text style={styles.legendName}>Curva de Referência</Text>
              <Text style={styles.legendScore}>Declínio natural com a idade</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Informações adicionais */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📊 Sobre o T-Score</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>T-Score</Text> compara sua densidade óssea com a de adultos jovens saudáveis
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>Normal:</Text> T-Score acima de -1,0
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>Osteopenia:</Text> T-Score entre -1,0 e -2,5
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>Osteoporose:</Text> T-Score abaixo de -2,5
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  legend: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  legendScore: {
    fontSize: 11,
    color: theme.textMuted,
  },
  infoBox: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '700',
    color: theme.text,
  },
});
