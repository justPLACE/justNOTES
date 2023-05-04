import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TextArea, Button, Input} from 'native-base';
import Note from '../../Components/Note';
import EditNote from '../../Components/EditNote';
const Notes = () => {
  return (
    <View style={styles.viewDad}>
      <View style={styles.firstSection}>
        <Text style={styles.textTitle}>Notes - 0</Text>
        <Text style={styles.text}>No notes found, add your first note </Text>
        <Note></Note>
        <EditNote></EditNote>
      </View>

      <View style={styles.secondSection}>
        <Text style={styles.secondTextTitle}>Add Note</Text>

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
        <View style={styles.configButtonSave}>
          <Button style={styles.buttonSave}>Cancel</Button>
        </View>
      </View>
    </View>
  );
};

export default Notes;

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
    marginTop: 20,
  },
  secondTextTitle: {
    marginLeft: 200,
    marginTop: 100,
    fontSize: 30,
    marginBottom: 10,
  },
  viewTextArea: {
    marginLeft: 200,
    marginBottom: 10,
  },

  viewDad: {
    display: 'flex',
    flexDirection: 'row',
  },
  firstSection: {
    flex: 1,
  },
  secondSection: {
    flex: 2,
  },
  buttonSave: {
    backgroundColor: '#178754',
  },

  configButtonSave: {
    marginLeft: 200,
    marginRight: 650,
    marginTop: 20,
  },
});
