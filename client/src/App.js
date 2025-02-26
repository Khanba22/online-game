import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import "./App.css";
import GamePage from "./pages/GamePage";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./custom-toast.css";
import WinnerPage from "./pages/WinnerPage";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose = {1000}
        hideProgressBar={true}
        newestOnTop={true}
        closeButton={true}
        pauseOnHover
        rtl={false}
        pauseOnFocusLoss
        toastClassName={"custom-toast"}
        theme="colored"
        transition={Bounce}
      />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Room />} path="/room/:id" />
        <Route element={<GamePage />} path="/game/:id" />
        <Route element = {<WinnerPage/>} path="/victory/:id/:winner" />
      </Routes>
    </>
  );
};

export default App;
