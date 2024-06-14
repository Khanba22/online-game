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
    console.log(roomName[roomId]);
    console.log("Equipments", equipments);
    roomConfig[roomId].bulletArr = bulletArr;
    socket.emit("round-started", { bulletArr, equipments });
  };
  socket.on("start-round", startRound);
};

module.exports = { gameHandler };
