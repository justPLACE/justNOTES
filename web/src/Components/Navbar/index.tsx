import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button} from 'native-base';

const Navbar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.childContainer}>
        <Text style={styles.text}>My Notes</Text>
      </View>
      <View style={styles.secondChildContainer}>
        <Button style={styles.buttons}>
          <Text style={styles.textButton}>Home</Text>
        </Button>
        <Button style={styles.buttons}>
          <Text style={styles.textButton}>Register </Text>
        </Button>
        <Button style={styles.buttons}>
          <Text style={styles.textButton}>Login</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  childContainer: {
    flex: 3,
    height: 41,
    backgroundColor: 'black',
  },
  secondChildContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  buttons: {
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    paddingTop: 10,
    paddingLeft: 180,
    fontWeight: 'bold',
    fontSize: 17,
  },
  textButton: {
    color: '#90909a',
    fontSize: 12,
  },
});

export default Navbar;
