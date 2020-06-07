import React from "react";

import { Link } from "react-router-dom";

import logo from "../../assets/logo.svg";
import { FiLogIn } from "react-icons/fi";

import "./styles.css";

const Home = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="E-coleta" />
        </header>
        <main>
          <h1>E-coleta</h1>
          <p>
            Ajudamos você a encontrar um ponto de coleta de materiais
            descartáveis.
          </p>
          <Link to="/create-point">
            <span>
              <FiLogIn />
            </span>
            <strong>Cadastre um ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Home;
