import {sha512} from 'js-sha512';

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
