import React, {
  useEffect,
  useState,
  ChangeEvent,
  useCallback,
  FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';
import OverlayMessage from '../../components/overlay-message';
import Dropzone from '../../components/DropZone';

interface Item {
  id: number;
  image_url: string;
  title: string;
}

interface UF {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [UFs, setUFs] = useState<UF[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [showSuccessMessage, setShowSuccesMessage] = useState<boolean>(false);

  const [selectedUF, setSelectedUF] = useState<string>('0');
  const [selectedCity, setSelecteCity] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectedUF = (event: ChangeEvent<HTMLSelectElement>) => {
    const UF = event.target.value;
    setSelectedUF(UF);
  };

  const handleSelectedCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const city = event.target.value;
    setSelecteCity(city);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    setSelectedPosition([lat, lng]);
  };

  const handleSelectItem = (itemId: number) => {
    const alreadySelected = selectedItems.findIndex((item) => itemId === item);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(
        (item: number) => itemId !== item
      );
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('points', data);
    setShowSuccesMessage(true);
  };

  useEffect(() => {
    api
      .get('items')
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get<UF[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
      )
      .then((response) => setUFs(response.data));
  }, []);

  useEffect(() => {
    if (selectedUF === '0') {
      setSelecteCity('0');
      setCities([]);
    }
    axios
      .get<City[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((response) => setCities(response.data));
  }, [selectedUF]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  return (
    <>
      <OverlayMessage open={showSuccessMessage} redirect="/" />
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />
          <Link to="/">
            <FiArrowLeft />
            Voltar para home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> ponto do coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile} />

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />{' '}
              <Marker position={selectedPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select
                  name="uf"
                  id="uf"
                  value={selectedUF}
                  onChange={handleSelectedUF}
                >
                  <option value="0">Selecione uma UF</option>
                  {UFs.map((UF: UF) => {
                    return (
                      <option value={UF.sigla} key={UF.sigla}>
                        {UF.nome} - ({UF.sigla})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select
                  name="city"
                  id="city"
                  value={selectedCity}
                  onChange={handleSelectedCity}
                >
                  <option value="0">Selecione uma Cidade</option>
                  {cities.map((city) => {
                    return (
                      <option key={city.nome} value={city.nome}>
                        {city.nome}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>ítems de coleta</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
