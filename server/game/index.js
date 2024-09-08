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

const gameHandler = (socket, rooms, roomName, roomConfig) => {
  const startRound = ({ roomId }) => {
    const live = Math.floor(Math.random() * 3) + 1;
    const fakes = Math.floor(Math.random() * 3);
    let bulletArr = createRandomizedArray(live, fakes);
    var equipments = {};
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
    var turn = (gameDetails.turn + 1) % gameDetails.memberNo;

    var i = 6;
    while (i) {
      if (roomName[roomId][players[turn]].lives === 0) {
        turn = (turn + 1) % gameDetails.memberNo;
      } else {
        break;
      }
      i--;
    }
    gameDetails.turn = turn;
  };

  const checkGameOver = (roomId) => {
    const roomStats = roomName[roomId];
    const players = Object.keys(roomStats);
    const alivePlayers = players.filter(
      (player) => roomStats[player].lives > 0
    );

    if (alivePlayers.length === 1) {
      // Last player standing - emit game over
      socket.emit("game-over", { winner: alivePlayers[0], roomId: roomId });
      socket
        .to(roomId)
        .emit("game-over", { winner: alivePlayers[0], roomId: roomId });
      return true;
    }
    return false;
  };

  const shootPlayer = ({ shooter, victim, roomId }) => {
    const gameDetails = roomConfig[roomId];
    try {
      const roomStats = roomName[roomId];
      const damage = roomStats[shooter].hasDoubleDamage ? 2 : 1;
      var livesTaken = 0;
      const shooterDetails = roomStats[shooter];
      const isBulletLive = gameDetails.bulletArr.pop();

      // If the bullet is live and the victim is not shielded, apply damage
      if (!roomStats[victim].isShielded && isBulletLive) {
        roomStats[victim].lives = Math.max(0, roomStats[victim].lives - damage);
        livesTaken = damage;
      }

      // Check if the victim is out of lives
      if (roomStats[victim].lives === 0) {
        // Optionally add death logic here
      }

      // If the shooter doesn't have double turn or the shot wasn't on themselves with a fake bullet, switch turns
      if (
        !shooterDetails.hasDoubleTurn &&
        !(shooter === victim && !isBulletLive)
      ) {
        decideTurn(roomId);
      }

      // Reset equipment effects for the shooter and victim
      roomStats[shooter] = {
        ...roomStats[shooter],
        hasDoubleDamage: false,
        hasDoubleTurn: false,
        canLookBullet: false,
      };
      roomStats[victim] = { ...roomStats[victim], isShielded: false };

      // Emit the shot results
      socket.to(roomId).emit("player-shot", {
        isBulletLive,
        shooter,
        victim,
        livesTaken: livesTaken,
        currentTurn: gameDetails.turn,
        playerTurn: Object.keys(roomStats)[gameDetails.turn],
      });
      socket.emit("player-shot", {
        isBulletLive,
        shooter,
        victim,
        livesTaken: livesTaken,
        currentTurn: gameDetails.turn,
        playerTurn: Object.keys(roomStats)[gameDetails.turn],
      });

      checkGameOver(roomId);

      // If no more bullets remain in the round, start a new round
      if (gameDetails.bulletArr.length === 0) {
        socket.emit("round-over");
        setTimeout(() => {
          startRound({ roomId });
        }, 5000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const useEquipment = ({ roomId, player, equipmentType }) => {
    const room = roomName[roomId];
    var effect = "";
    effect = effectMap[equipmentType];
    if (!effect) {
      return;
    }
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

  socket.on("start-round", startRound);
  socket.on("shoot-player", shootPlayer);
  socket.on("use-equipment", useEquipment);
  socket.on("rotate", handleRotate);
};

module.exports = { gameHandler };
