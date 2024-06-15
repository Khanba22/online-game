const equipmentList = [
  "heals",
  "looker",
  "shield",
  "doubleDamage",
  "doubleTurn",
];

const gameHandler = (socket, rooms, roomName, roomConfig) => {
  const startRound = ({ roomId }) => {
    const bulletCount = Math.floor(Math.random() * 6) + 4;
    var bulletArr = [];
    var equipments = {};
    for (let int = 0; int < bulletCount; int++) {
      const isLive = Math.random() < 0.6 ? true : false;
      bulletArr.push(isLive);
    }

    Object.keys(roomName[roomId]).forEach((member) => {
      equipments = { ...equipments, [member]: {} };
      for (let index = 0; index < 2; index++) {
        const index = Math.floor(Math.random() * 5);
        if (equipments[member] && equipments[member][equipmentList[index]]) {
          equipments[member][equipmentList[index]] += 1;
        } else {
          equipments[member][equipmentList[index]] = 1;
        }
      }
    });
    roomConfig[roomId].bulletArr = bulletArr;
    socket.emit("round-started", {
      bulletArr,
      equipments,
      turn: roomConfig[roomId].turn,
    });
    socket.to(roomId).emit("round-started", {
      bulletArr,
      equipments,
      turn: roomConfig[roomId].turn,
    });
  };

  const decideTurn = (roomId) => {
    const gameDetails = roomConfig[roomId];
    const players = Object.keys(roomName);
    var turn = (gameDetails.turn + 1) % gameDetails.memberNo;
    while (true) {
      if (roomName[players[turn]].lives === 0) {
        turn = (turn + 1) % gameDetails.memberNo;
      } else {
        break;
      }
    }
    gameDetails.turn = (gameDetails.turn + 1) % gameDetails.memberNo;
  };

  const shootPlayer = ({ shooter, victim, roomId }) => {
    const gameDetails = roomConfig[roomId];
    try {
      const room = roomName[roomId];
      const damage = room[shooter].hasDoubleDamage ? 2 : 1;
      var livesTaken = 0;
      if (!shooter.hasDoubleTurn) {
        decideTurn(roomId);
      }
      if (!room[victim].hasShield) {
        room[victim].lives -= damage;
        livesTaken = damage;
      }
      room[shooter] = {
        ...room[shooter],
        hasDoubleDamage: false,
        hasDoubleTurn: false,
        canLookBullet: false,
      };
      room[victim] = { ...room[victim], hasShield: false };

      socket.to(roomId).emit("player-shot", {
        shooter,
        victim,
        livesTaken: livesTaken,
        turn: gameDetails.turn,
      });
      socket.emit("player-shot", {
        shooter,
        victim,
        livesTaken: livesTaken,
        turn: gameDetails.turn,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const useEquipment = ({ roomId, player, equipmentType }) => {
    const room = roomName[roomId];
    var effect = "";
    switch (equipmentType) {
      case "shield":
        effect = "isShielded";
        break;
      case "doubleDamage":
        effect = "hasDoubleDamage";
        break;
      case "looker":
        effect = "canLookBullet";
        break;
      case "heals":
        effect = "healing";
        break;
      case "doubleTurn":
        effect = "hasDoubleTurn";
        break;
      default:
        return;
    }
    if (effect === "healing") {
      room[player].lives += 1;
    } else {
      room[player][effect] = true;
    }
    console.log(room[player]);
  };

  socket.on("start-round", startRound);
  socket.on("shoot-player", shootPlayer);
  socket.on("use-equipment", useEquipment);
};

module.exports = { gameHandler };
