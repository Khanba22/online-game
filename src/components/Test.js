import React, { useEffect, useRef, useState } from "react";
import "./Test.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Test() {
  const [position, setPosition] = useState([]);
  const [turn, setTurn] = useState(0);
  const PLAYERS = 4;
  const [dice, setDice] = useState(0);
  const [timer, setTimer] = useState(0);
  const COLORS = ["red", "blue", "green", "yellow"];
  const diceRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.on("join-room",(roomId,members)=>{

    })



    return () => {
      socket.disconnect();
    };
  },[]);

  useEffect(() => {
    let arr = [];
    for (let index = 0; index < PLAYERS; index++) {
      arr.push({ x: 0, y: 0, color: COLORS[index] });
    }
    setPosition(arr);
  }, []);

  const handleMove = (i) => {
    let arr = position;
    if (arr[i].x === 9) {
      arr[i].x = 0;
      arr[i].y = position[i].y + 1;
    } else {
      arr[i].x = position[i].x + 1;
    }
    console.log(arr);
    setPosition(arr);
    setTimer(0);
  };

  useEffect(() => {
    if (timer === 0) {
      setTimeout(() => {
        setTimer(1);
      }, 500);
    }
  }, [timer]);

  const rollDice = () => {
    diceRef.current.disabled = true;
    const num = Math.ceil(Math.random() * 6);
    console.log(num);
    setDice(num);
  };

  useEffect(() => {
    if (dice !== 0 && timer !== 0) {
      handleMove(turn);
      setDice(dice - 1);
    }
    if (dice === 0 && timer === 0) {
      setTurn((turn + 1) % PLAYERS);
      diceRef.current.disabled = false;
    }
  }, [dice, timer]);

  return (
    <div className="container">
      <div className="gameContainer">
        {position.map((piece, i) => {
          return (
            <div
              key={i}
              className="piece"
              style={{
                backgroundColor: piece.color,
                top: `${piece.y * 10}%`,
                left: `${piece.x * 10}%`,
              }}
            ></div>
          );
        })}
      </div>
      <p>{position[turn] ? position[turn].color : 0}</p>
      <button ref={diceRef} onClick={rollDice}>
        ROLL
      </button>
    </div>
  );
}

export default Test;
