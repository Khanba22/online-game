const equipmentList = [
  "heal",
  "looker",
  "shield",
  "doubleDamage",
  "doubleTurn",
];

const gameHandler = (socket, rooms, roomName, roomConfig) => {
  const startRound = ({ roomId }) => {
    const bulletCount = Math.floor(Math.random() * 6) + 4;
    var bulletArr = [];
    var equipments = [];
    for (let int = 0; int < bulletCount; int++) {
      const isLive = Math.random() < 0.6 ? true : false;
      bulletArr.push(isLive);
    }
    for (let index = 0; index < roomName[roomId].length; index++) {
      equipments[index] = [];
      for (let i = 0; i < 2; i++) {
        if (true) {
          const equipmentIndex = Math.floor(Math.random() * 5);
          roomName[roomId][index].equipment[equipmentList[equipmentIndex]] += 1;
          equipments[index].push(equipmentList[equipmentIndex]);
        }
      }
    }
    console.log(roomName[roomId]);
    roomConfig[roomId].bulletArr = bulletArr;
    socket.emit("round-started", { bulletArr, equipments });
  };
  socket.on("start-round", startRound);
};

module.exports = { gameHandler };
