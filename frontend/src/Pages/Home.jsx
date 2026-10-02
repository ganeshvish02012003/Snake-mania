import React, { useEffect, useRef, useState } from "react";
import snakeHead from "../assets/snake-head.png";
import snakeFood from "../assets/snake-food.png";

const boardSize = 18;

const initialSnake = [{ x: 9, y: 9 }];
const initialFood = { x: 6, y: 7 };

// ============================================================
// MP3 FILE PATHS
// ============================================================

const SOUND_PATHS = {
  background: "/sounds/background.mp3",
  eat: "/sounds/eat.mp3",
  goldenFood: "/sounds/golden-food.mp3",
  goldenSpawn: "/sounds/golden-spawn.mp3",
  gameOver: "/sounds/game-over.mp3",
};

const Home = () => {
  // ==========================================================
  // GAME STATE
  // ==========================================================

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [goldenFood, setGoldenFood] = useState(null);
  const [direction, setDirection] = useState({
    x: 0,
    y: 0,
  });

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [difficulty, setDifficulty] = useState("easy");

  const [highScores, setHighScores] = useState(() => {
    return {
      easy: Number(localStorage.getItem("highScore_easy")) || 0,
      medium: Number(localStorage.getItem("highScore_medium")) || 0,
      hard: Number(localStorage.getItem("highScore_hard")) || 0,
      expert: Number(localStorage.getItem("highScore_expert")) || 0,
    };
  });

  const highScore = highScores[difficulty];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // ==========================================================
  // DIFFICULTY / SPEED SETTINGS
  // ==========================================================

  const DIFFICULTY_SETTINGS = {
    easy: {
      name: "Easy",
      startSpeed: 300,
      speedIncrease: 0,
      minSpeed: 90,
    },

    medium: {
      name: "Medium",
      startSpeed: 180,
      speedIncrease: 0,
      minSpeed: 70,
    },

    hard: {
      name: "Hard",
      startSpeed: 140,
      speedIncrease: 0,
      minSpeed: 55,
    },

    expert: {
      name: "Expert",
      startSpeed: 300,
      speedIncrease: 4,
      minSpeed: 35,
    },
  };

  // Current difficulty settings
  const currentDifficulty = DIFFICULTY_SETTINGS[difficulty];

  // Speed calculation
  const getGameSpeed = () => {
    const settings = DIFFICULTY_SETTINGS[difficultyRef.current];

    const speed =
      settings.startSpeed - scoreRef.current * settings.speedIncrease;

    return Math.max(settings.minSpeed, speed);
  };
  // ==========================================================
  // SOUND STATE
  // ==========================================================

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("snakeGameMuted") === "true";
  });

  // ==========================================================
  // GAME REFS
  // ==========================================================

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const goldenFoodRef = useRef(goldenFood);

  const directionRef = useRef(direction);
  const difficultyRef = useRef(difficulty);

  snakeRef.current = snake;
  foodRef.current = food;
  goldenFoodRef.current = goldenFood;
  directionRef.current = direction;
  difficultyRef.current = difficulty;

  // ==========================================================
  // AUDIO REFS
  // ==========================================================

  const backgroundMusicRef = useRef(null);
  const eatSoundRef = useRef(null);
  const goldenFoodSoundRef = useRef(null);
  const goldenSpawnSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);

  const audioInitializedRef = useRef(false);

  // ==========================================================
  // DIRECTIONS
  // ==========================================================

  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  // ==========================================================
  // CREATE AUDIO OBJECTS
  // ==========================================================

  useEffect(() => {
    const backgroundMusic = new Audio(SOUND_PATHS.background);

    const moveSound = new Audio(SOUND_PATHS.move);

    const eatSound = new Audio(SOUND_PATHS.eat);

    const goldenFoodSound = new Audio(SOUND_PATHS.goldenFood);

    const goldenSpawnSound = new Audio(SOUND_PATHS.goldenSpawn);

    const gameOverSound = new Audio(SOUND_PATHS.gameOver);

    const restartSound = new Audio(SOUND_PATHS.restart);

    // --------------------------------------------------------
    // BACKGROUND MUSIC
    // --------------------------------------------------------

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.35;
    backgroundMusic.preload = "auto";

    // --------------------------------------------------------
    // SOUND EFFECT VOLUMES
    // --------------------------------------------------------

    moveSound.volume = 0.25;
    eatSound.volume = 0.65;
    goldenFoodSound.volume = 0.8;
    goldenSpawnSound.volume = 0.5;
    gameOverSound.volume = 0.75;
    restartSound.volume = 0.55;

    // --------------------------------------------------------
    // PRELOAD
    // --------------------------------------------------------

    moveSound.preload = "auto";
    eatSound.preload = "auto";
    goldenFoodSound.preload = "auto";
    goldenSpawnSound.preload = "auto";
    gameOverSound.preload = "auto";
    restartSound.preload = "auto";

    // --------------------------------------------------------
    // STORE REFERENCES
    // --------------------------------------------------------

    backgroundMusicRef.current = backgroundMusic;
    eatSoundRef.current = eatSound;
    goldenFoodSoundRef.current = goldenFoodSound;
    goldenSpawnSoundRef.current = goldenSpawnSound;
    gameOverSoundRef.current = gameOverSound;

    audioInitializedRef.current = true;

    return () => {
      backgroundMusic.pause();

      backgroundMusic.currentTime = 0;

      moveSound.pause();
      eatSound.pause();
      goldenFoodSound.pause();
      goldenSpawnSound.pause();
      gameOverSound.pause();
      restartSound.pause();

      backgroundMusicRef.current = null;
      eatSoundRef.current = null;
      goldenFoodSoundRef.current = null;
      goldenSpawnSoundRef.current = null;
      gameOverSoundRef.current = null;
    };
  }, []);

  // ==========================================================
  // SAFE SOUND PLAY FUNCTION
  // ==========================================================

  const playSound = (audioRef, reset = true) => {
    if (isMuted) return;

    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (reset) {
        audio.currentTime = 0;
      }

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser autoplay restriction.
          // Audio will work after user interaction.
        });
      }
    } catch (error) {
      console.error("Audio error:", error);
    }
  };

  // ==========================================================
  // START BACKGROUND MUSIC
  // ==========================================================

  const startBackgroundMusic = () => {
    if (isMuted) return;

    const music = backgroundMusicRef.current;

    if (!music) return;

    try {
      music.loop = true;

      const playPromise = music.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser blocked autoplay.
          // It will retry on next user interaction.
        });
      }
    } catch (error) {
      console.error("Background music error:", error);
    }
  };

  // ==========================================================
  // STOP BACKGROUND MUSIC
  // ==========================================================

  const stopBackgroundMusic = () => {
    const music = backgroundMusicRef.current;

    if (!music) return;

    try {
      music.pause();
      music.currentTime = 0;
    } catch (error) {
      console.error("Background music stop error:", error);
    }
  };

  // ==========================================================
  // PAUSE BACKGROUND MUSIC
  // ==========================================================

  const pauseBackgroundMusic = () => {
    const music = backgroundMusicRef.current;

    if (!music) return;

    try {
      music.pause();
    } catch (error) {
      console.error("Background music pause error:", error);
    }
  };

  // ==========================================================
  // MUTE / UNMUTE
  // ==========================================================

  const toggleMute = () => {
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    localStorage.setItem("snakeGameMuted", String(nextMuted));

    if (nextMuted) {
      // ------------------------------------------------------
      // MUTE EVERYTHING
      // ------------------------------------------------------

      const allSounds = [
        backgroundMusicRef.current,
        eatSoundRef.current,
        goldenFoodSoundRef.current,
        goldenSpawnSoundRef.current,
        gameOverSoundRef.current,
      ];

      allSounds.forEach((audio) => {
        if (!audio) return;

        try {
          audio.pause();
        } catch (error) {
          console.error("Mute error:", error);
        }
      });
    } else {
      // ------------------------------------------------------
      // UNMUTE
      // ------------------------------------------------------

      if (gameStarted && !gameOver) {
        setTimeout(() => {
          startBackgroundMusic();
        }, 50);
      }
    }
  };

  // ==========================================================
  // POSITION GENERATOR
  // ==========================================================

  const generatePosition = (snakeBody, extraPositions = []) => {
    const occupied = [...snakeBody, ...extraPositions.filter(Boolean)];

    const available = [];

    for (let y = 1; y <= boardSize; y++) {
      for (let x = 1; x <= boardSize; x++) {
        const isOccupied = occupied.some(
          (item) => item.x === x && item.y === y,
        );

        if (!isOccupied) {
          available.push({
            x,
            y,
          });
        }
      }
    }

    if (available.length === 0) {
      return null;
    }

    return available[Math.floor(Math.random() * available.length)];
  };

  // ==========================================================
  // HANDLE DIRECTION
  // ==========================================================

  const handleDirection = (nextDirection) => {
    if (gameOver) return;

    setDirection((current) => {
      if (
        current.x + nextDirection.x === 0 &&
        current.y + nextDirection.y === 0
      ) {
        return current;
      }

      directionRef.current = nextDirection;

      return nextDirection;
    });

    // --------------------------------------------------------
    // START GAME
    // --------------------------------------------------------

    if (!gameStarted) {
      setGameStarted(true);

      setTimeout(() => {
        startBackgroundMusic();
      }, 50);
    }
  };

  // ==========================================================
  // KEYBOARD CONTROLS
  // ==========================================================

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
  }, [gameOver, gameStarted, isMuted]);

  // ==========================================================
  // GOLDEN FOOD SPAWN
  // ==========================================================

  useEffect(() => {
    if (!gameStarted || gameOver) {
      return;
    }

    const goldenInterval = setInterval(() => {
      if (goldenFoodRef.current) {
        return;
      }

      const position = generatePosition(snakeRef.current, [foodRef.current]);

      if (position) {
        setGoldenFood(position);

        // Golden food appearing sound.
        playSound(goldenSpawnSoundRef);
      }
    }, 10000);

    return () => {
      clearInterval(goldenInterval);
    };
  }, [gameStarted, gameOver, isMuted]);

  // ==========================================================
  // GOLDEN FOOD TIMEOUT
  // ==========================================================

  useEffect(() => {
    if (!goldenFood) return;

    const timeout = setTimeout(() => {
      setGoldenFood(null);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [goldenFood]);

  // ==========================================================
  // MAIN GAME LOOP
  // ==========================================================

  useEffect(() => {
    if (!gameStarted || gameOver) {
      return;
    }

    let timeoutId;

    const moveSnake = () => {
      const currentSnake = snakeRef.current;
      const currentDirection = directionRef.current;
      const currentFood = foodRef.current;
      const currentGoldenFood = goldenFoodRef.current;

      // --------------------------------------------------------
      // GAME NOT MOVING YET
      // --------------------------------------------------------

      if (currentDirection.x === 0 && currentDirection.y === 0) {
        timeoutId = setTimeout(moveSnake, getGameSpeed());
        return;
      }

      // --------------------------------------------------------
      // NEW HEAD
      // --------------------------------------------------------

      const head = {
        x: currentSnake[0].x + currentDirection.x,
        y: currentSnake[0].y + currentDirection.y,
      };

      // --------------------------------------------------------
      // FOOD CHECK
      // --------------------------------------------------------

      const ateNormal = head.x === currentFood.x && head.y === currentFood.y;

      const ateGolden =
        currentGoldenFood &&
        head.x === currentGoldenFood.x &&
        head.y === currentGoldenFood.y;

      // --------------------------------------------------------
      // NEW SNAKE
      // --------------------------------------------------------

      const nextSnake = [head, ...currentSnake];

      if (!ateNormal && !ateGolden) {
        nextSnake.pop();
      }

      // --------------------------------------------------------
      // WALL COLLISION
      // --------------------------------------------------------

      const hitWall =
        head.x < 1 || head.x > boardSize || head.y < 1 || head.y > boardSize;

      // --------------------------------------------------------
      // SELF COLLISION
      // --------------------------------------------------------

      const hitSelf = nextSnake
        .slice(1)
        .some((segment) => segment.x === head.x && segment.y === head.y);

      // --------------------------------------------------------
      // GAME OVER
      // --------------------------------------------------------

      if (hitWall || hitSelf) {
        setGameOver(true);

        const stoppedDirection = {
          x: 0,
          y: 0,
        };

        directionRef.current = stoppedDirection;
        setDirection(stoppedDirection);

        pauseBackgroundMusic();
        playSound(gameOverSoundRef);

        return;
      }

      // --------------------------------------------------------
      // UPDATE SNAKE
      // --------------------------------------------------------

      snakeRef.current = nextSnake;
      setSnake(nextSnake);

      // --------------------------------------------------------
      // FOOD EATEN
      // --------------------------------------------------------

      if (ateNormal || ateGolden) {
        const points = ateGolden ? 5 : 1;

        // ======================================================
        // SCORE
        // ======================================================

        const nextScore = scoreRef.current + points;

        scoreRef.current = nextScore;
        setScore(nextScore);

        // ======================================================
        // HIGH SCORE
        // ======================================================

        const currentDifficulty = difficultyRef.current;

        const storageKey = `highScore_${currentDifficulty}`;

        const savedHighScore = Number(localStorage.getItem(storageKey)) || 0;

        const bestScore = Math.max(savedHighScore, nextScore);

        if (bestScore > savedHighScore) {
          localStorage.setItem(storageKey, String(bestScore));
        }

        // Pure state updater
        setHighScores((previousHighScores) => ({
          ...previousHighScores,
          [currentDifficulty]: bestScore,
        }));

        // ======================================================
        // NORMAL FOOD
        // ======================================================

        if (ateNormal) {
          playSound(eatSoundRef);

          const newFood = generatePosition(nextSnake, [currentGoldenFood]);

          if (newFood) {
            foodRef.current = newFood;
            setFood(newFood);
          }
        }

        // ======================================================
        // GOLDEN FOOD
        // ======================================================

        if (ateGolden) {
          playSound(goldenFoodSoundRef);

          goldenFoodRef.current = null;
          setGoldenFood(null);
        }
      }

      // --------------------------------------------------------
      // NEXT MOVE
      // --------------------------------------------------------

      timeoutId = setTimeout(moveSnake, getGameSpeed());
    };

    // First move
    timeoutId = setTimeout(moveSnake, getGameSpeed());

    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameStarted, gameOver]);
  // ==========================================================
  // RESTART GAME
  // ==========================================================

  const restartGame = () => {
    // --------------------------------------------------------
    // RESET GAME
    // --------------------------------------------------------

    setSnake(initialSnake);

    setFood(initialFood);

    setGoldenFood(null);

    setDirection({
      x: 0,
      y: 0,
    });

    scoreRef.current = 0;
    setScore(0);

    setGameStarted(false);

    setGameOver(false);
    // --------------------------------------------------------
    // STOP OLD MUSIC
    // --------------------------------------------------------

    stopBackgroundMusic();
  };

  // ==========================================================
  // CONTROL BUTTON STYLE
  // ==========================================================

  const controlButtonClass =
    "flex h-14 w-16 sm:h-16 sm:w-20 " +
    "items-center justify-center " +
    "rounded-xl border-2 border-green-700 " +
    "bg-green-500 text-3xl font-bold text-white " +
    "shadow-md transition " +
    "active:scale-90 active:bg-green-700 " +
    "select-none touch-manipulation";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#d7f8d7]">
      <main className="flex min-h-screen flex-col items-center justify-center md:px-3 sm:py-8 md:py-0">
        {/* ==================================================
            MOBILE SCORE HEADER
        ================================================== */}

        <div className="mb-2 flex w-full max-w-[620px] items-center justify-between gap-2 md:hidden">
          <div className="rounded-xl border border-green-300 bg-white/80 px-3 py-2 shadow-sm">
            <p className="text-xs font-semibold text-gray-600">SCORE</p>

            <p className="text-xl font-extrabold text-green-700">{score}</p>
          </div>
          <div className="rounded-xl border border-yellow-300 bg-white/80 px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-semibold text-gray-600">BEST</p>

            <p className="text-xl font-extrabold text-yellow-700">
              {highScore}
            </p>
          </div>
        </div>

        {/* ==================================================
            DESKTOP TITLE
        ================================================== */}

        

        {/* ==================================================
            DESKTOP SCORE
        ================================================== */}

        <div className="absolute top-8 right-4 mb-1 max-w-[620px] items-center justify-between gap-2 hidden md:flex">
          <div className="rounded-xl border border-green-300 bg-white/80 px-4 py-0 shadow-sm">
            <p className="text-l font-bold text-gray-600">
              SCORE-
              <span className="text-xl font-bold text-green-700">{score}</span>
            </p>
          </div>

          <div className="rounded-xl border border-yellow-300 bg-white/80 px-4 py-0 text-right shadow-sm">
            <p className="text-l font-bold text-gray-600">
              BEST-
              <span className="text-xl font-bold text-yellow-700">
                {highScore}
              </span>
            </p>
          </div>
        </div>

        {/* ==================================================
            SOUND / MUTE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Turn sound on" : "Mute sound"}
          title={isMuted ? "Turn sound on" : "Mute sound"}
          className="
            absolute
            top-4
            left-4
            z-50
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border-2
            border-green-700
            bg-white
            text-xl
            shadow-lg
            transition
            hover:bg-green-50
            active:scale-50
           
          "
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        {/* ==================================================
            DIFFICULTY SELECTOR
          ================================================== */}

        <div className="absolute top-8 right-4 md:top-20 md:right-4 mb-3 flex items-center justify-center gap-2">
          <label
            htmlFor="difficulty"
            className="text-sm font-bold text-green-950"
          >
            Difficulty:
          </label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameStarted}
            className="
            border-2
            rounded-lg
            bg-white
            border-green-600
            py-1.5
            px-3
            text-sm
            font-bold
           text-green-800
            shadow-sm
            outline-none
            transition
           focus:border-green-800
            focus:ring-2
           focus:ring-green-300
            disabled:cursor-not-allowed
            disabled:opacity-60
             "
          >
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
              <option key={key} value={key}>
                {setting.name}
              </option>
            ))}
          </select>
        </div>

        {/* ==================================================
            DESKTOP INFO
        ================================================== */}

        <div className="absolute top-0 left-0 mt-8 ml-8 hidden flex-col items-center md:flex">
          <h1 className="text-xl font-extrabold text-green-900">
          Snake Game
        </h1>
          <p className="mb-2 text-sm font-semibold text-green-950 lg:hidden">
            Use buttons to control
          </p>

          <p className="mb-2 hidden text-sm font-semibold text-green-950 lg:flex">
            Use arrows keys to control
          </p>

          <p className="mt-2 text-center text-xs text-green-900/80">
            Normal Food: +1 &nbsp; | &nbsp; Golden Food: +5
          </p>
        </div>

        {/* ==================================================
            GAME BOARD
        ================================================== */}

        <div
          className="
            w-[90vmin]
            h-[90vmin]
            relative
            grid
            overflow-hidden
            rounded-md
            border-[3px]
            border-green-950
            shadow-xl
          "
          style={{
            aspectRatio: "1 / 1",
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
            touchAction: "none",
          }}
        >
          {/* =================================================
              BOARD CELLS
          ================================================= */}

          {Array.from({
            length: boardSize * boardSize,
          }).map((_, index) => {
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

          {/* =================================================
              SNAKE
          ================================================= */}

          {snake.map((segment, index) => {
            let rotation = "rotate(0deg)";

            if (direction.x === 1) {
              rotation = "rotate(90deg)";
            }

            if (direction.x === -1) {
              rotation = "rotate(270deg)";
            }

            if (direction.y === 1) {
              rotation = "rotate(180deg)";
            }

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

          {/* =================================================
              NORMAL FOOD
          ================================================= */}

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

          {/* =================================================
              GOLDEN FOOD
          ================================================= */}

          {goldenFood && (
            <div
              style={{
                gridRowStart: goldenFood.y,

                gridColumnStart: goldenFood.x,

                background:
                  "radial-gradient(circle, #fef9c3 10%, #facc15 55%, #ca8a04 100%)",

                boxShadow: "0 0 8px #eab308, 0 0 20px #facc15",

                margin: "12%",
              }}
              className="
                z-10
                animate-pulse
                rounded-full
                border-2
                border-yellow-100
              "
            />
          )}

          {/* =================================================
              START OVERLAY
          ================================================= */}

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-3">
              <div className="rounded-2xl bg-white px-4 py-5 text-center shadow-2xl sm:px-7">
                <div className="mb-2 text-4xl">🐍</div>

                <h2 className="mb-2 text-2xl font-extrabold text-green-800 sm:text-3xl">
                  Snake Game
                </h2>

                <p className="text-sm text-gray-700 sm:text-base">
                  Press an arrow key or tap a control to start.
                </p>
                <div className="mt-3 rounded-lg bg-green-50 px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500">
                    Difficulty
                  </p>

                  <p className="text-lg font-extrabold text-green-700">
                    {DIFFICULTY_SETTINGS[difficulty].name}
                  </p>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  🔊 Background Music & Sound Effects
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              GAME OVER
          ================================================= */}

          {gameOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-3">
              <div className="w-full max-w-xs rounded-2xl bg-white px-5 py-6 text-center shadow-2xl">
                <div className="mb-1 text-4xl">💥</div>

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
                  className="
                    w-full
                    rounded-xl
                    bg-green-600
                    px-5
                    py-3
                    font-bold
                    text-white
                    transition
                    hover:bg-green-700
                    active:scale-95
                  "
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================
            MOBILE CONTROLS
        ================================================== */}

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
        </div>

        {/* ==================================================
            MOBILE LANDSCAPE CONTROLS
        ================================================== */}

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
