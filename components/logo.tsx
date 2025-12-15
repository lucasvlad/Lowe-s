import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// Regular thumbtack images
const REGULAR_THUMBTACKS = [
  require('../assets/images/thumbtacks/blue.png'),
  require('../assets/images/thumbtacks/green.png'),
  require('../assets/images/thumbtacks/pink.png'),
  require('../assets/images/thumbtacks/purple.png'),
  require('../assets/images/thumbtacks/red.png'),
  require('../assets/images/thumbtacks/yellow.png'),
];

// Special rare thumbtacks (1 in 300 chance each)
const SPECIAL_THUMBTACKS = [
  require('../assets/images/thumbtacks/rainbow.png'),
  require('../assets/images/thumbtacks/doge.png'),
];

// Function to select a random thumbtack
const getRandomThumbtack = () => {
  const rareChance = Math.random();

  // 1 in 300 chance for random special thumbtacks
  if (rareChance < 1 / 300) {
    return SPECIAL_THUMBTACKS[
      Math.floor(Math.random() * SPECIAL_THUMBTACKS.length)
    ];
  }

  // Otherwise, pick a random regular thumbtack
  return REGULAR_THUMBTACKS[
    Math.floor(Math.random() * REGULAR_THUMBTACKS.length)
  ];
};

export default function Logo() {
  const { width: screenWidth } = useWindowDimensions();

  // Generate random thumbtacks and rotations for each corner
  const thumbtacks = useMemo(() => {
    return {
      topLeft: {
        image: getRandomThumbtack(),
        rotation: Math.random() * 60 - 30,
      },
      topRight: {
        image: getRandomThumbtack(),
        rotation: Math.random() * 60 - 30,
      },
    };
  }, []);

  const thumbtackSize = 40;

  return (
    <View style={styles.container}>
      {/* Top-left thumbtack */}
      <Image
        source={thumbtacks.topLeft.image}
        style={[
          styles.thumbtack,
          {
            width: thumbtackSize,
            height: thumbtackSize,
            top: -thumbtackSize / 2,
            left: -thumbtackSize / 2,
            transform: [{ rotate: `${thumbtacks.topLeft.rotation}deg` }],
          },
        ]}
      />

      {/* Top-right thumbtack */}
      <Image
        source={thumbtacks.topRight.image}
        style={[
          styles.thumbtack,
          {
            width: thumbtackSize,
            height: thumbtackSize,
            top: -thumbtackSize / 2,
            right: -thumbtackSize / 2,
            transform: [{ rotate: `${thumbtacks.topRight.rotation}deg` }],
          },
        ]}
      />
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 100,
    filter: "drop-shadow(2px 6px 6px #212121ff)",
  },
  thumbtack: {
    paddingTop: 125,
    resizeMode: 'contain',
    filter: "drop-shadow(2px 6px 6px #212121ff)",
    zIndex: 1,
    position: 'absolute',
  },
});
