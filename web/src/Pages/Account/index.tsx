import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
const Account = () => {
  return (
    <View>
      <Text style={styles.textTitle}>User Account</Text>
      <Text style={styles.text}>Name - </Text>
      <Text style={styles.text}>Email - </Text>
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
