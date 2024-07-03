import React from "react";
import "./Stats.css";

const Stats = ({ lives, round, turn, otherStats, playerTurn }) => {
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < lives; i++) {
      hearts.push(
        <img key={i} src="/assets/heart.png" alt="heart" className="heart" />
      );
    }
    return hearts;
  };

  return (
    <div className="stats-container">
      <div className="stats-item">
        <span>Lives: </span>
        <div className="hearts">{renderHearts()}</div>
      </div>
      <div className="stats-item">
        <span>Round: </span>
        <span>{round}</span>
      </div>
      <div className="stats-item">
        <span>Turn: </span>
        <span>{turn}</span>
      </div>
      <div className="stats-item">
        <span>Player: </span>
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
