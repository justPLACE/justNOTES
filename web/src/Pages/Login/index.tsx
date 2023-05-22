import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Input} from 'native-base';
import {login} from '../../connection/api';
import Context from '../../Components/Context';
import {useNavigate} from 'react-router-dom';

//Criar estado para indicar se deu erro ou não, o tipo a ser usado nesse estado é boolean
//Guardar
const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const {jwt, setJwt} = useContext(Context);
  const [erro, setErro] = useState(false);
  let navigate = useNavigate();
  return (
    <View>
      <Text style={styles.text}>Login to your account</Text>

      <View style={styles.viewTextArea}>
        <Input
          aria-label="t1"
          placeholder="email"
          maxW="300"
          color="#90909a"
          h={7}
          value={email}
          onChange={(evento: any) => setEmail(evento.target.value)}
        />
      </View>
      <View style={styles.viewTextArea}>
        <Input
          w={{
            base: '75%',
            md: '25%',
          }}
          value={senha}
          onChange={(evento: any) => setSenha(evento.target.value)}
          type="password"
          placeholder="password"
        />
      </View>
      <View style={styles.buttonSBS}>
        <View style={styles.configButtonRegister}>
          <Button
            style={styles.buttonRegister}
            onPress={async () => {
              const JWT = await login(email, senha);

              if (JWT) {
                setJwt(JWT);
                navigate('/account');
              } else {
                //aqui altera o estado do erro
                setErro(true);
              }
            }}>
            Login
          </Button>
        </View>
        <View style={styles.configButtonCancel}>
          <Button style={styles.buttonCancel}>Cancel</Button>
        </View>
      </View>
      {erro == true ? <Text>Algo deu errado, tente novamente</Text> : undefined}
    </View>
  );
};

export default Login;

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
  textArea: {
    marginBottom: 10,
  },
  buttonRegister: {
    backgroundColor: '#0e6dfd',
  },
  buttonCancel: {
    backgroundColor: '#6c747c',
  },
  configButtonRegister: {
    marginLeft: 180,
    marginRight: 20,
    marginTop: 20,
  },
  configButtonCancel: {
    marginRight: 800,
    marginTop: 20,
  },
  buttonSBS: {
    display: 'flex',
    flexDirection: 'row',
  },
});
