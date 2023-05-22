import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {getUser} from '../../connection/api';

const Account = () => {
  const [nome, setNome] = useState('');
  const [emailState, setEmailState] = useState('');

  const func = async () => {
    const {name, email} = await getUser();
    setNome(name);
    setEmailState(email);
  };
  func();

  return (
    <View>
      <Text style={styles.textTitle}>User Account</Text>
      <Text style={styles.text}>Name - {nome}</Text>
      <Text style={styles.text}>Email - {emailState}</Text>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  textTitle: {
    marginLeft: 180,
    marginTop: 20,
    fontSize: 30,
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    marginBottom: 15,
    marginLeft: 180,
    color: '#8c8e96',
  },
});
