import React, {useContext} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button} from 'native-base';
import {useNavigate} from 'react-router-dom';
import Context from '../Context';

const Navbar = () => {
  let navigate = useNavigate();

  const {jwt, setJwt} = useContext(Context);
  return (
    <View style={styles.container}>
      <View style={styles.childContainer}>
        <Text style={styles.text}>My Notes</Text>
      </View>
      <View style={styles.secondChildContainer}>
        <Button style={styles.buttons} onPress={() => navigate('/')}>
          <Text style={styles.textButton}>Home</Text>
        </Button>
        {jwt == '' ? (
          <Button style={styles.buttons} onPress={() => navigate('/register')}>
            <Text style={styles.textButton}>Register</Text>
          </Button>
        ) : undefined}
        {jwt != '' ? (
          <Button style={styles.buttons} onPress={() => navigate('/account')}>
            <Text style={styles.textButton}>Account</Text>
          </Button>
        ) : undefined}
        {jwt != '' ? (
          <Button style={styles.buttons} onPress={() => navigate('/notes')}>
            <Text style={styles.textButton}>Notes</Text>
          </Button>
        ) : undefined}
        {jwt == '' ? (
          <Button style={styles.buttons}>
            <Text style={styles.textButton} onPress={() => navigate('/login')}>
              Login
            </Text>
          </Button>
        ) : undefined}
        {jwt != '' ? (
          <Button
            style={styles.buttons}
            onPress={() => {
              setJwt('');
              navigate('/');
            }}>
            <Text style={styles.textButton}>Logout</Text>
          </Button>
        ) : undefined}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  childContainer: {
    flex: 3,
    height: 41,
    backgroundColor: 'black',
  },
  secondChildContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  buttons: {
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    paddingTop: 10,
    paddingLeft: 180,
    fontWeight: 'bold',
    fontSize: 17,
  },
  textButton: {
    color: '#90909a',
    fontSize: 12,
  },
});

export default Navbar;
