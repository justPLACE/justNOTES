import React from 'react';
import Navbar from './Components/Navbar';
import {StyleSheet} from 'react-native';
import {NativeBaseProvider} from 'native-base';
import {Routes, Route} from 'react-router-native';
import Register from './Pages/Register';
import Initial from './Pages/Initial';
import Login from './Pages/Login';
import {BrowserRouter} from 'react-router-dom';
import Account from './Pages/Account';
import Notes from './Pages/Notes';

const App = () => {
  return (
    <NativeBaseProvider>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Initial />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </BrowserRouter>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: '#fff',
  },
  link: {
    color: '#1B95E0',
  },
  button: {
    borderRadius: 3,
    padding: 20,
    marginVertical: 10,
    marginTop: 10,
    backgroundColor: '#1B95E0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
