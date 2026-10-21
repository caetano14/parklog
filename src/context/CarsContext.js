import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletePhoto, persistPhoto } from '../utils/photos';

const STORAGE_KEY = '@parklog/cars'; // mesma chave da versão anterior: os dados mantêm-se
const CarsContext = createContext(null);

export function CarsProvider({ children }) {
    const [cars, setCars] = useState([]); // do mais recente para o mais antigo
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((raw) => raw && setCars(JSON.parse(raw)))
            .catch(() => { })
            .finally(() => setLoaded(true));
    }, []);

    // Só guarda depois de carregar, para nunca apagar dados por engano
    useEffect(() => {
        if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars)).catch(() => { });
    }, [cars, loaded]);

    const addCar = ({ photo, ...data }) =>
        setCars((prev) => [{ id: String(Date.now()), photo: persistPhoto(photo), ...data }, ...prev]);

    const removeCar = (car) => {
        deletePhoto(car.photo);
        setCars((prev) => prev.filter((c) => c.id !== car.id));
    };

    // Nº de registo estilo Pokédex: o carro mais antigo é o Nº 001
    const numberOf = (id) => cars.length - cars.findIndex((c) => c.id === id);

    return (
        <CarsContext.Provider value={{ cars, loaded, addCar, removeCar, numberOf }}>
            {children}
        </CarsContext.Provider>
    );
}

export const useCars = () => useContext(CarsContext);