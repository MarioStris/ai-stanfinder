import React, { useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageGalleryProps {
  images: string[];
  height?: number;
}

export function ImageGallery({ images, height = 240 }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  if (!images || images.length === 0) {
    return (
      <View
        style={{ height }}
        className="bg-gray-200 items-center justify-center"
        accessibilityLabel="Nema slike za ovu nekretninu"
      >
        <Text className="text-6xl">🏠</Text>
        <Text className="text-sm text-gray-400 mt-2">Nema slike</Text>
      </View>
    );
  }

  return (
    <View style={{ height }} accessibilityLabel={`Galerija slika, ${images.length} slika`}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode="cover"
            accessibilityLabel={`Slika ${index + 1} od ${images.length}`}
          />
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-0.5 ${
                index === activeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      )}

      <View className="absolute top-3 right-3 bg-black/40 rounded-full px-2 py-0.5">
        <Text className="text-white text-xs font-medium">
          {activeIndex + 1}/{images.length}
        </Text>
      </View>
    </View>
  );
}
