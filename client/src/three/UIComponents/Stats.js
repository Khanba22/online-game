import React from "react";
import "./Stats.css";
import { useSelector } from "react-redux";

const Stats = ({ lives, round, turn, otherStats, playerTurn }) => {
  const renderHearts = (lives) => {
    const hearts = [];
    for (let i = 0; i < lives; i++) {
      hearts.push(
        <img key={i} src="/assets/heart.png" alt="heart" className="heart" />
      );
    }
    return hearts;
  };

  const otherPlayerData = useSelector((state) => state.otherPlayerData);
  const players = Object.keys(otherPlayerData);

  return (
    <div className="stats-container">
      {players.map((player) => {
        return (
          <div key={player} className="stats-item">
            <span>{player} : </span>
            <div className="hearts">
              {renderHearts(otherPlayerData[player].lives)}
            </div>
          </div>
        );
      })}
      <div className="stats-item">
        <span>Lives: </span>
        <div className="hearts">{renderHearts(lives)}</div>
      </div>
      <div className="stats-item">
        <span>Round: </span>
        <span>{round}</span>
      </div>
      <div className="stats-item">
        <span>Shooter: </span>
        <span>{playerTurn}</span>
      </div>
      <div className="stats-item">
        <span>Other Stats: </span>
        <span>{otherStats}</span>
      </div>
    </div>
  );
};

export default Stats;
