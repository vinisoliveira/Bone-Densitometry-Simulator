import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 80;
const CHART_HEIGHT = 280;
const PADDING = { top: 20, right: 40, bottom: 40, left: 60 };

export default function DensitometryChart({ tScore, age }) {
  // Referência de densitometria L1-L4 baseada em padrões clínicos
  const BMD_MAX = 1.440;
  const BMD_MIN = 0.576;
  
  // Zonas de classificação baseadas em T-Score
  const zones = [
    { name: 'Normal', color: '#4CAF50', minBMD: 1.071, maxBMD: BMD_MAX, tScoreRange: '> -1' },
    { name: 'Osteopenia', color: '#FFD54F', minBMD: 0.847, maxBMD: 1.071, tScoreRange: '-1 a -2.5' },
    { name: 'Osteoporose', color: '#FF6B6B', minBMD: BMD_MIN, maxBMD: 0.847, tScoreRange: '< -2.5' },
  ];

  // Eixo X: Idade (20 a 100 anos)
  const ageRange = { min: 20, max: 100 };
  const ages = [20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  // Eixo Y: BMD (g/cm²)
  const bmdValues = [0.576, 0.699, 0.820, 0.947, 1.071, 1.195, 1.319, 1.440];

  // Função para converter valores para coordenadas do gráfico
  const getX = (age) => {
    const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const ratio = (age - ageRange.min) / (ageRange.max - ageRange.min);
    return PADDING.left + (ratio * chartWidth);
  };

  const getY = (bmd) => {
    const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const ratio = (bmd - BMD_MIN) / (BMD_MAX - BMD_MIN);
    return PADDING.top + chartHeight - (ratio * chartHeight);
  };

  // Curva de referência (pico de densidade óssea aos 30 anos, declínio gradual)
  const referenceCurve = [
    { age: 20, bmd: 1.280 },
    { age: 25, bmd: 1.320 },
    { age: 30, bmd: 1.340 },
    { age: 35, bmd: 1.330 },
    { age: 40, bmd: 1.300 },
    { age: 50, bmd: 1.200 },
    { age: 60, bmd: 1.050 },
    { age: 70, bmd: 0.920 },
    { age: 80, bmd: 0.810 },
    { age: 90, bmd: 0.720 },
    { age: 100, bmd: 0.650 },
  ];

  // Criar path da curva de referência
  const curvePath = referenceCurve.map((point, index) => {
    const x = getX(point.age);
    const y = getY(point.bmd);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Calcular posição do indicador de T-Score (se fornecido)
  const getPatientPosition = () => {
    if (!age || tScore === undefined) return null;
    
    // Converter T-Score para BMD aproximado (baseado em média de referência)
    // Fórmula aproximada: BMD = referência_bmd + (tScore * 0.1)
    const referenceBMD = 1.071; // Média para adulto jovem
    const patientBMD = referenceBMD + (tScore * 0.120);
    
    return {
      x: getX(age),
      y: getY(patientBMD),
      bmd: patientBMD,
    };
  };

  const patientPos = getPatientPosition();

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            {/* Gradientes para as zonas */}
            <LinearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4CAF50" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#4CAF50" stopOpacity="0.3" />
            </LinearGradient>
            <LinearGradient id="osteopeniaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFD54F" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#FFD54F" stopOpacity="0.3" />
            </LinearGradient>
            <LinearGradient id="osteoporoseGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0.3" />
            </LinearGradient>
          </Defs>

          {/* Zonas coloridas de fundo */}
          {zones.map((zone, index) => {
            const gradId = zone.name === 'Normal' ? 'normalGrad' : 
                          zone.name === 'Osteopenia' ? 'osteopeniaGrad' : 'osteoporoseGrad';
            return (
              <Rect
                key={index}
                x={PADDING.left}
                y={getY(zone.maxBMD)}
                width={CHART_WIDTH - PADDING.left - PADDING.right}
                height={getY(zone.minBMD) - getY(zone.maxBMD)}
                fill={`url(#${gradId})`}
              />
            );
          })}

          {/* Grid horizontal (linhas de BMD) */}
          {bmdValues.map((bmd, index) => (
            <Line
              key={`h-grid-${index}`}
              x1={PADDING.left}
              y1={getY(bmd)}
              x2={CHART_WIDTH - PADDING.right}
              y2={getY(bmd)}
              stroke="#3a3f52"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Grid vertical (linhas de idade) */}
          {ages.map((age, index) => (
            <Line
              key={`v-grid-${index}`}
              x1={getX(age)}
              y1={PADDING.top}
              x2={getX(age)}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="#3a3f52"
              strokeWidth="1"
              strokeDasharray="4,4"
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

          {/* Eixos */}
          <Line
            x1={PADDING.left}
            y1={CHART_HEIGHT - PADDING.bottom}
            x2={CHART_WIDTH - PADDING.right}
            y2={CHART_HEIGHT - PADDING.bottom}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={CHART_HEIGHT - PADDING.bottom}
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Labels do eixo Y (BMD) */}
          {bmdValues.map((bmd, index) => (
            <SvgText
              key={`y-label-${index}`}
              x={PADDING.left - 10}
              y={getY(bmd) + 4}
              fill="#FFFFFF"
              fontSize="10"
              textAnchor="end"
            >
              {bmd.toFixed(3)}
            </SvgText>
          ))}

          {/* Labels do eixo X (Idade) */}
          {ages.map((age, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={getX(age)}
              y={CHART_HEIGHT - PADDING.bottom + 20}
              fill="#FFFFFF"
              fontSize="10"
              textAnchor="middle"
            >
              {age}
            </SvgText>
          ))}

          {/* Título do eixo Y */}
          <SvgText
            x={15}
            y={CHART_HEIGHT / 2}
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            transform={`rotate(-90, 15, ${CHART_HEIGHT / 2})`}
          >
            BMD (g/cm²)
          </SvgText>

          {/* Título do eixo X */}
          <SvgText
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT - 5}
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="600"
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
                strokeWidth="2"
                strokeDasharray="6,3"
              />
              
              {/* Ponto do paciente */}
              <circle
                cx={patientPos.x}
                cy={patientPos.y}
                r="6"
                fill="#FF4081"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              
              {/* Label do paciente */}
              <Rect
                x={patientPos.x - 35}
                y={patientPos.y - 30}
                width="70"
                height="20"
                rx="4"
                fill="#FF4081"
                opacity="0.9"
              />
              <SvgText
                x={patientPos.x}
                y={patientPos.y - 16}
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Você: {patientPos.bmd.toFixed(3)}
              </SvgText>
            </>
          )}

          {/* Labels de T-Score nas zonas */}
          {zones.map((zone, index) => {
            const midY = (getY(zone.minBMD) + getY(zone.maxBMD)) / 2;
            return (
              <SvgText
                key={`zone-label-${index}`}
                x={CHART_WIDTH - PADDING.right + 5}
                y={midY}
                fill={zone.color}
                fontSize="9"
                fontWeight="600"
                textAnchor="start"
              >
                {zone.tScoreRange}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Classificação de Densitometria L1-L4</Text>
        <View style={styles.legendItems}>
          {zones.map((zone, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: zone.color }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendName}>{zone.name}</Text>
                <Text style={styles.legendScore}>T-Score: {zone.tScoreRange}</Text>
              </View>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#4A90E2' }]} />
            <View style={styles.legendInfo}>
              <Text style={styles.legendName}>Curva de Referência</Text>
              <Text style={styles.legendScore}>Média populacional</Text>
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#1e2230',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  legend: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  legendScore: {
    fontSize: 11,
    color: '#999',
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
    color: '#CCCCCC',
    marginBottom: 6,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
