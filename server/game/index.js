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
    console.log(equipments);
    roomConfig[roomId].bulletArr = bulletArr;
    socket.emit("round-started", { bulletArr, equipments });
    socket.to(roomId).emit("round-started", { bulletArr, equipments });
  };

  const shootPlayer = ({ shooter, victim, roomId }) => {
    try {
      const room = roomName[roomId];
      const damage = room[shooter].hasDoubleDamage ? 2 : 1;
      if (!room[victim].hasShield) {
        room[victim].lives -= damage;
      }
      console.log("Shooter");
      console.log(room[shooter]);
      console.log("Victim");
      console.log(room[victim]);
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
