import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button} from 'native-base';

export const Note = ({
  title,
  deleteNotes,
  editarNotas,
}: {
  title: string;
  deleteNotes: () => void;
  editarNotas: () => void;
}) => {
  return (
    <View>
      <Text style={styles.titleNote}>{title}</Text>
      <View style={styles.buttonSBS}>
        <View style={styles.configButtonEdit}>
          <Button style={styles.buttonEdit} onPress={editarNotas}>
            {/*Quando o botão de editar for clicado, 
          executará a função de editarNotas que está dentro do componente EditNote */}
            Edit
          </Button>
        </View>
        <View style={styles.configButtonRemove}>
          <Button style={styles.buttonRemove} onPress={deleteNotes}>
            Remove
          </Button>
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

export default Note;
