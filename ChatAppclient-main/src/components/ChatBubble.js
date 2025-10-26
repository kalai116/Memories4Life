import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { extractHandwritingData } from '../utils/handwriting';

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatBubble({ message, isOwn }) {
  if (!message) return null;

  const timestamp = formatTimestamp(message.createdAt || message.timestamp);
  const handwritingData = extractHandwritingData(message.content);

  const buildPathFromPoints = (points) => {
    if (!Array.isArray(points) || !points.length) return '';
    const [first, ...rest] = points;
    const segments = rest.map((point) => `L${point.x},${point.y}`).join(' ');
    return `M${first.x},${first.y} ${segments}`;
  };

  const renderHandwriting = () => {
    if (!handwritingData) {
      return null;
    }

    if (handwritingData.type === 'image' && handwritingData.dataUrl) {
      return (
        <Image
          source={{ uri: handwritingData.dataUrl }}
          style={styles.handwriting}
          resizeMode="contain"
        />
      );
    }

    if (handwritingData.type === 'strokes' && Array.isArray(handwritingData.strokes)) {
      const width = Number(handwritingData.size?.width) || 320;
      const height = Number(handwritingData.size?.height) || 240;
      const aspectRatio = height ? width / height : 1;
      return (
        <View style={[styles.handwritingVectorContainer, { aspectRatio }]}
        >
          <Svg
            style={styles.handwritingSvg}
            viewBox={`0 0 ${width || 1} ${height || 1}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {handwritingData.strokes.map((stroke, index) => (
              <Path
                key={stroke.id ?? `stroke-${index}`}
                d={buildPathFromPoints(stroke.points)}
                stroke="#1f4aa8"
                strokeWidth={3.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeOpacity={0.92}
                fill="none"
              />
            ))}
          </Svg>
        </View>
      );
    }

    return null;
  };

  const isHandwriting = Boolean(handwritingData);

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.mine : styles.theirs,
        isHandwriting && styles.handwritingContainer,
        isHandwriting && (isOwn ? styles.mineHandwriting : styles.theirsHandwriting),
      ]}
    >
      {isHandwriting ? (
        renderHandwriting()
      ) : (
        <Text style={[styles.content, isOwn && styles.ownContent]}>{message.content}</Text>
      )}
      <Text style={styles.meta}>{message.pending ? 'Sending…' : timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '70%',
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#5e60ce',
    borderBottomRightRadius: 2,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5f7',
    borderBottomLeftRadius: 2,
  },
  content: {
    color: '#1a1a1a',
    fontSize: 15,
  },
  ownContent: {
    color: '#fff',
  },
  handwriting: {
    width: 220,
    height: 160,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  handwritingVectorContainer: {
    width: 220,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31,74,168,0.2)',
    padding: 4,
    overflow: 'hidden',
  },
  handwritingSvg: {
    width: '100%',
    height: '100%',
  },
  handwritingContainer: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    padding: 6,
  },
  mineHandwriting: {
    alignSelf: 'flex-end',
  },
  theirsHandwriting: {
    alignSelf: 'flex-start',
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: '#555',
    textAlign: 'right',
  },
});
