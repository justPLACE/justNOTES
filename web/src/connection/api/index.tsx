import {sha512} from 'js-sha512';
import {useContext} from 'react';
import Context from '../../Components/Context';

const API_URL = 'http://localhost:8090';

export const cadastro = async (nome: string, email: string, senha: string) => {
  const response = await fetch(`${API_URL}/users`, {
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
  const response = await fetch(`${API_URL}/users/auth`, {
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

  const secondResponse = await fetch(`${API_URL}/users/auth`, {
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

export const useApi = () => {
  const {jwt} = useContext(Context);
  return {
    getUser: async () => {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: jwt,
        },
      });

      return await response.json();
    },
  };
};
