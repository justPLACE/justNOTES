import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
const Initial = () => {
  return (
    <View>
      <Image
        source={require('../../Components/images/index.jpg')}
        style={styles.properties}
      />
    </View>
  );
};

export default Initial;

const styles = StyleSheet.create({
  properties: {
    height: 500,
    width: 300,
    marginTop: 50,
    marginLeft: 500,
  },
});
