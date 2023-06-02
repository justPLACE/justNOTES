import React, {useState, useEffect, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useApi} from '../../connection/api';
import {useNavigate} from 'react-router-dom';
import Context from '../../Components/Context';
const Account = () => {
  const [nome, setNome] = useState('');
  const [emailState, setEmailState] = useState('');
  let navigate = useNavigate();
  const {jwt} = useContext(Context);
  const {getUser} = useApi();
  useEffect(() => {
    if (jwt) {
      const func = async () => {
        const {name, email} = await getUser();
        setNome(name);
        setEmailState(email);
      };
      func();
    } else {
      navigate('/');
    }
  }, [jwt]);

  return (
    <View>
      <Text style={styles.textTitle}>User Account</Text>
      <Text style={styles.text}>Name - {nome}</Text>
      <Text style={styles.text}>Email - {emailState}</Text>
    </View>
  );
};

export default Account;

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
    color: '#8c8e96',
  },
});
