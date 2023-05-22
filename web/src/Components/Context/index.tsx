import React, {createContext, useState} from 'react';

const values = () => {
  const [jwt, setJwt] = useState('');

  return {jwt, setJwt};
};

const Context = createContext({} as ReturnType<typeof values>);

export default Context;

export const NotesContext = ({children}: {children: JSX.Element}) => {
  return <Context.Provider value={values()}>{children}</Context.Provider>;
};
