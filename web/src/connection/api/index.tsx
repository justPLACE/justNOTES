import {sha512} from 'js-sha512';
import React, {useContext} from 'react';
import Context from '../../Components/Context';

export const cadastro = async (nome: string, email: string, senha: string) => {
  const response = await fetch('http://localhost:8090/users', {
    method: 'POST',
    body: JSON.stringify({
      name: nome,
      email: email,
      passwordHash: sha512(senha + 'justaTI'),
    }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  return response.ok;
};

export const login = async (email: string, senha: string) => {
  const response = await fetch('http://localhost:8090/users/auth', {
    method: 'POST',
    body: JSON.stringify({
      email: email,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    return;
  }
  //guardar o salt em uma variável
  const salt = await response.json();

  //Calcular o primeiro hash com a string fixa do cadastro
  const primeiroHash = sha512(senha + 'justaTI');

  //Calcular a segunda hash concatenando a primeira hash com o salt
  const segundoHash = sha512(primeiroHash + salt);

  //Fazer requisição ao segundo endpoint de autenticação

  const secondResponse = await fetch('http://localhost:8090/users/auth', {
    method: 'PUT',
    body: JSON.stringify({
      email: email,
      secondHash: segundoHash,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!secondResponse.ok) {
    return;
  }

  //Retornar a resposta da requisição que é o JWT
  return await secondResponse.json();
};

export const getUser = async () => {
  const {jwt, setJwt} = useContext(Context);
  const response = await fetch('http://localhost:8090/users/me', {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: jwt,
    },
  });

  return await response.json();
};

export type Note = {title: string; body: string; id: string};

export const useApi = () => {
  const {jwt, setJwt} = useContext(Context);
  return {
    getNotes: async (): Promise<Note[]> => {
      const response = await fetch('http://localhost:8090/notes', {
        method: 'GET',
        headers: {
          Authorization: jwt,
        },
      });
      return await response.json();
    },
    patchNotes: async (note: Note): Promise<Note> => {
      const response = await fetch('http://localhost:8090/notes/' + note.id, {
        method: 'PATCH',
        body: JSON.stringify({
          title: note.title,
          body: note.body,
        }),
        headers: {
          'Content-type': 'application/json',
          Authorization: jwt,
        },
      });
      return await response.json();
    },

    postNotes: async (title: string, bodyNote: string): Promise<Note> => {
      const response = await fetch('http://localhost:8090/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          body: bodyNote,
        }),
        headers: {
          'Content-type': 'application/json',
          Authorization: jwt,
        },
      });

      return await response.json();
    },

    deleteNotes: async (note: Note): Promise<Note> => {
      const response = await fetch('http://localhost:8090/notes/' + note.id, {
        method: 'DELETE',
        headers: {
          Authorization: jwt,
        },
      });
      return await response.json();
    },
  };
};
