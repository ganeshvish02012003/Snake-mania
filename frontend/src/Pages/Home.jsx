import React, { useEffect, useRef, useState } from "react";
import snakeHead from "../assets/snake-head.png";
import snakeFood from "../assets/snake-food.png";

const boardSize = 18;

const initialSnake = [{ x: 9, y: 9 }];
const initialFood = { x: 6, y: 7 };

const Home = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [goldenFood, setGoldenFood] = useState(null);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("highScore")) || 0;
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Keep the latest positions available to the golden-food timer.
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const goldenFoodRef = useRef(goldenFood);

  snakeRef.current = snake;
  foodRef.current = food;
  goldenFoodRef.current = goldenFood;

  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const generatePosition = (snakeBody, extraPositions = []) => {
    const occupied = [...snakeBody, ...extraPositions.filter(Boolean)];

    const available = [];

    for (let y = 1; y <= boardSize; y++) {
      for (let x = 1; x <= boardSize; x++) {
        const isOccupied = occupied.some(
          (item) => item.x === x && item.y === y,
        );

        if (!isOccupied) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) return null;

    return available[Math.floor(Math.random() * available.length)];
  };

  const handleDirection = (nextDirection) => {
    if (gameOver) return;

    setDirection((current) => {
      // Prevent reversing directly into the snake's own body.
      if (
        current.x + nextDirection.x === 0 &&
        current.y + nextDirection.y === 0
      ) {
        return current;
      }

      return nextDirection;
    });

    setGameStarted(true);
  };

  // Keyboard controls for desktop.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const key = keyMap[event.key];

      if (!key) return;

      event.preventDefault();
      handleDirection(directions[key]);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver]);

  // Golden food appears every 10 seconds and stays for 5 seconds.
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const goldenInterval = setInterval(() => {
      if (goldenFoodRef.current) return;

      const position = generatePosition(snakeRef.current, [foodRef.current]);

      if (position) setGoldenFood(position);
    }, 10000);

    return () => clearInterval(goldenInterval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!goldenFood) return;

    const timeout = setTimeout(() => {
      setGoldenFood(null);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [goldenFood]);

  // Main game loop.
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (direction.x === 0 && direction.y === 0) return;

    const interval = setInterval(
      () => {
        setSnake((previousSnake) => {
          const head = {
            x: previousSnake[0].x + direction.x,
            y: previousSnake[0].y + direction.y,
          };

          const ateNormal = head.x === food.x && head.y === food.y;

          const ateGolden =
            goldenFood && head.x === goldenFood.x && head.y === goldenFood.y;

          const nextSnake = [head, ...previousSnake];

          // Keep the tail in place when food is eaten.
          if (!ateNormal && !ateGolden) {
            nextSnake.pop();
          }

          const hitWall =
            head.x < 1 ||
            head.x > boardSize ||
            head.y < 1 ||
            head.y > boardSize;

          const hitSelf = nextSnake
            .slice(1)
            .some((segment) => segment.x === head.x && segment.y === head.y);

          if (hitWall || hitSelf) {
            setGameOver(true);
            setDirection({ x: 0, y: 0 });
            return previousSnake;
          }

          if (ateNormal || ateGolden) {
            const points = ateGolden ? 5 : 1;

            setScore((previousScore) => {
              const nextScore = previousScore + points;

              setHighScore((previousHighScore) => {
                const best = Math.max(previousHighScore, nextScore);
                localStorage.setItem("highScore", String(best));
                return best;
              });

              return nextScore;
            });

            if (ateNormal) {
              setFood(
                generatePosition(nextSnake, [goldenFoodRef.current]) ||
                  foodRef.current,
              );
            }

            if (ateGolden) {
              setGoldenFood(null);
            }
          }

          return nextSnake;
        });
      },
      Math.max(80, 200 - score * 5),
    );

    return () => clearInterval(interval);
  }, [direction, food, goldenFood, score, gameStarted, gameOver]);

  const restartGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setGoldenFood(null);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
  };

  const controlButtonClass =
    "flex h-14 w-16 sm:h-16 sm:w-20 items-center justify-center " +
    "rounded-xl border-2 border-green-700 bg-green-500 " +
    "text-3xl font-bold text-white shadow-md transition " +
    "active:scale-90 active:bg-green-700 select-none " +
    "touch-manipulation";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center  bg-[#d7f8d7]">
      <main className="flex min-h-screen flex-col items-center justify-center md:px-3  sm:py-8 md:py-0">
        {/* Mobile Score Section */}
        <div className="mb-2 flex w-full max-w-[620px] items-center justify-between gap-2 md:hidden">
          <div className="rounded-xl border border-green-300 bg-white/80 px-3 py-2 shadow-sm">
            <p className="text-xs font-semibold text-gray-600">SCORE</p>

            <p className="text-xl font-extrabold text-green-700">{score}</p>
          </div>
          <h1 className="text-xl font-extrabold text-green-900">Snake Game</h1>
          <div className="rounded-xl border border-yellow-300 bg-white/80 px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-semibold text-gray-600">BEST</p>

            <p className="text-xl font-extrabold text-yellow-700">
              {highScore}
            </p>
          </div>
        </div>

        <h1 className="text-xl hidden font-extrabold text-green-900 md:flex ">
          Snake Game
        </h1>

        {/* Desktop Score Section */}
        <div className="absolute top-10 right-4 mb-1  max-w-[620px] items-center justify-between gap-2 hidden md:flex">
          <div className="rounded-xl border border-green-300 bg-white/80 px-4 py-0 shadow-sm">
            <p className="text-l font-bold text-gray-600">
              SCORE-
              <span className="text-xl font-bold text-green-700">
                {score}
              </span>{" "}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-300 bg-white/80 px-4 py-0 text-right shadow-sm">
            <p className="text-l font-bold text-gray-600">
              BEST-
              <span className="text-xl font-bold text-yellow-700">
                {highScore}
              </span>{" "}
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-0 mt-8 ml-8 hidden flex-col items-center md:flex">
          <p className="mb-2 text-sm font-semibold text-green-950 lg:hidden">
            Use buttons to control
          </p>
          <p className="mb-2 hidden text-sm font-semibold text-green-950 lg:flex">
            Use arrows keys to control
          </p>
          <p className="mt-2 text-center text-xs text-green-900/80">
            Normal Food: +1 &nbsp; | &nbsp; Golden Food: +5
          </p>

          <button
            type="button"
            onClick={restartGame}
            className="mt-3 rounded-lg border border-green-700 bg-white px-5 py-2 text-sm font-bold text-green-800 shadow-sm transition hover:bg-green-100 active:scale-95"
          >
            Restart Game
          </button>
        </div>

        {/* Responsive square board */}
        <div
          className="w-[90vmin] h-[90vmin] relative grid overflow-hidden rounded-md border-[3px] border-green-950 shadow-xl"
          style={{
            aspectRatio: "1 / 1",
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
            touchAction: "none",
          }}
        >
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const row = Math.floor(index / boardSize) + 1;
            const col = (index % boardSize) + 1;

            return (
              <div
                key={index}
                style={{
                  gridRowStart: row,
                  gridColumnStart: col,
                }}
                className={
                  (row + col) % 2 === 0 ? "bg-green-200" : "bg-green-300"
                }
              />
            );
          })}

          {/* Snake */}
          {snake.map((segment, index) => {
            let rotation = "rotate(0deg)";

            if (direction.x === 1) rotation = "rotate(90deg)";
            if (direction.x === -1) rotation = "rotate(270deg)";
            if (direction.y === 1) rotation = "rotate(180deg)";

            return (
              <div
                key={index}
                style={{
                  gridRowStart: segment.y,
                  gridColumnStart: segment.x,
                  ...(index === 0
                    ? {
                        backgroundImage: `url(${snakeHead})`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transform: rotation,
                      }
                    : {}),
                }}
                className={
                  index === 0
                    ? "z-10 rounded-md"
                    : "z-10 rounded-md border border-green-700/30 bg-[#35b92c]"
                }
              />
            );
          })}

          {/* Normal food */}
          <div
            style={{
              gridRowStart: food.y,
              gridColumnStart: food.x,
              backgroundImage: `url(${snakeFood})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
            className="z-10"
          />

          {/* Golden food: +5 points */}
          {goldenFood && (
            <div
              style={{
                gridRowStart: goldenFood.y,
                gridColumnStart: goldenFood.x,
                background:
                  "radial-gradient(circle, #fef9c3 10%, #facc15 55%, #ca8a04 100%)",
                boxShadow: "0 0 8px #eab308",
                margin: "12%",
              }}
              className="z-10 animate-pulse rounded-full border-2 border-yellow-100"
            />
          )}

          {/* Start overlay */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-3">
              <div className="rounded-2xl bg-white px-4 py-5 text-center shadow-2xl sm:px-7">
                <h2 className="mb-2 text-2xl font-extrabold text-green-800 sm:text-3xl">
                  Snake Game
                </h2>
                <p className="text-sm text-gray-700 sm:text-base">
                  Press an arrow key or tap a control to start.
                </p>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-3">
              <div className="w-full max-w-xs rounded-2xl bg-white px-5 py-6 text-center shadow-2xl">
                <h2 className="mb-3 text-3xl font-extrabold text-red-600 sm:text-4xl">
                  Game Over!
                </h2>

                <p className="mb-1 text-lg">
                  Score: <strong>{score}</strong>
                </p>

                <p className="mb-5 text-base">
                  High Score: <strong>{highScore}</strong>
                </p>

                <button
                  onClick={restartGame}
                  className="w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile controls only */}
        <div className="mt-4 flex flex-col items-center sm:hidden">
          <p className="mb-1 text-sm font-semibold text-green-950">
            Use buttons to control
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div />

            <button
              type="button"
              aria-label="Move up"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.up)}
            >
              ▲
            </button>

            <div />

            <button
              type="button"
              aria-label="Move left"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.left)}
            >
              ◀
            </button>

            <button
              type="button"
              aria-label="Move down"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.down)}
            >
              ▼
            </button>

            <button
              type="button"
              aria-label="Move right"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.right)}
            >
              ▶
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-green-900/80">
            Normal Food: +1 &nbsp; | &nbsp; Golden Food: +5
          </p>

          <button
            type="button"
            onClick={restartGame}
            className="mt-3 rounded-lg border border-green-700 bg-white px-5 py-2 text-sm font-bold text-green-800 shadow-sm transition hover:bg-green-100 active:scale-95"
          >
            Restart Game
          </button>
        </div>

        {/* Mobile landscape controls only */}
        <div className="absolute bottom-12 left-0 mt-4 hidden flex-col items-center md:flex lg:hidden">
          <div className="grid grid-cols-2 gap-2 p-8">
            <button
              type="button"
              aria-label="Move left"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.left)}
            >
              ◀
            </button>

            <button
              type="button"
              aria-label="Move right"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.right)}
            >
              ▶
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 right-0 mt-4 hidden flex-col items-center md:flex lg:hidden">
          <div className="grid grid-rows-2 mr-8 p-8 gap-2">
            <button
              type="button"
              aria-label="Move up"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.up)}
            >
              ▲
            </button>

            <button
              type="button"
              aria-label="Move down"
              className={controlButtonClass}
              onClick={() => handleDirection(directions.down)}
            >
              ▼
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
