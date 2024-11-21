import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from "./Home";
import GameBoard from "./GameBoard";

/*


Frontend:
1- Clicks: si hago un click dentro del area tengo que mostrar un div en esa zona especifica en la que hice click.
El div debe desaparecer si hago click en otra zona del mapa, pero no fuera de la imaben
2- 

    
*/

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameBoard />}/>
      </Routes>
    </Router>
  )
}

export default App
