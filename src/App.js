import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import "./App.css";
import GamePage from "./pages/GamePage";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Room />} path="/room/:id" />
        <Route element={<GamePage />} path="/game/:id" />
      </Routes>
    </>
  );
};

export default App;
