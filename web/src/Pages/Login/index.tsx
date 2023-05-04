import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Input} from 'native-base';
const Login = () => {
  return (
    <View>
      <Text style={styles.text}>Login to your account</Text>

      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="email"
          maxW="300"
          color="#90909a"
          h={7}
        />
      </View>
      <View style={styles.viewTextArea}>
        <Input
          w={{
            base: '75%',
            md: '25%',
          }}
          type="password"
          placeholder="password"
        />
      </View>
      <View style={styles.buttonSBS}>
        <View style={styles.configButtonRegister}>
          <Button style={styles.buttonRegister}>Login</Button>
        </View>
        <View style={styles.configButtonCancel}>
          <Button style={styles.buttonCancel}>Cancel</Button>
        </View>
      </View>
    </View>
  );
};

export default Login;

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
  },
  configButtonCancel: {
    marginRight: 800,
    marginTop: 20,
  },
  buttonSBS: {
    display: 'flex',
    flexDirection: 'row',
  },
});
