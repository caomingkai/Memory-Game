import React from "react";
import ReactDOM from "react-dom";

import Game from './components/Game'
import './index.css';

const App = () => {
  return <Game />;
};

ReactDOM.render(<App />, document.getElementById("index"));
