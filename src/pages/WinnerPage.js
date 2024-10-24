import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const WinnerPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    console.log(params)
  })
  useEffect(() => {
    // const interval = setInterval(() => {
      toast.info("Hello This IS A Toast")
    // }, 3000);

    // return () => {
    //   clearInterval(interval);
    // }
  },[])
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
