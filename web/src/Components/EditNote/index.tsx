import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button} from 'native-base';

const EditNote = () => {
  return (
    <View>
      <Text style={styles.titleNote}>Title Note</Text>
      <View style={styles.buttonSBS}>
        <View style={styles.configButtonEdit}>
          <Button style={styles.buttonEdit}>Edit</Button>
        </View>
        <View style={styles.configButtonRemove}>
          <Button style={styles.buttonRemove}>Remove</Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleNote: {
    fontSize: 20,
    marginLeft: 180,
    marginTop: 20,
  },
  buttonEdit: {
    backgroundColor: '#fcc008',
  },
  buttonRemove: {
    backgroundColor: '#bb2c38',
  },
  configButtonEdit: {
    marginLeft: 180,
    marginRight: 20,
    marginTop: 20,
  },
  configButtonRemove: {
    marginRight: 800,
    marginTop: 20,
  },
  buttonSBS: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export default EditNote;
