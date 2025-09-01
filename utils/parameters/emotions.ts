export const emotions = {
    Joy: '#FFD700', // Gold
    Sadness: '#1E90FF', // Dodger Blue
    Fear: '#FF4500', // Orange Red
    Anger: '#DC143C', // Crimson
    Surprise: '#FF69B4', // Hot Pink
    Disgust: '#32CD32', // Lime Green
    Trust: '#4682B4', // Steel Blue
    Anticipation: '#FFA500', // Orange
    Calm: '#00FA9A', // Medium Spring Green
    Boredom: '#A9A9A9', // Dark Gray
    Love: '#FF1493', // Deep Pink
    Curiosity: '#8A2BE2', // Blue Violet
  };
  
  export type EmotionType = keyof typeof emotions;
  
  export const getEmotionColor = (emotion: EmotionType): string => {
    return emotions[emotion] || '#808080';
  };
  