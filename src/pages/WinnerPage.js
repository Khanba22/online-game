import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WinnerPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    console.log(params)
  })
  return (
    <div className="h-screen w-screen text-cyan-50 bg-black">
        <h1>The Winner Is {params.winner}</h1>
      <button
        onClick={() => {
          navigate(`/room/${params.id}`);
        }}
      >
        Play Again
      </button>
      <button onClick={()=>{navigate("/")}}>Quit Room</button>
    </div>
  );
};

export default WinnerPage;
