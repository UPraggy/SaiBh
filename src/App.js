import React from 'react';
import Router from './routes';

// CSS globais (ordem importa: fontes e variaveis antes do resto)
import './assets/css/fonts.css';
import './assets/css/colors.css';
import './assets/css/scrollbar.css';
import './assets/css/Principais.css';

function App() {
  return (<div><Router /></div>);
}

export default App;
