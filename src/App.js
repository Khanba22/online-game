import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import "./App.css";
import GamePage from "./pages/GamePage";
import GameUI from "./three/UI/GameUI";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Room />} path="/room/:id" />
        <Route element={<GamePage />} path="/game/:id" />
      </Routes>
    </>
  );
};

export default App;
