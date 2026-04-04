// import React, { useEffect, useState } from "react";
// import snakeHead from "../assets/snake-head.png";
// import snakeFood from "../assets/snake-food.png";

// const boardSize = 18;

// const Home = () => {
//   const [snake, setSnake] = useState([{ x: 9, y: 9 }]);
//   const [food, setFood] = useState({ x: 6, y: 7 });
//   const [direction, setDirection] = useState({ x: 0, y: 0 });
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(
//     Number(localStorage.getItem("highScore")) || 0,
//   );
//   const [gameStarted, setGameStarted] = useState(false);
//   const [gameOver, setGameOver] = useState(false);

//   const isCollide = (snakeArr) => {
//     for (let i = 1; i < snakeArr.length; i++) {
//       if (snakeArr[i].x === snakeArr[0].x && snakeArr[i].y === snakeArr[0].y) {
//         return true;
//       }
//     }

//     if (
//       snakeArr[0].x >= boardSize ||
//       snakeArr[0].x <= 0 ||
//       snakeArr[0].y >= boardSize ||
//       snakeArr[0].y <= 0
//     ) {
//       return true;
//     }

//     return false;
//   };

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (gameOver) return;

//       switch (e.key) {
//         case "ArrowUp":
//           if (!gameStarted) setGameStarted(true);
//           if (direction.y !== 1) setDirection({ x: 0, y: -1 });
//           break;
//         case "ArrowDown":
//           if (!gameStarted) setGameStarted(true);
//           if (direction.y !== -1) setDirection({ x: 0, y: 1 });
//           break;
//         case "ArrowLeft":
//           if (!gameStarted) setGameStarted(true);
//           if (direction.x !== 1) setDirection({ x: -1, y: 0 });
//           break;
//         case "ArrowRight":
//           if (!gameStarted) setGameStarted(true);
//           if (direction.x !== -1) setDirection({ x: 1, y: 0 });
//           break;

//         default:
//           break;
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [direction, gameStarted]);

//   const restartGame = () => {
//     setSnake([{ x: 9, y: 9 }]);
//     setFood({ x: 6, y: 7 });
//     setDirection({ x: 0, y: 0 });
//     setScore(0);
//     setGameStarted(false);
//     setGameOver(false);
//   };

//   useEffect(() => {
//     const interval = setInterval(
//       () => {
//         setSnake((prevSnake) => {
//           if (direction.x === 0 && direction.y === 0) {
//             return prevSnake;
//           }

//           const newSnake = [...prevSnake];
//           score;

//           const head = {
//             x: newSnake[0].x + direction.x,
//             y: newSnake[0].y + direction.y,
//           };

//           const generateFood = (snakeBody) => {
//             let newFood;
//             do {
//               newFood = {
//                 x: Math.floor(Math.random() * 16) + 1,
//                 y: Math.floor(Math.random() * 16) + 1,
//               };
//             } while (
//               snakeBody.some(
//                 (segment) => segment.x === newFood.x && segment.y === newFood.y,
//               )
//             );

//             return newFood;
//           };

//           newSnake.unshift(head);

//           if (head.x === food.x && head.y === food.y) {
//             const newScore = score + 1;
//             setScore(newScore);

//             if (newScore > highScore) {
//               setHighScore(newScore);
//               localStorage.setItem("highScore", newScore);
//             }

//             setFood(generateFood(newSnake));
//           } else {
//             newSnake.pop();
//           }

//           if (isCollide(newSnake)) {
//             setGameOver(true);
//             setDirection({ x: 0, y: 0 });
//             return prevSnake;
//           }

//           return newSnake;
//         });
//       },
//       Math.max(80, 200 - score * 5),
//     );

//     return () => clearInterval(interval);
//   }, [direction, food, score, highScore, gameOver]);

//   return (
//     <div className="relative">
//       <div className="min-h-screen flex flex-col items-center justify-center bg-[#d7f8d7]">
//         <div className="flex justify-between w-[90vmin] text-2xl font-bold m-1">
//           {" "}
//           <div>Score: {score} </div> <div> High Score: {highScore}</div>{" "}
//         </div>
//         <div
//           className="w-[90vmin] h-[90vmin] grid border-2 border-black overflow-hidden relative"
//           style={{
//             gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
//             gridTemplateRows: `repeat(${boardSize}, 1fr)`,
//           }}
//         >
//           {Array.from({ length: boardSize * boardSize }).map((_, index) => {
//             const row = Math.floor(index / boardSize) + 1;
//             const col = (index % boardSize) + 1;

//             return (
//               <div
//                 key={`cell-${index}`}
//                 style={{
//                   gridRowStart: row,
//                   gridColumnStart: col,
//                 }}
//                 className={`${
//                   (row + col) % 2 === 0 ? "bg-green-200" : "bg-green-300"
//                 }`}
//               />
//             );
//           })}

//           {snake.map((segment, index) => {
//             let rotation = "rotate(0deg)";

//             if (direction.x === 1) rotation = "rotate(90deg)";
//             if (direction.x === -1) rotation = "rotate(270deg)";
//             if (direction.y === -1) rotation = "rotate(0deg)";
//             if (direction.y === 1) rotation = "rotate(180deg)";

//             return (
//               <div
//                 key={index}
//                 className={
//                   index === 0
//                     ? "rounded-lg bg-cover bg-center z-10"
//                     : "bg-[#5eda40] rounded-lg z-10"
//                 }
//                 style={{
//                   gridRowStart: segment.y,
//                   gridColumnStart: segment.x,
//                   ...(index === 0 && {
//                     backgroundImage: `url(${snakeHead})`,
//                     backgroundSize: "30px 40px",
//                     backgroundRepeat: "no-repeat",
//                     transform: rotation,
//                   }),
//                 }}
//               />
//             );
//           })}

//           <div
//             className="z-10"
//             style={{
//               gridRowStart: food.y,
//               gridColumnStart: food.x,
//               backgroundImage: `url(${snakeFood})`,
//               backgroundSize: "23px 25px",
//               backgroundRepeat: "no-repeat",
//               backgroundPosition: "center",
//             }}
//           />
//         </div>
//       </div>

//       {!gameStarted && !gameOver && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
//           <div className="bg-white px-6 py-4 rounded-xl shadow-xl text-center">
//             <h2 className="text-3xl font-bold mb-2">Snake Game</h2>
//             <p className="text-lg text-gray-700">
//               Press Any Arrow Key To Start
//             </p>
//           </div>
//         </div>
//       )}

//       {gameOver && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
//           <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center">
//             <h2 className="text-4xl font-bold text-red-600 mb-3">Game Over</h2>
//             <p className="text-xl mb-2">Score: {score}</p>
//             <p className="text-lg mb-4">High Score: {highScore}</p>

//             <button
//               onClick={restartGame}
//               className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
//             >
//               Enter To Start
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;









import React, { useEffect, useState } from "react";
import snakeHead from "../assets/snake-head.png";
import snakeFood from "../assets/snake-food.png";

const boardSize = 18;

const Home = () => {
  const [snake, setSnake] = useState([{ x: 9, y: 9 }]);
const [food, setFood] = useState({
  x: 6,
  y: 7,
});

const [goldenFood, setGoldenFood] = useState(null);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0,
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const isCollide = (snakeArr) => {
    for (let i = 1; i < snakeArr.length; i++) {
      if (snakeArr[i].x === snakeArr[0].x && snakeArr[i].y === snakeArr[0].y) {
        return true;
      }
    }

    if (
      snakeArr[0].x >= boardSize ||
      snakeArr[0].x <= 0 ||
      snakeArr[0].y >= boardSize ||
      snakeArr[0].y <= 0
    ) {
      return true;
    }

    return false;
  };

  const generatePosition = (snakeBody) => {
  let newPosition;

  do {
    newPosition = {
      x: Math.floor(Math.random() * 16) + 1,
      y: Math.floor(Math.random() * 16) + 1,
    };
  } while (
    snakeBody.some(
      (segment) =>
        segment.x === newPosition.x && segment.y === newPosition.y,
    ) ||
    (food.x === newPosition.x && food.y === newPosition.y)
  );

  return newPosition;
};

const generateNormalFood = (snakeBody) => {
  return generatePosition(snakeBody);
};

const generateGoldenFood = (snakeBody) => {
  return generatePosition(snakeBody);
};

useEffect(() => {
  if (!goldenFood) return;

  const timeout = setTimeout(() => {
    setGoldenFood(null);
  }, 5000);

  return () => clearTimeout(timeout);
}, [goldenFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      switch (e.key) {
        case "ArrowUp":
          if (!gameStarted) setGameStarted(true);
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (!gameStarted) setGameStarted(true);
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (!gameStarted) setGameStarted(true);
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (!gameStarted) setGameStarted(true);
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction, gameStarted]);

  const restartGame = () => {
    setSnake([{ x: 9, y: 9 }]);
    // setFood({ x: 6, y: 7 });
   setFood({ x: 6, y: 7 });
setGoldenFood(null);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
  };

  useEffect(() => {
  if (!gameStarted || gameOver) return;

  const goldenInterval = setInterval(() => {
    setGoldenFood((prev) => {
      if (prev) return prev;

      return generateGoldenFood(snake);
    });
  }, 10000);

  return () => clearInterval(goldenInterval);
}, [gameStarted, gameOver, snake]);



  useEffect(() => {
    const interval = setInterval(
      () => {
        setSnake((prevSnake) => {
          if (direction.x === 0 && direction.y === 0) {
            return prevSnake;
          }

          const newSnake = [...prevSnake];
          score;

          const head = {
            x: newSnake[0].x + direction.x,
            y: newSnake[0].y + direction.y,
          };


const generateFood = (snakeBody) => {
  let newFood;

  do {
    const randomType = Math.random();

    let type = "normal";

    if (randomType > 0.85) {
      type = "golden";
    } else if (randomType > 0.7) {
      type = "poison";
    }

    newFood = {
      x: Math.floor(Math.random() * 16) + 1,
      y: Math.floor(Math.random() * 16) + 1,
      type,
    };
  } while (
    snakeBody.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y,
    )
  );

  return newFood;
};

          newSnake.unshift(head);

let ateFood = false;
let newScore = score;

if (head.x === food.x && head.y === food.y) {
  ateFood = true;
  newScore += 1;

  setFood(generateNormalFood(newSnake));
}

if (
  goldenFood &&
  head.x === goldenFood.x &&
  head.y === goldenFood.y
) {
  ateFood = true;
  newScore += 5;
  setGoldenFood(null);
}

if (newScore > highScore) {
  setHighScore(newScore);
  localStorage.setItem("highScore", newScore);
}

setScore(newScore);

if (!ateFood) {
  newSnake.pop();
}

          if (isCollide(newSnake)) {
            setGameOver(true);
            setDirection({ x: 0, y: 0 });
            return prevSnake;
          }

          return newSnake;
        });
      },
      Math.max(80, 200 - score * 5),
    );

    return () => clearInterval(interval);
  }, [direction, food, score, highScore, gameOver]);

  return (
    <div className="relative">
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#d7f8d7]">
        <div className="flex justify-between w-[90vmin] text-2xl font-bold m-1">
          {" "}
          <div>Score: {score} </div> <div> High Score: {highScore}</div>{" "}
        </div>
        <div
          className="w-[90vmin] h-[90vmin] grid border-2 border-black overflow-hidden relative"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          }}
        >
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const row = Math.floor(index / boardSize) + 1;
            const col = (index % boardSize) + 1;

            return (
              <div
                key={`cell-${index}`}
                style={{
                  gridRowStart: row,
                  gridColumnStart: col,
                }}
                className={`${
                  (row + col) % 2 === 0 ? "bg-green-200" : "bg-green-300"
                }`}
              />
            );
          })}

          {snake.map((segment, index) => {
            let rotation = "rotate(0deg)";

            if (direction.x === 1) rotation = "rotate(90deg)";
            if (direction.x === -1) rotation = "rotate(270deg)";
            if (direction.y === -1) rotation = "rotate(0deg)";
            if (direction.y === 1) rotation = "rotate(180deg)";

            return (
              <div
                key={index}
                className={
                  index === 0
                    ? "rounded-lg bg-cover bg-center z-10"
                    : "bg-[#5eda40] rounded-lg z-10"
                }
                style={{
                  gridRowStart: segment.y,
                  gridColumnStart: segment.x,
                  ...(index === 0 && {
                    backgroundImage: `url(${snakeHead})`,
                    backgroundSize: "fit",
                    backgroundRepeat: "no-repeat",
                    transform: rotation,
                  }),
                }}
              />
            );
          })}

          <div
  className="z-10"
  style={{
    gridRowStart: food.y,
    gridColumnStart: food.x,
    backgroundImage: `url(${snakeFood})`,
    backgroundSize: "23px 25px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  }}
/>

{goldenFood && (
  <div
    className="z-10 rounded-full animate-pulse"
    style={{
      gridRowStart: goldenFood.y,
      gridColumnStart: goldenFood.x,
      background:
        "radial-gradient(circle, #fde047 30%, #facc15 60%, #ca8a04 100%)",
      border: "2px solid #fef08a",
      boxShadow: "0 0 12px #facc15",
      margin: "4px",
    }}
  />
)}


        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="bg-white px-6 py-4 rounded-xl shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-2">Snake Game</h2>
            <p className="text-lg text-gray-700">
              Press Any Arrow Key To Start
            </p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center">
            <h2 className="text-4xl font-bold text-red-600 mb-3">Game Over</h2>
            <p className="text-xl mb-2">Score: {score}</p>
            <p className="text-lg mb-4">High Score: {highScore}</p>

            <button
              onClick={restartGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Enter To Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

