import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import "./App.css"

// import CreateRoom from './components/CreateRoom';
// import Room from './components/Room';
// import Test from './components/Test';

const App = () => {
  return (
    <>
      <Routes>
        <Route element = {<Home />} path="/"/>
        <Route element = {<Room/>} path="/room/:id"/>
      </Routes>
    </>
  );
};

export default App;
