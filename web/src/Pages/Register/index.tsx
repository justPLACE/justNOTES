import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Input} from 'native-base';
const Register = () => {
  return (
    <View>
      <Text style={styles.text}>Register with us</Text>
      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="Enter username"
          maxW="300"
          color="#90909a"
          h={7}
        />
      </View>
      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="Enter email"
          maxW="300"
          color="#90909a"
          h={7}
        />
      </View>
      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="Enter password"
          maxW="300"
          color="#90909a"
          h={7}
          type="password"
        />
      </View>
      <View style={styles.buttonSBS}>
        <View style={styles.configButtonRegister}>
          <Button style={styles.buttonRegister}>Register</Button>
        </View>
        <View style={styles.configButtonCancel}>
          <Button style={styles.buttonCancel}>Cancel</Button>
        </View>
      </View>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  text: {
    marginTop: 20,
    paddingLeft: 180,
    fontSize: 30,
    marginBottom: 20,
  },
  viewTextArea: {
    marginLeft: 180,
    marginBottom: 10,
  },
  textArea: {
    marginBottom: 10,
  },
  buttonRegister: {
    backgroundColor: '#0e6dfd',
  },
  buttonCancel: {
    backgroundColor: '#6c747c',
  },
  configButtonRegister: {
    marginLeft: 180,
    marginRight: 20,
    marginTop: 20,
    //flex: 1,
  },
  configButtonCancel: {
    marginRight: 800,
    marginTop: 20,
    //flex: 1,
  },
  buttonSBS: {
    display: 'flex',
    flexDirection: 'row',
  },
});
