const equipmentList = [
  "heals",
  "looker",
  "shield",
  "doubleDamage",
  "doubleTurn",
  "skip",
];

const effectMap = {
  shield: "isShielded",
  doubleDamage: "hasDoubleDamage",
  looker: "canLookBullet",
  heals: "healing",
  doubleTurn: "hasDoubleTurn",
  skip: "skipTurn",
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
          const equipmentIndex = Math.floor(Math.random() * equipmentList.length);
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

    // Fixed: Use proper loop limit based on number of players
    for (let i = 0; i < gameDetails.memberNo; i++) {
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
      console.log(`🎯 [SHOOT EVENT] Shooter: ${shooter}, Victim: ${victim}, Room: ${roomId}`);
      
      const gameDetails = roomConfig[roomId];
      const roomStats = roomName[roomId];
      
      // Log initial state
      console.log(`📊 [BEFORE SHOT] Victim lives: ${roomStats[victim]?.lives}, Shooter lives: ${roomStats[shooter]?.lives}`);
      console.log(`🔫 [BULLET ARRAY] Before: [${gameDetails.bulletArr.join(', ')}]`);
      
      const isBulletLive = gameDetails.bulletArr.pop();
      let livesTaken = 0;
      
      console.log(`💥 [BULLET RESULT] Is Live: ${isBulletLive}, Bullet Array After: [${gameDetails.bulletArr.join(', ')}]`);

      // Check if victim has shield - shield negates any damage (live or fake)
      if (roomStats[victim].isShielded) {
        // Shield negates damage and is consumed
        livesTaken = 0;
        console.log(`🛡️ [SHIELD] Victim ${victim} has shield - damage negated`);
        roomStats[victim].isShielded = false;
        // Remove shield equipment from victim
        if (roomStats[victim].equipment && roomStats[victim].equipment.shield > 0) {
          roomStats[victim].equipment.shield -= 1;
          console.log(`🛡️ [SHIELD] Shield equipment consumed, remaining: ${roomStats[victim].equipment.shield}`);
        }
      } else if (isBulletLive) {
        // No shield and live bullet - deal damage
        const baseDamage = 1;
        const damage = roomStats[shooter].hasDoubleDamage ? baseDamage * 2 : baseDamage;
        const oldLives = roomStats[victim].lives;
        roomStats[victim].lives = Math.max(0, roomStats[victim].lives - damage);
        livesTaken = damage;
        console.log(`💀 [DAMAGE] ${damage} damage dealt (${oldLives} → ${roomStats[victim].lives} lives)`);
        if (roomStats[shooter].hasDoubleDamage) {
          console.log(`⚔️ [DOUBLE DAMAGE] Shooter ${shooter} has double damage active`);
        }
      } else {
        // Fake bullet with no shield - no damage
        livesTaken = 0;
        console.log(`🎭 [FAKE BULLET] No damage dealt`);
      }

      // Fixed turn logic based on game rules:
      // - If bullet is live: turn goes to next alive player
      // - If bullet is fake: 
      //   - If shooter shot himself: turn stays the same
      //   - If shooter shot someone else: turn goes to next player
      const oldTurn = gameDetails.turn;
      if (isBulletLive) {
        // Live bullet - always pass turn to next alive player
        console.log(`🔄 [TURN] Live bullet - passing turn`);
        decideTurn(roomId);
      } else {
        // Fake bullet - only pass turn if shooter shot someone else
        if (shooter !== victim) {
          console.log(`🔄 [TURN] Fake bullet on other player - passing turn`);
          decideTurn(roomId);
        } else {
          console.log(`🔄 [TURN] Fake bullet on self - keeping turn`);
        }
        // If shooter shot himself with fake bullet, turn stays the same
      }
      console.log(`🔄 [TURN] Turn changed: ${oldTurn} → ${gameDetails.turn}`);

      roomStats[shooter] = {
        ...roomStats[shooter],
        hasDoubleDamage: false,
        hasDoubleTurn: false,
        canLookBullet: false,
      };
      roomStats[victim] = { ...roomStats[victim], isShielded: false };

      // Send complete player data to ensure synchronization
      const shotData = {
        isBulletLive,
        shooter,
        victim,
        livesTaken,
        currentTurn: gameDetails.turn,
        playerTurn: Object.keys(roomStats)[gameDetails.turn],
        victimLives: roomStats[victim].lives,
        shooterLives: roomStats[shooter].lives,
        bulletArr: gameDetails.bulletArr
      };

      console.log(`📤 [BROADCAST] Sending player-shot event to all clients:`, {
        victim: shotData.victim,
        victimLives: shotData.victimLives,
        livesTaken: shotData.livesTaken,
        isBulletLive: shotData.isBulletLive,
        currentTurn: shotData.currentTurn,
        playerTurn: shotData.playerTurn
      });

      socket.to(roomId).emit("player-shot", shotData);
      socket.emit("player-shot", shotData);
      
      console.log(`📊 [AFTER SHOT] Victim lives: ${roomStats[victim].lives}, Shooter lives: ${roomStats[shooter].lives}`);

      // Fixed: Check for game over first, then check if round is over
      if (checkGameOver(roomId)) {
        return; // Game is over, don't start new round
      }

      // Only start new round if bullets are finished AND game is not over
      if (gameDetails.bulletArr.length === 0) {
        socket.emit("round-over");
        setTimeout(() => startRound({ roomId }), 5000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const useEquipment = ({ roomId, player, equipmentType }) => {
    console.log(`⚙️ [EQUIPMENT EVENT] Player: ${player}, Equipment: ${equipmentType}, Room: ${roomId}`);
    
    const room = roomName[roomId];
    const effect = effectMap[equipmentType];

    if (!effect) {
      console.log(`❌ [EQUIPMENT ERROR] Invalid equipment type: ${equipmentType}`);
      return;
    }

    // Check if player has the equipment
    if (!room[player].equipment || !room[player].equipment[equipmentType] || room[player].equipment[equipmentType] <= 0) {
      console.log(`❌ [EQUIPMENT ERROR] Player ${player} doesn't have ${equipmentType}`);
      socket.emit("equipment-error", { message: "You don't have this equipment" });
      return;
    }

    console.log(`📦 [EQUIPMENT] Player ${player} has ${room[player].equipment[equipmentType]} ${equipmentType}(s)`);

    // Consume the equipment
    room[player].equipment[equipmentType] -= 1;
    console.log(`📦 [EQUIPMENT] Consumed 1 ${equipmentType}, remaining: ${room[player].equipment[equipmentType]}`);

    // Apply equipment effects
    let equipmentData = {
      user: player,
      equipment: equipmentType,
      equipmentCount: room[player].equipment[equipmentType],
      lives: room[player].lives,
      isShielded: room[player].isShielded,
      hasDoubleDamage: room[player].hasDoubleDamage,
      canLookBullet: room[player].canLookBullet,
      hasDoubleTurn: room[player].hasDoubleTurn,
      // Send complete player state for synchronization
      playerState: {
        lives: room[player].lives,
        isShielded: room[player].isShielded,
        hasDoubleDamage: room[player].hasDoubleDamage,
        canLookBullet: room[player].canLookBullet,
        hasDoubleTurn: room[player].hasDoubleTurn,
        equipment: { ...room[player].equipment }
      }
    };

    if (effect === "healing") {
      const oldLives = room[player].lives;
      room[player].lives += 1;
      equipmentData.lives = room[player].lives;
      equipmentData.message = `${player} used heal and gained 1 life!`;
      console.log(`❤️ [HEAL] Player ${player} healed: ${oldLives} → ${room[player].lives} lives`);
    } else if (equipmentType === "skip") {
      // Skip turn - move to next alive player
      const oldTurn = roomConfig[roomId].turn;
      decideTurn(roomId);
      equipmentData.message = `${player} used skip turn!`;
      equipmentData.currentTurn = roomConfig[roomId].turn;
      equipmentData.playerTurn = Object.keys(room)[roomConfig[roomId].turn];
      console.log(`⏭️ [SKIP] Turn skipped: ${oldTurn} → ${roomConfig[roomId].turn}`);
    } else {
      room[player][effect] = true;
      equipmentData[effect] = true;
      equipmentData.message = `${player} used ${equipmentType}!`;
      console.log(`✨ [EFFECT] Player ${player} activated ${equipmentType}, ${effect}: true`);
    }

    console.log(`📤 [BROADCAST] Sending used-equipment event to all clients:`, {
      user: equipmentData.user,
      equipment: equipmentData.equipment,
      lives: equipmentData.lives,
      message: equipmentData.message
    });

    // Broadcast equipment usage to ALL clients including the user
    socket.emit("used-equipment", equipmentData);
    socket.to(roomId).emit("used-equipment", equipmentData);
  };

  const handleRotate = ({ rotation, username, roomId }) => {
    socket.to(roomId).emit("rotation", { username, rotation });
  };

  const lookAtBullet = ({ roomId, player }) => {
    const gameDetails = roomConfig[roomId];
    const roomStats = roomName[roomId];
    
    // Check if player has looker equipment and can use it
    if (!roomStats[player].canLookBullet || !roomStats[player].equipment || roomStats[player].equipment.looker <= 0) {
      socket.emit("equipment-error", { message: "You don't have looker equipment or can't use it" });
      return;
    }

    // Check if there are bullets left
    if (gameDetails.bulletArr.length === 0) {
      socket.emit("equipment-error", { message: "No bullets left to look at" });
      return;
    }

    // Show the next bullet (without removing it)
    const nextBullet = gameDetails.bulletArr[gameDetails.bulletArr.length - 1];
    const isLive = nextBullet === 1;
    
    // Consume the looker equipment
    roomStats[player].equipment.looker -= 1;
    roomStats[player].canLookBullet = false;

    socket.emit("bullet-looked", { 
      isLive, 
      player,
      message: `The next bullet is ${isLive ? 'LIVE' : 'FAKE'}` 
    });
    
    socket.to(roomId).emit("player-used-looker", { 
      player,
      message: `${player} used looker equipment` 
    });
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
  socket.on("look-bullet", lookAtBullet);
  socket.on("rotate", handleRotate);
  socket.on("disconnect", handleDisconnect);
  socket.on("reconnect-user", handleReconnect);
};

module.exports = { gameHandler };
