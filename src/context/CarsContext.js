import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletePhoto, persistPhoto } from '../utils/photos';
import { normalizeCar } from '../utils/carForm';
import { parseStoredCars } from '../utils/storedCars';

export const STORAGE_KEY = '@parklog/cars'; // mesma chave da versão anterior: os dados mantêm-se
const CarsContext = createContext(null);

export function CarsProvider({ children }) {
  const [cars, setCars] = useState([]); // do mais recente para o mais antigo
  const [loaded, setLoaded] = useState(false);

  const writable = useRef(false); // só se escreve no armazenamento depois de o ler com sucesso

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const { cars: stored, corrupt } = parseStoredCars(raw);
        if (corrupt) {
          // Dados ilegíveis: guarda-se uma cópia antes de a lista vazia poder escrever por cima
          await AsyncStorage.setItem(`${STORAGE_KEY}.corrupt.${Date.now()}`, raw);
        }
        // O país e a raridade vêm sempre das regras atuais (a raridade já não se edita à mão)
        setCars(stored.map(normalizeCar));
        writable.current = true;
      } catch (e) {
        console.warn('Não foi possível ler os carros; não vou escrever por cima', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Só guarda depois de carregar, para nunca apagar dados por engano
  useEffect(() => {
    if (loaded && writable.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars)).catch(() => {});
  }, [cars, loaded]);

  const addCar = ({ photo, ...data }) =>
    setCars((prev) => [{ id: String(Date.now()), createdAt: Date.now(), photo: persistPhoto(photo), ...data }, ...prev]);

  // Só altera os campos dados; o id, a data, a foto e a localização mantêm-se
  const updateCar = (id, changes) =>
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  const removeCar = (car) => {
    deletePhoto(car.photo);
    setCars((prev) => prev.filter((c) => c.id !== car.id));
  };

  // Junta carros importados (sem repetir ids) e mantém a ordem: do mais recente para o mais antigo
  const importCars = (incoming) =>
    setCars((prev) => {
      const have = new Set(prev.map((c) => c.id));
      const merged = [...incoming.filter((c) => !have.has(c.id)).map(normalizeCar), ...prev];
      return merged.sort((a, b) => (b.createdAt ?? Number(b.id)) - (a.createdAt ?? Number(a.id)));
    });

  // Nº de registo estilo Pokédex: o carro mais antigo é o Nº 001
  const numberOf = (id) => cars.length - cars.findIndex((c) => c.id === id);

  return (
    <CarsContext.Provider value={{ cars, loaded, addCar, updateCar, removeCar, importCars, numberOf }}>
      {children}
    </CarsContext.Provider>
  );
}

export const useCars = () => useContext(CarsContext);
