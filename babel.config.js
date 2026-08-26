module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // plugins: [
  //   'react-native-reanimated/plugin'
  // ],
  plugins: [
    'react-native-worklets/plugin', // Reanimated 4 needs this, not react-native-reanimated/plugin
  ],
};
