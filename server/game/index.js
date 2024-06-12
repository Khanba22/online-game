
const gameHandler = (socket,rooms,roomName,roomConfig)=>{
    const startRound = ({roomId})=>{
        const bulletCount = Math.floor(Math.random() * 6) + 4;
        var bulletArr = []
        for (let int = 0; int < bulletCount; int++) {
            const isLive = Math.random() < 0.6 ? true : false;
            bulletArr.push(isLive)
        }
        roomConfig[roomId].bulletArr = bulletArr
        socket.emit("round-started",{bulletArr})
    }
    socket.on("start-round", startRound)
}


module.exports = {gameHandler}