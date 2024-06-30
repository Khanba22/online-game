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
    const players = Object.keys(roomName[roomId]);
    var turn = (gameDetails.turn + 1) % gameDetails.memberNo;

    var i = 100;
    while (i) {
      if (roomName[roomId][players[turn]].lives === 0) {
        turn = (turn + 1) % gameDetails.memberNo;
      } else {
        break;
      }
      i--;
    }
    gameDetails.turn = turn;
    console.log("", gameDetails.turn);
  };

  const shootPlayer = ({ shooter, victim, roomId }) => {
    const gameDetails = roomConfig[roomId];
    try {
      const room = roomName[roomId];
      const damage = room[shooter].hasDoubleDamage ? 2 : 1;
      var livesTaken = 0;
      const shooterDetails = room[shooter];
      if (!shooterDetails.hasDoubleTurn) {
        decideTurn(roomId);
      }

      const isBulletLive = gameDetails.bulletArr.pop()
      console.log(isBulletLive , gameDetails.bulletArr)
      if (!room[victim].hasShield || isBulletLive) {
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
        currentTurn: gameDetails.turn,
      });
      socket.emit("player-shot", {
        shooter,
        victim,
        livesTaken: livesTaken,
        currentTurn: gameDetails.turn,
      });
      if (gameDetails.bulletArr.length === 0) {
        startRound({roomId})
      }
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
  };

  socket.on("start-round", startRound);
  socket.on("shoot-player", shootPlayer);
  socket.on("use-equipment", useEquipment);
};

module.exports = { gameHandler };
