import React, { useState, memo } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

const OptimizedImage = memo(({ 
  source, 
  style, 
  resizeMode = 'contain',
  loadingColor = '#00e6e6',
  ...props 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={style}>
      {loading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color={loadingColor} />
        </View>
      )}
      
      <Image
        source={source}
        style={[style, { opacity: loading ? 0 : 1 }]}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        progressiveRenderingEnabled={true}
        fadeDuration={150}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default OptimizedImage;