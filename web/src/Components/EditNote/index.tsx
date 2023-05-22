import React, {useState} from 'react';
import {TextArea, Button, Input} from 'native-base';
import {View, StyleSheet, Text} from 'react-native';
import {Note, useApi} from '../../connection/api';
const EditNote = ({
  editTitleNote,
  editBodyNote,
  editarNotas,
  cancel,
}: {
  cancel: () => void;
  editTitleNote: string;
  editBodyNote: string;
  editarNotas: (editTitleNote: string, editBodyNote: string) => void; //essa função recebe dois parâmetros que são
  //o título e nota sendo editados, ela é passada dentro da função Note(que tem um botão de editar), e também
  //dentro de Notas porque lá o componente EditNote é chamado
}) => {
  const [editTitle, setEditTitle] = useState(editTitleNote);
  const [editBody, setEditBody] = useState(editBodyNote);

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
          value={editTitle}
          onChange={(evento: any) => setEditTitle(evento.target.value)}
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
          value={editBody}
          onChange={(evento: any) => setEditBody(evento.target.value)}
        />
      </View>
      <View style={styles.configButtonRegister}>
        <Button
          style={styles.buttonSave}
          onPress={async () => {
            editarNotas(editTitle, editBody);
          }}>
          Save
        </Button>
      </View>
      <View style={styles.configButtonCancel}>
        <Button style={styles.buttonCancel} onPress={() => cancel()}>
          Cancel
        </Button>
      </View>
    </View>
  );
};

export default EditNote;

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
