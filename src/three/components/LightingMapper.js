import React from "react";

const pointLightData = [
  {
    position: [2.76, 2, 0.1],
    intensity: 1.6,
    power: 10,
    decay: 1,
    castShadow: true,
    color: "#FFDD99",
  },
  { position: [4, 4.4, -2.4], intensity: 0.6, castShadow: true },
  {
    position: [1, 4.5, 6.3],
    intensity: 0.6,
    castShadow: true,
    color: "#FFEECC",
  },
  { position: [0, 3.5, 0], intensity: 0.9, color: "#FFEECC" },
  { position: [5.5, 3, 6.5], intensity: 0.4, color: "#505050" },
  { position: [-5.5, 3, 6.5], intensity: 0.4, color: "#505050" },
  { position: [5.5, 3, -6.5], intensity: 0.4, color: "#505050" },
  { position: [-5.5, 3, -6.5], intensity: 0.4, color: "#505050" },
];
const LightingMapper = () => {
  return (
    <>
      <ambientLight intensity={1} />
      {pointLightData.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          power={light.power}
          decay={light.decay}
          castShadow={light.castShadow}
          color={light.color}
        />
      ))}
    </>
  );
};

export default LightingMapper;
