const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;


// import React, { useRef, useEffect, Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
// import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

// const Player = ({ url, position, scale }) => {
//   const group = useRef();
//   const { scene, animations } = useGLTF(url);
//   const { actions } = useAnimations(animations, group);

//   useEffect(() => {
//     if (actions) {
//       Object.keys(actions).forEach((key) => {
//         actions[key]?.play();
//       });
//     }
//     console.log("Player loaded at position:", position);
//   }, [actions, position]);

//   const clonedScene = clone(scene); // Clone the scene to create unique instances

//   return (
//     <group ref={group} dispose={null} position={position} scale={scale}>
//       {clonedScene.children.map((child) => (
//         <primitive key={child.uuid} object={child} />
//       ))}
//     </group>
//   );
// };

// const Scene = () => {
//   return (
//     <Canvas style={{ height: "100vh", width: "100vw" }}>
//       <ambientLight intensity={1} />
//       <Suspense fallback={null}>
//         <Player key="player1" url="/models/player/player.gltf" position={[3, 2, 3]} scale={[1, 1, 1]} />
//         <Player key="player2" url="/models/player/player.gltf" position={[1, 4, 5]} scale={[1, 1, 1]} />
//       </Suspense>
//       <OrbitControls />
//     </Canvas>
//   );
// };

// function App() {
//   return <Scene />;
// }

// export default App;
