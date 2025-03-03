import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { RoomProvider } from "./contexts/socketContext";
import { Provider } from "react-redux";
import Store from "./redux/Store";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <Provider store={Store}>
        <RoomProvider>
          <App />
        </RoomProvider>
      </Provider>
    </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
