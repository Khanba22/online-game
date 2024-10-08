const fs = require('fs');
const jsonData = {
  1: {
    signature1: {
      username: "signature1",
      color: "red",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [3.3, -1.11, 0.0],
      rotation: [0, 1.5, 0],
      cameraOffset: [3.0, 2.1, -0.02],
    },
  },
  2: {
    signature1: {
      username: "signature1",
      color: "red",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [3.3, -1.11, 0.0],
      rotation: [0, 1.5, 0],
      cameraOffset: [2.9, 2.1, -0.02],
    },
    signature2: {
      username: "signature2",
      color: "blue",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-3.3, -1.11, 0],
      rotation: [0, -1.5, 0],
      cameraOffset: [-2.9, 2.1, 0],
    },
  },
  3: {
    signature1: {
      username: "signature1",
      color: "red",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [3.3, -1.11, 0.0],
      rotation: [0, 1.5, 0],
      cameraOffset: [3.0, 2.1, -0.02],
    },
    signature2: {
      username: "signature2",
      color: "blue",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-1.5, -1.11, 2.4],
      rotation: [0, -1, 0],
      cameraOffset: [-1.2, 2.1, 2.2],
    },
    signature3: {
      username: "signature3",
      color: "green",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-1, -1.11, -3],
      rotation: [0, 3.6, 0],
      cameraOffset: [-0.85, 2.1, -2.7],
    },
  },
  4: {
    signature1: {
      username: "signature1",
      color: "red",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [3.3, -1.11, 0.0],
      rotation: [0, 1.5, 0],
      cameraOffset: [2.9, 2.1, -0.02],
    },
    signature2: {
      username: "signature2",
      color: "blue",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [0, -1.11, 3.3],
      rotation: [0, 0, 0],
      cameraOffset: [0, 2.1, 2.95],
    },
    signature3: {
      username: "signature3",
      color: "green",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-3.3, -1.11, 0],
      rotation: [0, -1.5, 0],
      cameraOffset: [-2.9, 2.1, 0],
    },
    Mussu: {
      username: "Mussu",
      color: "black",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [0, -1.11, -3.3],
      rotation: [0, 3.14, 0],
      cameraOffset: [0, 2.1, -2.95],
    },
  },
  5: {
    signature1: {
      username: "signature1",
      color: "red",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [3.3, -1.11, 0.0],
      rotation: [0, 1.5, 0],
      cameraOffset: [3.0, 2.1, -0.02],
    },
    signature2: {
      username: "signature2",
      color: "blue",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [0.99, -1.11, 3.24],
      rotation: [0, 0.3, 0],
      cameraOffset: [0.9, 2.1, 2.95],
    },
    signature3: {
      username: "signature3",
      color: "green",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-2.9, -1.11, 1.8],
      rotation: [0, -1, 0],
      cameraOffset: [-2.6, 2.1, 1.6],
    },
    Mussu: {
      username: "Mussu",
      color: "black",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [1.19, -1.11, -3.18],
      rotation: [0, 2.7, 0],
      cameraOffset: [1.05, 2.1, -2.9],
    },
    player5: {
      username: "player5",
      color: "purple",
      lives: 5,
      equipment: {
        shield: 0,
        doubleDamage: 0,
        heals: 0,
        looker: 0,
        doubleTurn: 0,
      },
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false,
      position: [-3.04, -1.11, -1.99],
      rotation: [0, -2.2, 0],
      cameraOffset: [-2.75, 2.1, -1.78],
    },
  },
};

const newJson = {};

Object.keys(jsonData).forEach((val) => {
  const index = jsonData[val];
  newJson[val] = {
    position: [],
    rotation: [],
    cameraOffset: [],
  };
  Object.values(index).forEach((player) => {
    newJson[val].position.push(player.position);
    newJson[val].rotation.push(player.rotation);
    newJson[val].cameraOffset.push(player.cameraOffset);
  });
});

fs.writeFile('output.json', JSON.stringify(newJson, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('JSON data successfully written to output.json');
    }
  });
console.log(newJson);
