import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

import api from "../../services/api";

import "./styles.css";
import Axios from "axios";

/**
 * TypeScript:
 * Como criamos um estado , precisamos definir o tipo da variavel
 */
interface Item {
  id: number;
  title: string;
  imagePath: string;
}
interface UFsIBGEResponse {
  sigla: string;
  nome: string;
}
interface CitiesByUFIBGEResponse {
  id: number;
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUFs] = useState<UFsIBGEResponse[]>([]);
  const [cities, setCities] = useState<CitiesByUFIBGEResponse[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedMapPosition, setSelectedMapPosition] = useState<
    [number, number]
  >([0, 0]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [pointRegistered, setPointRegistered] = useState(false);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("/items").then((response) => {
      setItems(response.data.items);
    });
  }, []);

  useEffect(() => {
    Axios.get<UFsIBGEResponse[]>(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((response) => {
        setUFs(response.data.map((estado) => estado));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") return;
    Axios.get<CitiesByUFIBGEResponse[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
    )
      .then((response) => {
        setCities(response.data.map((city) => city));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedMapPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(itemId: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === itemId);
    if (alreadySelected >= 0) {
      const filteredSelectedItems = selectedItems.filter(
        (item) => item !== itemId
      );
      setSelectedItems(filteredSelectedItems);
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedMapPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    await api.post("/points", data);

    setPointRegistered(true);
  }

  function handleCloseConfirmationModal() {
    history.push("/");
  }

  let confirmationModal = null;
  if (!pointRegistered) {
    confirmationModal = (
      <div id="confirmationModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={handleCloseConfirmationModal}>
            &times;
          </span>
          <p>
            <FiSave />
            Ponto de coleta registrado com sucesso!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="page-create-point">
      {confirmationModal}
      <header>
        <img src="" alt="" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para a Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro de ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field-group">
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="field-group">
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

          <Map center={initialPosition} zoom={17} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedMapPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">UF</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione</option>
                {ufs.map((uf) => {
                  return (
                    <option key={uf.sigla} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="cities"
                id="cities"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="">Selecione</option>
                {cities.map((city) => {
                  return (
                    <option key={city.id} value={city.nome}>
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
            <h2>Items de coleta</h2>
            <span>Selecione os itens</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => {
              return (
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                >
                  <img src={item.imagePath} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <button type="submit">Gravar</button>
      </form>
    </div>
  );
};

export default CreatePoint;
