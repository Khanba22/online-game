const equipmentList = [
  "heals",
  "looker",
  "shield",
  "doubleDamage",
  "doubleTurn",
];

const effectMap = {
  shield: "isShielded",
  doubleDamage: "hasDoubleDamage",
  looker: "canLookBullet",
  heals: "healing",
  doubleTurn: "hasDoubleTurn",
};

function createRandomizedArray(n, m) {
  let arr = new Array(n).fill(true).concat(new Array(m).fill(false));

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffle(arr);
  return arr;
}

const gameHandler = (socket, rooms, roomName, roomConfig, disconnected) => {
  const startRound = ({ roomId }) => {
    const live = Math.floor(Math.random() * 3) + 1;
    const fakes = Math.floor(Math.random() * 3);
    let bulletArr = createRandomizedArray(live, fakes);

    const equipments = Object.fromEntries(
      Object.keys(roomName[roomId]).map((member) => {
        const memberEquipments = {};
        for (let index = 0; index < 2; index++) {
          const equipmentIndex = Math.floor(Math.random() * 5);
          const equipment = equipmentList[equipmentIndex];
          memberEquipments[equipment] = (memberEquipments[equipment] || 0) + 1;
        }
        return [member, memberEquipments];
      })
    );

    console.log(equipments);
    roomConfig[roomId].bulletArr = bulletArr;

    socket.emit("round-started", {
      bulletArr,
      equipments,
      turn: roomConfig[roomId].turn,
      live,
      fakes,
      playerTurn: Object.keys(roomName[roomId])[roomConfig[roomId].turn],
    });

    socket.to(roomId).emit("round-started", {
      bulletArr,
      equipments,
      live,
      fakes,
      turn: roomConfig[roomId].turn,
      playerTurn: Object.keys(roomName[roomId])[roomConfig[roomId].turn],
    });
  };

  const decideTurn = (roomId) => {
    const gameDetails = roomConfig[roomId];
    const players = Object.keys(roomName[roomId]);
    let turn = (gameDetails.turn + 1) % gameDetails.memberNo;

    for (let i = 0; i < 6; i++) {
      if (roomName[roomId][players[turn]].lives > 0) break;
      turn = (turn + 1) % gameDetails.memberNo;
    }

    gameDetails.turn = turn;
  };

  const checkGameOver = (roomId) => {
    const roomStats = roomName[roomId];
    const alivePlayers = Object.keys(roomStats).filter(
      (player) => roomStats[player].lives > 0
    );

    if (alivePlayers.length === 1) {
      socket.emit("game-over", { winner: alivePlayers[0], roomId });
      socket.to(roomId).emit("game-over", { winner: alivePlayers[0], roomId });
      return true;
    }
    return false;
  };

  const shootPlayer = ({ shooter, victim, roomId }) => {
    try {
      const gameDetails = roomConfig[roomId];
      const roomStats = roomName[roomId];
      const damage = roomStats[shooter].hasDoubleDamage ? 2 : 1;
      const isBulletLive = gameDetails.bulletArr.pop();
      let livesTaken = 0;

      if (!roomStats[victim].isShielded && isBulletLive) {
        roomStats[victim].lives = Math.max(0, roomStats[victim].lives - damage);
        livesTaken = damage;
      }

      if (
        !roomStats[shooter].hasDoubleTurn &&
        !(shooter === victim && !isBulletLive)
      ) {
        decideTurn(roomId);
      }

      roomStats[shooter] = {
        ...roomStats[shooter],
        hasDoubleDamage: false,
        hasDoubleTurn: false,
        canLookBullet: false,
      };
      roomStats[victim] = { ...roomStats[victim], isShielded: false };

      socket.to(roomId).emit("player-shot", {
        isBulletLive,
        shooter,
        victim,
        livesTaken,
        currentTurn: gameDetails.turn,
        playerTurn: Object.keys(roomStats)[gameDetails.turn],
      });

      socket.emit("player-shot", {
        isBulletLive,
        shooter,
        victim,
        livesTaken,
        currentTurn: gameDetails.turn,
        playerTurn: Object.keys(roomStats)[gameDetails.turn],
      });

      if (!checkGameOver(roomId) && gameDetails.bulletArr.length === 0) {
        socket.emit("round-over");
        setTimeout(() => startRound({ roomId }), 5000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const useEquipment = ({ roomId, player, equipmentType }) => {
    const room = roomName[roomId];
    const effect = effectMap[equipmentType];

    if (!effect) return;

    if (effect === "healing") {
      room[player].lives += 1;
    } else {
      room[player][effect] = true;
    }

    socket
      .to(roomId)
      .emit("used-equipment", { user: player, equipment: equipmentType });
  };

  const handleRotate = ({ rotation, username, roomId }) => {
    socket.to(roomId).emit("rotation", { username, rotation });
  };

  const handleDisconnect = () => {
    const userRooms = Object.keys(socket.rooms);

    userRooms.forEach((roomId) => {
      if (roomName[roomId] && roomName[roomId][socket.id]) {
        disconnected[roomId] = roomConfig[roomId]; // Save state
        delete roomName[roomId][socket.id];

        socket.to(roomId).emit("user-disconnected", { user: socket.id });

        if (Object.keys(roomName[roomId]).length === 0) {
          delete roomConfig[roomId]; // Cleanup if room is empty
        }
      }
    });
  };

  const handleReconnect = ({ roomId, userId }) => {
    if (disconnected[roomId]) {
      roomConfig[roomId] = disconnected[roomId]; // Restore state
      delete disconnected[roomId];

      socket.join(roomId);
      socket.emit("reconnected", { roomConfig: roomConfig[roomId], roomId });
      socket.to(roomId).emit("user-reconnected", { user: userId });
    }
  };

  socket.on("start-round", startRound);
  socket.on("shoot-player", shootPlayer);
  socket.on("use-equipment", useEquipment);
  socket.on("rotate", handleRotate);
  socket.on("disconnect", handleDisconnect);
  socket.on("reconnect-user", handleReconnect);
};

module.exports = { gameHandler };
