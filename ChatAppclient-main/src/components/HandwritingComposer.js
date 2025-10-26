import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const INK_COLOR = '#1f4aa8';
const STROKE_WIDTH = 3.2;

const buildPathFromPoints = (points) => {
  if (!Array.isArray(points) || !points.length) return '';
  const [first, ...rest] = points;
  const segments = rest.map((point) => `L${point.x},${point.y}`).join(' ');
  return `M${first.x},${first.y} ${segments}`;
};

export default function HandwritingComposer({ visible, onClose, onSubmit }) {
  const [strokes, setStrokes] = useState([]);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 240 });
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setStrokes((previous) => [
            ...previous,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              points: [{ x: locationX, y: locationY }],
            },
          ]);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setStrokes((previous) => {
            if (!previous.length) return previous;
            const updated = [...previous];
            const currentStroke = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...currentStroke,
              points: [...currentStroke.points, { x: locationX, y: locationY }],
            };
            return updated;
          });
        },
      }),
    [],
  );

  const handleClear = useCallback(() => {
    setStrokes([]);
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes((previous) => previous.slice(0, -1));
  }, []);

  useEffect(() => {
    if (visible) {
      setCanvasReady(false);
    } else {
      setCanvasReady(false);
      setStrokes([]);
    }
  }, [visible]);

  const handleSubmit = useCallback(async () => {
    if (!canvasReady) {
      Alert.alert('Canvas not ready', 'The handwriting canvas is still preparing.');
      return;
    }
    try {
      if (!strokes.length) {
        return;
      }

      onSubmit?.({
        strokes: strokes.map((stroke) => ({
          id: stroke.id,
          points: stroke.points.map((point) => ({ x: point.x, y: point.y })),
        })),
        size: canvasSize,
      });
      setStrokes([]);
    } catch (error) {
      console.warn('Failed to submit handwriting', error);
      Alert.alert('Send failed', 'We could not send the handwriting. Please try again.');
    }
  }, [canvasReady, canvasSize, onSubmit, strokes]);

  const handleClose = useCallback(() => {
    setStrokes([]);
    setCanvasReady(false);
    onClose?.();
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Handwritten Message</Text>
        <View style={styles.canvasContainer}>
          <View
            style={styles.canvasBackground}
            {...panResponder.panHandlers}
            collapsable={false}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setCanvasSize({ width, height });
              setCanvasReady(true);
            }}
          >
            <Svg
              style={styles.svg}
              pointerEvents="none"
              viewBox={`0 0 ${canvasSize.width || 1} ${canvasSize.height || 1}`}
            >
              {strokes.map((stroke) => (
                <Path
                  key={stroke.id}
                  d={buildPathFromPoints(stroke.points)}
                  stroke={INK_COLOR}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeOpacity={0.92}
                  fill="none"
                />
              ))}
            </Svg>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUndo} disabled={!strokes.length}>
            <Text style={styles.actionText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClear} disabled={!strokes.length}>
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton]}
            onPress={handleSubmit}
            disabled={!strokes.length || !canvasReady}
          >
            <Text style={[styles.actionText, styles.submitText]}>Send</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(31,74,168,0.18)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  canvasBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5e60ce',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    color: '#5e60ce',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#5e60ce',
  },
  submitText: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  closeText: {
    color: '#333',
    fontSize: 15,
  },
});
