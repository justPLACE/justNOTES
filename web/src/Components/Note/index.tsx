import React from 'react';
import {TextArea, Button, Input} from 'native-base';
import {View, StyleSheet, Text} from 'react-native';
const Note = () => {
  return (
    <View>
      <Text style={styles.text}>Edit Note</Text>

      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="Title"
          maxW="300"
          color="#90909a"
          h={7}
        />
      </View>
      <View style={styles.viewTextArea}>
        <TextArea
          aria-label="t1"
          placeholder="Body"
          maxW="300"
          color="#90909a"
          autoCompleteType=""
          h={20}
        />
      </View>
      <View style={styles.configButtonRegister}>
        <Button style={styles.buttonSave}>Save</Button>
      </View>
      <View style={styles.configButtonCancel}>
        <Button style={styles.buttonCancel}>Cancel</Button>
      </View>
    </View>
  );
};

export default Note;

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
  buttonSave: {
    backgroundColor: '#178754',
  },
  buttonCancel: {
    backgroundColor: '#6c747c',
  },
  configButtonRegister: {
    marginLeft: 180,
    marginRight: 200,
    marginTop: 20,
  },
  configButtonCancel: {
    marginLeft: 180,
    marginRight: 200,
    marginTop: 20,
  },
});
