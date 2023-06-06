import React, {useEffect, useState, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TextArea, Button, Input} from 'native-base';
import Note from '../../Components/Note';
import Context from '../../Components/Context';
import EditNote from '../../Components/EditNote';
import {Note as NoteType, useApi} from '../../connection/api';
import {useNavigate} from 'react-router-dom';

const Notes = () => {
  const [list, setList] = useState([] as NoteType[]); //typecasting

  const [titleNote, setTitleNote] = useState('');
  const [bodyNote, setBodyNote] = useState('');

  const [editingNotes, setEditingNotes] = useState('');
  const {jwt} = useContext(Context);

  const {getNotes, postNotes, deleteNotes, patchNotes} = useApi();
  const navigate = useNavigate();

  const deleteNote = (note: NoteType) => {
    for (const l of list) {
      if (note.id == l.id) {
        deleteNotes(note);
        const nota = list.indexOf(l);
        list.splice(nota, 1);
        setList([...list]);
      }
    }
  };

  //Aqui a função recebe a nota como parâmetro, dentro dela um for of percorre a lista de notas
  //se o id da nota for igual ao id da nota que está sendo percorrida, irá mandar para o backend a nota
  //guardar a posição dela em uma variável, substituir o conteúdo da nota atual pelo novo valor da nota.
  //Após esses processos, irá alterar o estado da lista para que guarde a lista atualizada
  //após finalizar esse processo, passará para o estado que identifica se está sendo editado
  const editNote = async (note: NoteType) => {
    for (const l of list) {
      if (note.id == l.id) {
        const patch = await patchNotes(note);
        const nota = list.indexOf(l);
        list[nota] = patch;
        setList([...list]);
        setEditingNotes('');
      }
    }
  };

  const editar = (note: NoteType) => {
    setEditingNotes(note.id);
  };

  const cancelar = () => {
    setEditingNotes('');
  };
  useEffect(() => {
    if (jwt) {
      const retornoBackend = async () => {
        setList(await getNotes());
      };
      retornoBackend();
    } else {
      navigate('/');
    }
  }, [jwt]);

  return (
    <View style={styles.viewDad}>
      <View style={styles.firstSection}>
        <Text style={styles.textTitle}>Notes - {list.length}</Text>
        {list.length != 0 ? undefined : (
          <Text style={styles.text}>No notes found, add your first note </Text>
        )}
        {list.map(note => {
          if (editingNotes === note.id) {
            return (
              <EditNote
                cancel={() => cancelar()}
                editTitleNote={note.title}
                editBodyNote={note.body}
                editarNotas={(editTitleNote, editBodyNote) => {
                  const novaNota = {
                    title: editTitleNote,
                    body: editBodyNote,
                    id: note.id,
                  };
                  editNote(novaNota);
                  {
                    /*A função editNote é passada no componente EditNote e em seu parâmetro
                  a nova nota que está sendo editada*/
                  }
                }}></EditNote>
            );
          } else {
            return (
              <Note
                editarNotas={() => editar(note)}
                title={note.title}
                deleteNotes={() => {
                  deleteNote(note);
                }}></Note>
            );
          }
        })}
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
            value={titleNote}
            onChange={(evento: any) => setTitleNote(evento.target.value)}
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
            value={bodyNote}
            onChange={(evento: any) => setBodyNote(evento.target.value)}
          />
        </View>
        <View style={styles.configButtonSave}>
          <Button
            style={styles.buttonSave}
            onPress={async () => {
              if (titleNote == '' || bodyNote == '') {
                undefined;
              } else {
                const nota = await postNotes(titleNote, bodyNote);
                setList([...list, nota]);
                setBodyNote('');
                setTitleNote('');
              }
            }}>
            Save
          </Button>
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
