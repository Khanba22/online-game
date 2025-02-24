"use client";

import { Circle, GuitarIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const WinnerPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    toast.success(`Congratulations ${params.winner}! You're the champion!`, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, [params.winner]);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center z-10">
        <h1 className="text-gray-300 text-center w-full bg-transparent p-3 text-7xl font-extrabold tracking-wider uppercase">
          GAME OVER
        </h1>
        <h1 className="text-gray-400 mb-10 text-center w-full bg-transparent p-3 text-4xl font-semibold">
          The Champion is{" "}
          <span className="text-gray-100 bg-gradient-to-r from-gray-500 to-gray-200 bg-clip-text text-transparent">
            {params.winner}
          </span>
        </h1>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={() => navigate(`/room/${params.id}`)}
            className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-500 text-gray-100 font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:from-gray-600 hover:to-gray-400"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gradient-to-r from-red-700 to-red-500 text-gray-100 font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:from-red-600 hover:to-red-400"
          >
            Quit Room
          </button>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            <div className="text-gray-500 text-opacity-30 text-4xl"><Circle/></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnerPage;
