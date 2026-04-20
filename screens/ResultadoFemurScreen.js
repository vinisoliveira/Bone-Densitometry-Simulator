import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../src/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { salvarPaciente, atualizarPaciente } from '../utils/storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

// Constantes para o editor
const EDITOR_WIDTH = Math.min(width - 40, 800);
const EDITOR_HEIGHT = height * 0.55;
const TOOLBAR_WIDTH = 50;

// Tamanho dos ROIs para Fêmur (formato quadrado)
const FEMUR_ROI_SIZES = {
  'Neck': { width: 80, height: 80 },
  'Troch': { width: 90, height: 90 },
  'Inter': { width: 90, height: 90 },
  'Total': { width: 100, height: 100 },
  'Ward': { width: 60, height: 60 },
};

// Componente ROI para Fêmur
const FemurROI = ({ 
  region, 
  isSelected, 
  onSelect,
  isDraggable,
  isResizable,
  onPositionChange,
  onSizeChange,
  onInteractionStart,
  onInteractionEnd,
  containerSize,
  customSize,
}) => {
  const startPosRef = useRef({ x: region.x, y: region.y });
  const currentPosRef = useRef({ x: region.x, y: region.y });
  const [currentPos, setCurrentPos] = useState({ x: region.x, y: region.y });
  
  const roiWidth = customSize?.width || (FEMUR_ROI_SIZES[region.id] || { width: 120 }).width;
  const roiHeight = customSize?.height || (FEMUR_ROI_SIZES[region.id] || { height: 80 }).height;
  
  useEffect(() => {
    setCurrentPos({ x: region.x, y: region.y });
    currentPosRef.current = { x: region.x, y: region.y };
    startPosRef.current = { x: region.x, y: region.y };
  }, [region.x, region.y]);
  
  // PanResponder para mover o ROI
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const roiSizeRef = useRef({ w: roiWidth, h: roiHeight });
  roiSizeRef.current = { w: roiWidth, h: roiHeight };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isDraggable,
    onMoveShouldSetPanResponder: () => isDraggable,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: () => {
      if (onSelectRef.current) onSelectRef.current();
      if (onInteractionStart) onInteractionStart();
      startPosRef.current = { x: currentPosRef.current.x, y: currentPosRef.current.y };
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!containerSize.width || !containerSize.height) return;
      
      const deltaX = gestureState.dx / containerSize.width;
      const deltaY = gestureState.dy / containerSize.height;
      
      const scaledWidthRatio = roiSizeRef.current.w / containerSize.width;
      const scaledHeightRatio = roiSizeRef.current.h / containerSize.height;
      
      let newX = Math.max(0, Math.min(1 - scaledWidthRatio, startPosRef.current.x + deltaX));
      let newY = Math.max(0, Math.min(1 - scaledHeightRatio, startPosRef.current.y + deltaY));
      
      currentPosRef.current = { x: newX, y: newY };
      setCurrentPos({ x: newX, y: newY });
    },
    onPanResponderRelease: () => {
      if (onInteractionEnd) onInteractionEnd();
      if (onPositionChange) {
        onPositionChange(region.id, currentPosRef.current.x, currentPosRef.current.y);
      }
    },
  }), [isDraggable, containerSize, region.id, onPositionChange]);

  // PanResponder for resizing (bottom-right corner)
  const resizeStartRef = useRef({ w: roiWidth, h: roiHeight });
  const resizePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isResizable,
    onMoveShouldSetPanResponder: () => isResizable,
    onStartShouldSetPanResponderCapture: () => isResizable,
    onMoveShouldSetPanResponderCapture: () => isResizable,
    onPanResponderGrant: () => {
      if (onSelectRef.current) onSelectRef.current();
      if (onInteractionStart) onInteractionStart();
      resizeStartRef.current = { w: roiSizeRef.current.w, h: roiSizeRef.current.h };
    },
    onPanResponderMove: (evt, gestureState) => {
      const newW = Math.max(30, Math.min(300, resizeStartRef.current.w + gestureState.dx));
      const newH = Math.max(30, Math.min(300, resizeStartRef.current.h + gestureState.dy));
      if (onSizeChange) {
        onSizeChange(region.id, newW, newH);
      }
    },
    onPanResponderRelease: () => {
      if (onInteractionEnd) onInteractionEnd();
    },
  }), [isResizable, region.id, onSizeChange]);

  // Cores específicas para cada região do fêmur
  const getRegionColor = () => {
    switch(region.id) {
      case 'Neck': return '#FF6B6B';
      case 'Troch': return '#4ECDC4';
      case 'Inter': return '#45B7D1';
      case 'Total': return '#96CEB4';
      case 'Ward': return '#FFEAA7';
      default: return '#00E5FF';
    }
  };

  const regionColor = getRegionColor();

  const roiStyle = {
    position: 'absolute',
    left: `${currentPos.x * 100}%`,
    top: `${currentPos.y * 100}%`,
    width: roiWidth,
    height: roiHeight,
    borderWidth: isSelected ? 3 : 2,
    borderColor: isSelected ? '#FFFFFF' : regionColor,
    backgroundColor: isSelected ? `${regionColor}40` : `${regionColor}20`,
    borderRadius: region.id === 'Ward' ? roiWidth / 2 : 4,
    cursor: isDraggable ? 'move' : 'pointer',
  };

  return (
    <View
      style={roiStyle}
      {...(isDraggable ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity 
        style={{ flex: 1 }}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View style={[styles.regionLabel, { backgroundColor: regionColor }]}>
          <Text style={styles.regionLabelText}>{region.id}</Text>
        </View>
        {isSelected && isDraggable && (
          <View style={styles.dragIndicator}>
            <FontAwesome5 name="arrows-alt" size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      {isResizable && (
        <View 
          style={styles.resizeHandle}
          {...resizePanResponder.panHandlers}
        >
          <FontAwesome5 name="expand-arrows-alt" size={12} color="#FFF" pointerEvents="none" />
        </View>
      )}
    </View>
  );
};

export default function ResultadoFemurScreen({ route }) {
  const { 
    id, 
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
    brightness: initialBrightness = 100,
    contrast: initialContrast = 100,
    vertebraSelecionada: initialVertebra = null,
    roiData: initialRoiData = null,
    roiPositions: initialRoiPositions = {},
    roiScale: initialRoiScale = 1,
    roiSizes: initialRoiSizes = {},
  } = route.params;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isNarrow = screenWidth < 600;
  const isMobile = Platform.OS !== 'web' || Math.min(screenWidth, screenHeight) < 500;
  const { theme } = useTheme();
  
  const [selectedId, setSelectedId] = useState(initialVertebra);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const navigation = useNavigation();

  const [activeTool, setActiveTool] = useState('select');
  const [brightness, setBrightness] = useState(initialBrightness);
  const [contrast, setContrast] = useState(initialContrast);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showROIPanel, setShowROIPanel] = useState(false);
  
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  
  const [customRoiPositions, setCustomRoiPositions] = useState(initialRoiPositions);
  const [roiScale, setRoiScale] = useState(initialRoiScale);
  const [customRoiSizes, setCustomRoiSizes] = useState(initialRoiSizes);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const saveSuccessAnim = useRef(new Animated.Value(0)).current;
  
  const imagePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => activeTool === 'pan',
    onMoveShouldSetPanResponder: () => activeTool === 'pan',
    onStartShouldSetPanResponderCapture: () => activeTool === 'pan',
    onMoveShouldSetPanResponderCapture: () => activeTool === 'pan',
    onPanResponderGrant: () => {},
    onPanResponderMove: (evt, gestureState) => {
      const newX = panOffsetRef.current.x + gestureState.dx;
      const newY = panOffsetRef.current.y + gestureState.dy;
      setPanOffset({ x: newX, y: newY });
    },
    onPanResponderRelease: (evt, gestureState) => {
      panOffsetRef.current = {
        x: panOffsetRef.current.x + gestureState.dx,
        y: panOffsetRef.current.y + gestureState.dy,
      };
    },
  }), [activeTool]);

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

  // Lock to portrait on mobile (com fallback para Samsung)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        .catch(() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {}));
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
          .catch(() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {}));
      };
    }
  }, []);

  const imagemDoExame = imagemCustomizada 
    ? { uri: imagemCustomizada } 
    : null;

  // Regiões anatômicas do Fêmur Proximal conforme manual Hologic
  // Neck (Colo Femoral), Troch (Trocanter), Inter (Intertrocantérica), Total Hip, Ward's Triangle
  const regioesFemur = [
    { id: 'Neck', x: 0.35, y: 0.12, bmd: 0.856, tScore: -1.2, zScore: -0.3, area: 5.21,  bmc: parseFloat((0.856 * 5.21).toFixed(2)) },
    { id: 'Troch', x: 0.20, y: 0.35, bmd: 0.745, tScore: -1.5, zScore: -0.6, area: 12.45, bmc: parseFloat((0.745 * 12.45).toFixed(2)) },
    { id: 'Inter', x: 0.25, y: 0.55, bmd: 1.023, tScore: -0.8, zScore: 0.1, area: 18.32, bmc: parseFloat((1.023 * 18.32).toFixed(2)) },
    { id: 'Total', x: 0.22, y: 0.75, bmd: 0.912, tScore: -1.1, zScore: -0.2, area: 35.98, bmc: parseFloat((0.912 * 35.98).toFixed(2)) },
    { id: 'Ward', x: 0.45, y: 0.25, bmd: 0.678, tScore: -2.1, zScore: -1.2, area: 1.15,  bmc: parseFloat((0.678 * 1.15).toFixed(2)) },
  ];
  
  const calcularScoresPorPosicao = (x, y, baseRegion) => {
    const centerX = 0.35;
    const distanciaDocentro = Math.abs(x - centerX);
    
    const variacao = (distanciaDocentro * 0.3) - 0.15;
    const novoBmd = Math.max(0.1, baseRegion.bmd + variacao).toFixed(3);
    
    const novoTScore = (baseRegion.tScore - (distanciaDocentro * 2) + Math.random() * 0.2 - 0.1).toFixed(1);
    const novoZScore = (baseRegion.zScore - (distanciaDocentro * 1.5) + Math.random() * 0.2 - 0.1).toFixed(1);
    
    return {
      bmd: parseFloat(novoBmd),
      tScore: parseFloat(novoTScore),
      zScore: parseFloat(novoZScore),
      bmc: parseFloat((parseFloat(novoBmd) * (baseRegion.area || 1)).toFixed(2)),
    };
  };
  
  const regioesComPosicoes = regioesFemur.map(r => {
    const customPos = customRoiPositions[r.id];
    let result = { ...r };
    
    if (customPos) {
      const novosScores = calcularScoresPorPosicao(customPos.x, customPos.y, r);
      result = {
        ...result,
        x: customPos.x,
        y: customPos.y,
        ...novosScores,
      };
    }
    
    return result;
  });
  
  const regiaoSelecionada = regioesComPosicoes.find((r) => r.id === selectedId);
  
  const handleRoiPositionChange = (roiId, newX, newY) => {
    setCustomRoiPositions(prev => ({
      ...prev,
      [roiId]: { x: newX, y: newY },
    }));
  };

  const handleRoiSizeChange = useCallback((roiId, newWidth, newHeight) => {
    setCustomRoiSizes(prev => ({
      ...prev,
      [roiId]: { width: Math.round(newWidth), height: Math.round(newHeight) },
    }));
  }, []);

  const tools = [
    { id: 'select', icon: 'mouse-pointer', label: 'Selecionar' },
    { id: 'pan', icon: 'hand-paper', label: 'Mover' },
    { id: 'zoom-in', icon: 'search-plus', label: 'Zoom +' },
    { id: 'zoom-out', icon: 'search-minus', label: 'Zoom -' },
    { id: 'roi', icon: 'vector-square', label: 'ROI' },
    { id: 'contrast', icon: 'adjust', label: 'Ajustes' },
    { id: 'reset', icon: 'undo', label: 'Resetar' },
  ];

  const handleToolPress = (toolId) => {
    if (toolId === 'zoom-in') {
      setZoomLevel(prev => Math.min(prev + 0.25, 3));
      return;
    }
    if (toolId === 'zoom-out') {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
      return;
    }
    if (toolId === 'reset') {
      setBrightness(100);
      setContrast(100);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      panOffsetRef.current = { x: 0, y: 0 };
      setSelectedId(null);
      setCustomRoiPositions({});
      setRoiScale(1);
      setCustomRoiSizes({});
      setShowAdjustments(false);
      setShowROIPanel(false);
      return;
    }
    if (toolId === 'contrast') {
      setShowAdjustments(!showAdjustments);
      setShowROIPanel(false);
      setActiveTool(toolId);
      return;
    }
    if (toolId === 'roi') {
      setShowROIPanel(!showROIPanel);
      setShowAdjustments(false);
      setActiveTool(toolId);
      return;
    }
    setActiveTool(toolId);
  };

  const handleSave = async () => {
    setShowSaveAnimation(true);
    
    Animated.sequence([
      Animated.spring(saveSuccessAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const pacienteCompleto = {
      id,
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
      vertebraSelecionada: selectedId,
      brightness,
      contrast,
      zoomLevel,
      roiData: regiaoSelecionada,
      roiPositions: customRoiPositions,
      roiScale: roiScale,
      roiSizes: customRoiSizes,
      allRoiData: regioesComPosicoes,
      dataCriacao: route.params.dataCriacao || new Date().toISOString(),
    };

    if (route.params.dataCriacao) {
      await atualizarPaciente(pacienteCompleto);
    } else {
      await salvarPaciente(pacienteCompleto);
    }
    
    setTimeout(() => {
      saveSuccessAnim.setValue(0);
      setShowSaveAnimation(false);
      navigation.navigate('Lista');
    }, 1500);
  };

  const getStatusFromTScore = (tScore) => {
    if (tScore >= -1) return { status: 'Normal', color: '#4CAF50' };
    if (tScore >= -2.5) return { status: 'Osteopenia', color: '#FFC107' };
    return { status: 'Osteoporose', color: '#F44336' };
  };

  const getImageStyle = () => {
    const brightnessValue = brightness / 100;
    const contrastValue = contrast / 100;
    
    return {
      resizeMode: 'contain',
      opacity: brightnessValue,
      ...(Platform.OS === 'web' && {
        filter: `brightness(${brightnessValue}) contrast(${contrastValue})`,
      }),
    };
  };

  // Calcula FRAX simplificado baseado nos dados
  const calcularFRAX = () => {
    if (!regiaoSelecionada) return null;
    const neckRegion = regioesComPosicoes.find(r => r.id === 'Neck');
    if (!neckRegion) return null;
    
    // Cálculo simplificado do FRAX (apenas ilustrativo)
    const idadeNum = parseInt(idade) || 50;
    const baseRisk = Math.max(0, (-neckRegion.tScore * 2) + (idadeNum - 50) * 0.1);
    return {
      hipFracture: Math.min(baseRisk * 0.5, 30).toFixed(1),
      majorFracture: Math.min(baseRisk * 1.2, 50).toFixed(1),
    };
  };

  const fraxData = calcularFRAX();

  return (
    <View style={{flex: 1, backgroundColor: theme.editorBg}}>
    <ScrollView scrollEnabled={scrollEnabled} style={[styles.container, { backgroundColor: theme.editorBg }]} contentContainerStyle={[styles.scrollContent, (isNarrow || isMobile) && { paddingBottom: 70 }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { backgroundColor: theme.editorSurface, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.editorPanel }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={18} color="#4A90E2" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>PROXIMAL FEMUR DXA</Text>
          <Text style={[styles.title, { color: theme.text }]}>Fêmur Proximal</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.statusText, { color: theme.textMuted }]}>Online</Text>
          </View>
        </View>
      </Animated.View>

      {/* Patient Info Bar */}
      <Animated.View style={[styles.patientBar, { backgroundColor: theme.editorSurface, borderColor: theme.editorBorder, opacity: fadeAnim }]}>
        <View style={styles.patientInfo}>
          <FontAwesome5 name="user" size={12} color="#FF6B6B" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{nome}</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="birthday-cake" size={12} color="#FF6B6B" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{idade} anos</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="venus-mars" size={12} color="#FF6B6B" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{sexo}</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="bone" size={12} color="#FF6B6B" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>Hip DXA</Text>
        </View>
      </Animated.View>

      {/* Main Editor Area */}
      <Animated.View style={[styles.editorContainer, { backgroundColor: theme.editorSurface, opacity: fadeAnim }, isNarrow && styles.editorContainerMobile]}>
        {/* Toolbar */}
        {!(isNarrow || isMobile) && (
        <View style={[styles.toolbar, { backgroundColor: theme.editorPanel, borderColor: theme.editorBorder }, isNarrow && styles.toolbarMobile]}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolButton, activeTool === tool.id && styles.toolButtonActive]}
              onPress={() => handleToolPress(tool.id)}
            >
              <FontAwesome5 name={tool.icon} size={16} color={activeTool === tool.id ? '#FFFFFF' : '#8892B0'} />
            </TouchableOpacity>
          ))}
          <View style={styles.zoomIndicator}>
            <Text style={[styles.zoomText, { color: theme.textMuted }]}>{Math.round(zoomLevel * 100)}%</Text>
          </View>
        </View>
        )}

        {/* Image Canvas */}
        <View style={styles.canvasContainer}>
          <View style={styles.rulerTop}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={styles.rulerMark}>
                <Text style={styles.rulerText}>{i * 10}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.imageArea}>
            <View style={styles.rulerLeft}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.rulerMarkVertical}>
                  <Text style={styles.rulerText}>{i * 10}</Text>
                </View>
              ))}
            </View>

            <View 
              style={styles.imageCanvas}
              {...imagePanResponder.panHandlers}
            >
              <View 
                style={[
                  styles.imageContainer, 
                  { 
                    transform: [
                      { translateX: panOffset.x },
                      { translateY: panOffset.y },
                      { scale: zoomLevel },
                    ] 
                  }
                ]}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageContainerSize({ width, height });
                }}
              >
                {imagemDoExame ? (
                  <Image 
                    source={imagemDoExame} 
                    style={[styles.mainImage, getImageStyle()]} 
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <FontAwesome5 name="bone" size={48} color="#4A5568" />
                    <Text style={styles.noImageText}>Imagem do Fêmur</Text>
                    <Text style={styles.noImageSubtext}>Nenhuma imagem foi adicionada para este exame</Text>
                  </View>
                )}
                
                {regioesComPosicoes.map((r) => (
                  <FemurROI
                    key={r.id}
                    region={r}
                    isSelected={selectedId === r.id}
                    onSelect={() => setSelectedId(r.id)}
                    isDraggable={activeTool === 'select'}
                    isResizable={activeTool === 'roi'}
                    onPositionChange={handleRoiPositionChange}
                    onSizeChange={handleRoiSizeChange}
                    onInteractionStart={() => setScrollEnabled(false)}
                    onInteractionEnd={() => setScrollEnabled(true)}
                    containerSize={imageContainerSize}
                    customSize={customRoiSizes[r.id] || { width: (FEMUR_ROI_SIZES[r.id] || { width: 120 }).width * roiScale, height: (FEMUR_ROI_SIZES[r.id] || { height: 80 }).height * roiScale }}
                  />
                ))}
              </View>
              
              {activeTool === 'pan' && (
                <View style={styles.toolIndicator} pointerEvents="none">
                  <FontAwesome5 name="hand-paper" size={16} color="rgba(255, 107, 107, 0.5)" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.canvasInfoBar}>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="crosshairs" size={10} color="#FF6B6B" /> ROI: {selectedId || 'Nenhuma'}
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="search" size={10} color="#FF6B6B" /> Zoom: {Math.round(zoomLevel * 100)}%
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="sun" size={10} color="#FF6B6B" /> Brilho: {brightness}%
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="adjust" size={10} color="#FF6B6B" /> Contraste: {contrast}%
            </Text>
          </View>
        </View>

        {/* Side Panel */}
        <View style={[styles.sidePanel, { backgroundColor: theme.editorPanel, borderColor: theme.editorBorder }, isNarrow && styles.sidePanelMobile]}>
          {showAdjustments && (
            <View style={[styles.adjustmentPanel, { backgroundColor: theme.editorPanel }]}>
              <Text style={[styles.panelTitle, { color: theme.editorText }]}>
                <FontAwesome5 name="sliders-h" size={12} color="#FF6B6B" /> Ajustes de Imagem
              </Text>
              
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <FontAwesome5 name="sun" size={12} color="#FFD700" />
                  <Text style={[styles.sliderLabel, { color: theme.editorText }]}>Brilho</Text>
                  <Text style={[styles.sliderValue, { color: theme.textMuted }]}>{brightness}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  value={brightness}
                  onValueChange={setBrightness}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="#3d4454"
                  thumbTintColor="#FF6B6B"
                />
              </View>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <FontAwesome5 name="adjust" size={12} color="#FF6B6B" />
                  <Text style={[styles.sliderLabel, { color: theme.editorText }]}>Contraste</Text>
                  <Text style={[styles.sliderValue, { color: theme.textMuted }]}>{contrast}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  value={contrast}
                  onValueChange={setContrast}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="#3d4454"
                  thumbTintColor="#FF6B6B"
                />
              </View>

              <TouchableOpacity style={styles.resetButton} onPress={() => { setBrightness(100); setContrast(100); }}>
                <FontAwesome5 name="undo" size={12} color="#FFF" />
                <Text style={styles.resetButtonText}>Resetar</Text>
              </TouchableOpacity>
            </View>
          )}

          {(showROIPanel || regiaoSelecionada) && (
            <View style={[styles.roiPanel, { backgroundColor: theme.editorPanel }]}>
              <Text style={[styles.panelTitle, { color: theme.editorText }]}>
                <FontAwesome5 name="chart-bar" size={12} color="#FF6B6B" /> Análise Hip DXA
              </Text>
              
              {regiaoSelecionada ? (
                <View style={styles.roiData}>
                  <View style={styles.roiHeader}>
                    <Text style={[styles.roiRegionName, { color: theme.text }]}>{regiaoSelecionada.id}</Text>
                    <View style={[styles.roiStatusBadge, { backgroundColor: getStatusFromTScore(regiaoSelecionada.tScore).color }]}>
                      <Text style={styles.roiStatusText}>{getStatusFromTScore(regiaoSelecionada.tScore).status}</Text>
                    </View>
                  </View>

                  <View style={styles.roiMetrics}>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>BMD</Text>
                      <Text style={[styles.roiMetricValue, { color: theme.text }]}>{regiaoSelecionada.bmd.toFixed(3)}</Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>g/cm²</Text>
                    </View>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>T-Score</Text>
                      <Text style={[styles.roiMetricValue, { color: getStatusFromTScore(regiaoSelecionada.tScore).color }]}>
                        {regiaoSelecionada.tScore.toFixed(1)}
                      </Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>SD</Text>
                    </View>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>Z-Score</Text>
                      <Text style={[styles.roiMetricValue, { color: theme.text }]}>{regiaoSelecionada.zScore.toFixed(1)}</Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>SD</Text>
                    </View>
                  </View>

                  {regiaoSelecionada.area && (
                    <View style={styles.areaInfo}>
                      <FontAwesome5 name="expand" size={10} color="#8892B0" />
                      <Text style={styles.areaText}>Área: {regiaoSelecionada.area} cm²</Text>
                    </View>
                  )}

                  <View style={styles.tScoreBar}>
                    <View style={styles.tScoreBarBg}>
                      <View style={[styles.tScoreZone, { backgroundColor: '#4CAF50', flex: 1 }]} />
                      <View style={[styles.tScoreZone, { backgroundColor: '#FFC107', flex: 1.5 }]} />
                      <View style={[styles.tScoreZone, { backgroundColor: '#F44336', flex: 1 }]} />
                    </View>
                    <View style={[styles.tScoreMarker, { left: `${Math.max(0, Math.min(100, ((regiaoSelecionada.tScore + 4) / 5) * 100))}%` }]} />
                    <View style={styles.tScoreLabels}>
                      <Text style={styles.tScoreLabel}>-4</Text>
                      <Text style={styles.tScoreLabel}>-2.5</Text>
                      <Text style={styles.tScoreLabel}>-1</Text>
                      <Text style={styles.tScoreLabel}>+1</Text>
                    </View>
                  </View>

                  {/* FRAX Risk Assessment */}
                  {fraxData && (
                    <View style={styles.fraxPanel}>
                      <Text style={[styles.fraxTitle, { color: theme.editorText }]}>
                        <FontAwesome5 name="exclamation-triangle" size={10} color="#FFC107" /> FRAX® Risk
                      </Text>
                      <View style={styles.fraxRow}>
                        <Text style={[styles.fraxLabel, { color: theme.textMuted }]}>Fratura de Quadril (10 anos):</Text>
                        <Text style={[styles.fraxValue, { color: theme.text }]}>{fraxData.hipFracture}%</Text>
                      </View>
                      <View style={styles.fraxRow}>
                        <Text style={[styles.fraxLabel, { color: theme.textMuted }]}>Fratura Major (10 anos):</Text>
                        <Text style={[styles.fraxValue, { color: theme.text }]}>{fraxData.majorFracture}%</Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.roiEmpty}>
                  <FontAwesome5 name="hand-pointer" size={24} color="#FF6B6B" />
                  <Text style={[styles.roiEmptyText, { color: theme.textMuted }]}>Selecione uma região do fêmur</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.regionsPanel, { backgroundColor: theme.editorPanel }]}>
            <Text style={[styles.panelTitle, { color: theme.editorText }]}>
              <FontAwesome5 name="bone" size={12} color="#FF6B6B" /> Regiões do Fêmur
            </Text>
            
            <View style={styles.roiSizeControl}>
              <View style={styles.roiSizeHeader}>
                <FontAwesome5 name="expand" size={10} color="#8892B0" />
                <Text style={[styles.roiSizeLabel, { color: theme.textMuted }]}>Tamanho ROI</Text>
                <Text style={[styles.roiSizeValue, { color: theme.textMuted }]}>{Math.round(roiScale * 100)}%</Text>
              </View>
              <View style={styles.roiSizeButtons}>
                <TouchableOpacity 
                  style={styles.roiSizeBtn}
                  onPress={() => setRoiScale(prev => Math.max(0.2, prev - 0.1))}
                >
                  <FontAwesome5 name="minus" size={10} color="#fff" />
                </TouchableOpacity>
                <View style={styles.roiSizeBarContainer}>
                  <View style={[styles.roiSizeBar, { width: `${((roiScale - 0.2) / 1.3) * 100}%` }]} />
                </View>
                <TouchableOpacity 
                  style={styles.roiSizeBtn}
                  onPress={() => setRoiScale(prev => Math.min(1.5, prev + 0.1))}
                >
                  <FontAwesome5 name="plus" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.regionsList} nestedScrollEnabled>
              {regioesFemur.map((r) => {
                const regionData = regioesComPosicoes.find(reg => reg.id === r.id) || r;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.regionItem, selectedId === r.id && styles.regionItemActive]}
                    onPress={() => setSelectedId(r.id)}
                  >
                    <View style={[styles.regionDot, { backgroundColor: getStatusFromTScore(regionData.tScore).color }]} />
                    <View style={styles.regionItemContent}>
                      <Text style={[styles.regionItemText, { color: theme.editorText }, selectedId === r.id && styles.regionItemTextActive]}>{r.id}</Text>
                      <Text style={styles.regionItemSubtext}>
                        {r.id === 'Neck' ? 'Colo Femoral' : 
                         r.id === 'Troch' ? 'Trocânter' :
                         r.id === 'Inter' ? 'Intertrocantérica' :
                         r.id === 'Ward' ? 'Triângulo de Ward' :
                         'Total Hip'}
                      </Text>
                    </View>
                    <Text style={[styles.regionItemValue, { color: theme.textMuted }]}>{regionData.tScore.toFixed(1)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
        <TouchableOpacity style={[styles.button, styles.buttonFullWidth]} onPress={handleSave} activeOpacity={0.8}>
          <FontAwesome5 name="save" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Salvar Exame do Fêmur</Text>
        </TouchableOpacity>
      </Animated.View>

      {showSaveAnimation && (
        <View style={styles.saveOverlay}>
          <Animated.View style={[styles.saveCircle, { transform: [{ scale: saveSuccessAnim }], opacity: saveSuccessAnim }]}>
            <FontAwesome5 name="check" size={40} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text style={[styles.saveText, { opacity: saveSuccessAnim }]}>Exame do Fêmur Salvo!</Animated.Text>
        </View>
      )}
    </ScrollView>

    {/* Fixed Toolbar - Mobile */}
    {(isNarrow || isMobile) && (
      <View style={styles.fixedToolbar}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.fixedToolBtn, activeTool === tool.id && styles.fixedToolBtnActive]}
            onPress={() => handleToolPress(tool.id)}
          >
            <FontAwesome5 name={tool.icon} size={16} color={activeTool === tool.id ? '#FFFFFF' : '#8892B0'} />
          </TouchableOpacity>
        ))}
        <Text style={styles.fixedZoomText}>{Math.round(zoomLevel * 100)}%</Text>
      </View>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  scrollContent: { paddingBottom: 40 },
  fixedToolbar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 27, 34, 0.97)',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  fixedToolBtn: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 54, 61, 0.6)',
    marginHorizontal: 2,
  },
  fixedToolBtnActive: {
    backgroundColor: '#4A90E2',
  },
  fixedZoomText: {
    color: '#8892B0',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    minWidth: 36,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '600', color: '#FF6B6B', letterSpacing: 2 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerRight: { width: 80, alignItems: 'flex-end' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, color: '#8892B0' },
  patientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    flexWrap: 'wrap',
    gap: 8,
  },
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  patientText: { fontSize: 12, color: '#c9d1d9', fontWeight: '500' },
  patientDivider: { width: 1, height: 14, backgroundColor: '#30363d' },
  editorContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
    minHeight: EDITOR_HEIGHT + 80,
  },
  toolbar: {
    width: TOOLBAR_WIDTH,
    backgroundColor: '#21262d',
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#30363d',
  },
  toolButton: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 3 },
  toolButtonActive: { backgroundColor: '#FF6B6B' },
  zoomIndicator: { marginTop: 'auto', paddingVertical: 8, paddingHorizontal: 4, backgroundColor: '#30363d', borderRadius: 6 },
  zoomText: { fontSize: 9, color: '#8892B0', fontWeight: '600' },
  canvasContainer: { flex: 1, backgroundColor: '#0d1117' },
  rulerTop: {
    height: 20,
    backgroundColor: '#21262d',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  rulerMark: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#30363d', paddingBottom: 2 },
  rulerText: { fontSize: 8, color: '#6e7681' },
  imageArea: { flex: 1, flexDirection: 'row' },
  rulerLeft: { width: 20, backgroundColor: '#21262d', borderRightWidth: 1, borderRightColor: '#30363d' },
  rulerMarkVertical: { flex: 1, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#30363d' },
  imageCanvas: { 
    flex: 1, 
    backgroundColor: '#0a0a0a', 
    position: 'relative', 
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '85%',
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
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
  toolIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  regionLabel: { 
    position: 'absolute', 
    top: 2, 
    left: 2, 
    paddingHorizontal: 4, 
    paddingVertical: 1, 
    borderRadius: 2,
  },
  regionLabelText: { color: '#000', fontSize: 8, fontWeight: '700' },
  dragIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 3,
    borderRadius: 3,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 28,
    height: 28,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    cursor: 'nwse-resize',
    zIndex: 10,
  },
  canvasInfoBar: {
    height: 28,
    backgroundColor: '#21262d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  canvasInfoText: { fontSize: 10, color: '#8892B0' },
  sidePanel: { width: 220, backgroundColor: '#21262d', borderLeftWidth: 1, borderLeftColor: '#30363d' },
  adjustmentPanel: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#30363d' },
  panelTitle: { fontSize: 11, fontWeight: '700', color: '#c9d1d9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sliderContainer: { marginBottom: 16 },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sliderLabel: { fontSize: 11, color: '#8892B0', flex: 1 },
  sliderValue: { fontSize: 11, color: '#FF6B6B', fontWeight: '600' },
  slider: { width: '100%', height: 24 },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#30363d', paddingVertical: 8, borderRadius: 6 },
  resetButtonText: { fontSize: 11, color: '#c9d1d9', fontWeight: '600' },
  roiPanel: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#30363d' },
  roiData: { gap: 12 },
  roiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roiRegionName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  roiStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  roiStatusText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
  roiMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  roiMetricItem: { flex: 1, backgroundColor: '#0d1117', padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#30363d' },
  roiMetricLabel: { fontSize: 9, color: '#8892B0', marginBottom: 4 },
  roiMetricValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  roiMetricUnit: { fontSize: 8, color: '#6e7681', marginTop: 2 },
  areaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  areaText: { fontSize: 11, color: '#8892B0' },
  tScoreBar: { marginTop: 8 },
  tScoreBarBg: { height: 8, flexDirection: 'row', borderRadius: 4, overflow: 'hidden' },
  tScoreZone: { height: '100%' },
  tScoreMarker: { position: 'absolute', top: -2, width: 4, height: 12, backgroundColor: '#FFFFFF', borderRadius: 2, marginLeft: -2 },
  tScoreLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tScoreLabel: { fontSize: 8, color: '#6e7681' },
  fraxPanel: { backgroundColor: '#0d1117', padding: 10, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#FFC10733' },
  fraxTitle: { fontSize: 10, fontWeight: '600', color: '#FFC107', marginBottom: 8 },
  fraxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  fraxLabel: { fontSize: 10, color: '#8892B0' },
  fraxValue: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  roiEmpty: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  roiEmptyText: { fontSize: 11, color: '#8892B0', textAlign: 'center' },
  regionsPanel: { padding: 12, flex: 1 },
  roiSizeControl: {
    backgroundColor: '#0d1117',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  roiSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  roiSizeLabel: {
    flex: 1,
    fontSize: 10,
    color: '#8892B0',
    textTransform: 'uppercase',
  },
  roiSizeValue: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  roiSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roiSizeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiSizeBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#30363d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  roiSizeBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  regionsList: { flex: 1 },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  regionItemActive: { backgroundColor: 'rgba(255, 107, 107, 0.15)', borderColor: '#FF6B6B' },
  regionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  regionItemContent: { flex: 1 },
  regionItemText: { fontSize: 12, color: '#8892B0', fontWeight: '600' },
  regionItemTextActive: { color: '#FFFFFF' },
  regionItemSubtext: { fontSize: 9, color: '#6e7681', marginTop: 2 },
  regionItemValue: { fontSize: 11, color: '#6e7681', fontWeight: '600' },
  controls: { paddingHorizontal: 12, paddingTop: 16, flexDirection: 'row', gap: 12 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B6B', borderRadius: 10, paddingVertical: 14, gap: 10 },
  buttonFullWidth: { flex: 1 },
  buttonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  saveOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 17, 23, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  saveCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#238636', justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 20 },
  editorContainerMobile: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
  toolbarMobile: {
    flexDirection: 'row',
    width: '100%',
    height: TOOLBAR_WIDTH,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    paddingVertical: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  sidePanelMobile: {
    width: '100%',
    maxHeight: 400,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
});
