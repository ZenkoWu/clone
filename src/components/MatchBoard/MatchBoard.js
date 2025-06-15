import { useState, useEffect } from "react";
import "./MatchBoard.css";
import { useSound } from "../../utils/useSound";
import { checkCombinations } from "../../utils/checkCombinations";
import { findMatches } from "../../utils/findMatches";
import { SOUNDS, COMBINATIONS, SYMBOLS } from "../../constants";

const BOARD_SIZE = 8;
const MIN_MATCH = 3;
const INITIAL_MOVES = 30;
const POINTS_PER_MATCH = 10;

export function MatchBoard() {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(INITIAL_MOVES);
  const [matchedCells, setMatchedCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [combinationPopup, setCombinationPopup] = useState(null);

  const playMoveSound = useSound(SOUNDS.move);
  const playGameOverSound = useSound(SOUNDS.gameOver);
  const playCombinationSound = useSound(SOUNDS.combination);

  // Функция-обертка для воспроизведения звуков
  const playSound = (soundFn) => {
    if (isSoundEnabled) {
      soundFn();
    }
  };
  // Инициализация игрового поля
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        let symbol;
        do {
          symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        } while (
          (col >= 2 &&
            newBoard[row][col - 1] === symbol &&
            newBoard[row][col - 2] === symbol) ||
          (row >= 2 &&
            newBoard[row - 1][col] === symbol &&
            newBoard[row - 2][col] === symbol)
        );
        newBoard[row][col] = symbol;
      }
    }
    setBoard(newBoard);
    setScore(0);
    setMoves(INITIAL_MOVES);
    setGameOver(false);
  };

  const handleCellClick = (row, col) => {
    if (isSwapping || moves <= 0 || gameOver) return;

    if (!selectedCell) {
      setSelectedCell({ row, col });
      return;
    }

    const { row: selectedRow, col: selectedCol } = selectedCell;

    if (isAdjacent(selectedRow, selectedCol, row, col)) {
      swapCells(selectedRow, selectedCol, row, col);
    } else {
      setSelectedCell({ row, col });
    }
  };

  const isAdjacent = (row1, col1, row2, col2) => {
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };

  const swapCells = async (row1, col1, row2, col2) => {
    playSound(playMoveSound);
    setIsSwapping(true);
    const newBoard = [...board];

    // Временный обмен значениями для проверки
    const temp = newBoard[row1][col1];
    newBoard[row1][col1] = newBoard[row2][col2];
    newBoard[row2][col2] = temp;
    setBoard([...newBoard]);

    const matches = findMatches(newBoard, BOARD_SIZE);

    if (matches.length > 0) {
      setMoves(moves - 1);
      await removeMatches(matches, newBoard);
    } else {
      // Возвращаем обратно, если нет совпадений
      newBoard[row2][col2] = newBoard[row1][col1];
      newBoard[row1][col1] = temp;
      setBoard([...newBoard]);
    }

    setSelectedCell(null);
    setIsSwapping(false);

    if (moves - 1 <= 0) {
      endGame();
    }
  };

  const removeMatches = async (matches, currentBoard) => {
    const cellsToRemove = new Set();
    const combinations = checkCombinations(currentBoard, matches, BOARD_SIZE);

    // Добавляем ячейки из комбинаций
    combinations.forEach((combination) => {
      playSound(playCombinationSound);
      combination.cells.forEach(([row, col]) => {
        cellsToRemove.add(`${row},${col}`);
      });

      // Показываем попап комбинации
      setCombinationPopup({
        name: COMBINATIONS[combination.type].name,
        description: COMBINATIONS[combination.type].description,
        points: COMBINATIONS[combination.type].points,
      });

      // Убираем попап через 2 секунды
      setTimeout(() => {
        setCombinationPopup(null);
      }, 2000);

      // Добавляем бонусные очки
      setScore(score + COMBINATIONS[combination.type].points);
    });

    // Добавляем обычные совпадения
    matches.forEach((match) => {
      if (match.direction === "horizontal") {
        for (let i = 0; i < MIN_MATCH; i++) {
          cellsToRemove.add(`${match.row},${match.col + i}`);
        }
      } else {
        for (let i = 0; i < MIN_MATCH; i++) {
          cellsToRemove.add(`${match.row + i},${match.col}`);
        }
      }
    });

    // Устанавливаем анимируемые ячейки
    setMatchedCells(Array.from(cellsToRemove));
    // Ждем завершения анимации (0.5s как в оригинале)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Обновление счета
    setScore(score + cellsToRemove.size * POINTS_PER_MATCH);

    const newBoard = [...currentBoard];
    cellsToRemove.forEach((pos) => {
      const [row, col] = pos.split(",").map(Number);
      newBoard[row][col] = null;
    });

    setBoard([...newBoard]);

    // Задержка для анимации
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Заполнение пустых мест
    await fillEmptySpaces(newBoard);
    // Очищаем анимацию и обновляем доску
    setMatchedCells([]);
  };

  const fillEmptySpaces = async (currentBoard) => {
    const newBoard = [...currentBoard];

    // Падение существующих символов
    for (let col = 0; col < BOARD_SIZE; col++) {
      let emptySpaces = 0;
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (!newBoard[row][col]) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          const newRow = row + emptySpaces;
          newBoard[newRow][col] = newBoard[row][col];
          newBoard[row][col] = null;
        }
      }
    }

    // Добавление новых символов
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (!newBoard[row][col]) {
          const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          newBoard[row][col] = symbol;
        }
      }
    }
    setBoard([...newBoard]);

    // Проверка на новые совпадения
    const newMatches = findMatches(newBoard, BOARD_SIZE);
    if (newMatches.length > 0) {
      await removeMatches(newMatches, newBoard);
    }
  };

  const endGame = () => {
    playSound(playGameOverSound);
    setGameOver(true);
  };

  const toggleSound = () => {
    if (isSoundEnabled) playMoveSound();
    setIsSoundEnabled(!isSoundEnabled);
  };

  const restartGame = () => {
    initializeBoard();
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Научный Три в ряд</h1>
        <div className="controls">
          <button onClick={toggleSound} className="control-button">
            {isSoundEnabled ? "🔊 Звук включен" : "🔇 Включить звук"}
          </button>
          <button onClick={restartGame} className="control-button">
            🔄 Новая игра
          </button>
        </div>
      </header>

      <div className="game-info">
        <div className="score-container">
          <span className="score-label">Счёт: </span>
          <span className="score-value">{score}</span>
        </div>
        <div className="moves-container">
          <span className="moves-label">Ходы: </span>
          <span className="moves-value">{moves}</span>
        </div>
      </div>

      <div className="combinations-list">
        <h2>Комбинации</h2>
        <ul>
          <li>4 в ряд = 50 очков</li>
          <li>5 в ряд = 100 очков</li>
          <li>Т-образная = 75 очков</li>
          <li>L-образная = 75 очков</li>
        </ul>
      </div>

      <div className="board-container">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((cell, colIndex) => {
                const isMatched = matchedCells.includes(
                  `${rowIndex},${colIndex}`
                );
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${isMatched ? "matched" : ""} ${
                      selectedCell?.row === rowIndex &&
                      selectedCell?.col === colIndex
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <div className="game-over-content">
            <h2>Игра окончена!</h2>
            <p>Ваш счёт: {score}</p>
            <button onClick={restartGame} className="control-button">
              Играть снова
            </button>
          </div>
        </div>
      )}

      {combinationPopup && (
        <div className="combination-popup show">
          <h3>{combinationPopup.name}!</h3>
          <p>{combinationPopup.description}</p>
          <p>+{combinationPopup.points} очков</p>
        </div>
      )}
    </div>
  );
}
