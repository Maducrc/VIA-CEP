import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, ActivityIndicator, Button} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

  const STORAGE_KEY = "@historico_pesquisa";
 
  const App = () => {
  const [cep, setCep] = useState('');
  const [localidade, setLocalidade] = useState ('');
  const [uf, setUF] = useState ('');
  const [logradouro, setLogradouro] = useState ('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historico, setHistorico] = useState ([]);
  const [mostrarHistorico, setMostrarHistorico] = useState (false);
  
  
  const fetchCepData = async () => {

    setLoading(true);
    setError(null);
    setData(null);
 
    try {
      let url = '';

      if (cep.trim() !== '') {
      url = `https://viacep.com.br/ws/${cep}/json/`;
      } 
      else if (uf && localidade && logradouro) {
        url = `https://viacep.com.br/ws/${uf}/${localidade}/${logradouro}/json/`;
      }

      else {
        setError(new Error('Preencha com um CEP ou UF, Logradouro e Localidade'));
        setLoading (false);
        return;
      }
     
      const response = await fetch (url);
      const json = await response.json();
      
      if (json.erro || json.length === 0) {
        setError(new Error('O endereço digitado não foi encontrado'));
      } 
      else {
        setData(json);

        const termo = cep || `${uf} - ${localidade} - ${logradouro}`;
        const novoHistorico = [termo, ...historico].slice(0, 10);
        setHistorico(novoHistorico);
        salvarHistorico(novoHistorico);

      }
    }
     catch (err) {
      setError(err);
      } finally {
      setLoading(false);
      } 
  };

     const limparInputs = () => {
     setCep ('');
     setUF ('');
     setLocalidade ('');
     setLogradouro ('');
     setData ('');
   }

  useEffect (() => {
  const carregarHistorico = async () => {
    try {
      const salvo = await AsyncStorage.getItem(STORAGE_KEY);
      if (salvo) setHistorico (JSON.parse(salvo)); 
    } 
    catch (err) {
      console.log("Erro ao carregar histórico", err);
    }
  };
    carregarHistorico();
  }, []);

  
  const salvarHistorico = async (novoHistorico) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novoHistorico));
    }
    catch (err){
      console.log("Erro ao salvar histórico", err);
    }
  };
  
  const limparHistorico = async () => {
    try {
     await AsyncStorage.removeItem(STORAGE_KEY); 
     setHistorico([]); 
     setMostrarHistorico(false); 
    } 
    catch (err) {
     console.log("Erro ao limpar histórico", err);
    }
  };
  
 
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Consulta CEP</Text>
      <Text style={styles.introducao}>Pesquise abaixo o endereço desejado por meio do CEP:</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite o CEP (apenas números)"
        keyboardType="numeric"
        maxLength={9}
        value={cep}
        onChangeText={setCep}
      />

      <View>
      <Text style={styles.ou}> ou </Text>
      </View>
      
     <TextInput
      style={styles.log}
      placeholder="Digite uma UF (Ex: SP)" 
      keyboardType="text" 
      value={uf} 
      onChangeText={setUF}
      />

      <TextInput
      style={styles.log}
      placeholder="Digite uma Localidade (Ex: São Paulo)"  
      keyboardType="text" 
      value={localidade} 
      onChangeText={setLocalidade}
      />

      <TextInput
      style={styles.log}
      placeholder="Digite um Logradouro (Ex: Praça da Sé)" 
      keyboardType="text"
      value={logradouro} 
      onChangeText={setLogradouro}
      />
      
      
      <View style={styles.button}>
      <Button title="Buscar" color="#690b98" onPress={fetchCepData}/>
      </View>

      <View style={styles.button}>
      <Button title="Limpar Pesquisa" color="#690b98" onPress={limparInputs} />
      </View>

      <View style={styles.button}>
      <Button title="Histórico de busca" color="#690b98" 
      onPress={() => setMostrarHistorico(!mostrarHistorico)}/></View>
    
      <View style={styles.button}>
      <Button title="Limpar histórico" color="#690b98" onPress={limparHistorico} />
      </View>

      {mostrarHistorico && historico.length > 0 && (
        <View style={styles.resultHist}>
        <Text style={styles.historico}>Buscas recentes:</Text>
         {historico.map((item, index) => (
        <Text key={index} style={styles.value}>{item}</Text>
          ))}
        </View>
      )}

      {loading && 
      <View style={styles.carregando}>
      <ActivityIndicator size={25} color="#690b98" />
      </View>
      }
      {error && <Text style={styles.error}>Erro: {error.message}</Text>}

      {data && Array.isArray(data) ? (
      data.map((item, index) => (
        <View key={index} style={styles.resultContainer}>
          <Text style={styles.label}>CEP: <Text style={styles.value}>{item.cep}</Text></Text>
          <Text style={styles.label}>Logradouro: <Text style={styles.value}>{item.logradouro}</Text></Text>
          <Text style={styles.label}>Bairro: <Text style={styles.value}>{item.bairro}</Text></Text>
          <Text style={styles.label}>Localidade: <Text style={styles.value}>{item.localidade}</Text></Text>
          <Text style={styles.label}>UF: <Text style={styles.value}>{item.uf}</Text></Text>
          <Text style={styles.label}>IBGE: <Text style={styles.value}>{item.ibge}</Text></Text>
          <Text style={styles.label}>GIA: <Text style={styles.value}>{item.gia}</Text></Text>
          <Text style={styles.label}>DDD: <Text style={styles.value}>{item.ddd}</Text></Text>
          <Text style={styles.label}>SIAFI: <Text style={styles.value}>{item.siafi}</Text></Text>
        </View>
        ))
      ) 
      
      : data && !Array.isArray(data) ? (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>CEP: <Text style={styles.value}>{data.cep}</Text></Text>
          <Text style={styles.label}>Logradouro: <Text style={styles.value}>{data.logradouro}</Text></Text>
          <Text style={styles.label}>Bairro: <Text style={styles.value}>{data.bairro}</Text></Text>
          <Text style={styles.label}>Localidade: <Text style={styles.value}>{data.localidade}</Text></Text>
          <Text style={styles.label}>UF: <Text style={styles.value}>{data.uf}</Text></Text>
          <Text style={styles.label}>IBGE: <Text style={styles.value}>{data.ibge}</Text></Text>
          <Text style={styles.label}>GIA: <Text style={styles.value}>{data.gia}</Text></Text>
          <Text style={styles.label}>DDD: <Text style={styles.value}>{data.ddd}</Text></Text>
          <Text style={styles.label}>SIAFI: <Text style={styles.value}>{data.siafi}</Text></Text>
        </View>
      ) : null}
    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f7fa',
    },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#690b98',
    paddingVertical: 5,
    textAlign: 'center',
    marginTop: 20,
  },
   introducao: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 18,
    color: '#690b98'
  },
  input: {
    borderWidth: 1,
    borderColor: '#690b98',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    placeholderTextColor: '#d8b7dd'
    },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#690b98',
    borderRadius: 10,
  },
  label: {
    fontWeight: 'bold',
    color:'#690b98',
    marginTop: 5,
  },
   historico: {
    fontWeight: 'bold',
    color:'#690b98',
    textAlign: 'center'
  },
  value: {
    fontWeight: 'normal',
    color: '#000',
    marginTop: 7
  },
  button: {
    backgroundColor: "#f9f7fa",
    textAlign: 'center',
    marginTop: 5,
  },
  carregando: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 30
  }, 
  log: {
    borderWidth: 1,
    borderColor: '#690b98',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    placeholderTextColor: '#d8b7dd'
  },
  ou: {
    textAlign: 'center',
    fontSize: 12,
    color: '#690b98',
    marginVertical: 10,
  },
  resultHist: {
    marginTop: 25,
    alignItems: 'center'
  }
});

export default App;
