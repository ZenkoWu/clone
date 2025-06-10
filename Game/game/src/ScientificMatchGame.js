import React, { useState, useEffect, useRef } from 'react';
import './css/style.css';
const ScientificMatchGame = () => {
  // Используем только emoji!
  const symbols = ['🧪', '🌡️', '🧫', '⚛️', '🔬', '⚗️'];

  // Константы игры
  const BOARD_SIZE = 8;
  const MIN_MATCH = 3;
  const INITIAL_MOVES = 30;
  const POINTS_PER_MATCH = 10;
  
  // Бонусные комбинации
  const COMBINATIONS = {
    FOUR_IN_ROW: {
      name: 'Четыре в ряд',
      points: 50,
      description: '4 одинаковых элемента в ряд'
    },
    FIVE_IN_ROW: {
      name: 'Пять в ряд',
      points: 100,
      description: '5 одинаковых элементов в ряд'
    },
    T_SHAPE: {
      name: 'Т-образная комбинация',
      points: 75,
      description: 'Т-образное расположение элементов'
    },
    L_SHAPE: {
      name: 'L-образная комбинация',
      points: 75,
      description: 'L-образное расположение элементов'
    }
  };
  
  // Состояние игры
  const [gameState, setGameState] = useState({
    board: [],
    score: 0,
    moves: INITIAL_MOVES,
    selectedCell: null,
    isSwapping: false,
    isSoundEnabled: false,
    combinations: []
  });
  
  const [showGameOver, setShowGameOver] = useState(false);
  const boardRef = useRef(null);
  
  // Инициализация игрового поля
  const initializeBoard = () => {
    const newBoard = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Генерация символа с проверкой на совпадения
        let symbol;
        do {
          symbol = symbols[Math.floor(Math.random() * symbols.length)];
        } while (
          (col >= 2 && 
           newBoard[row][col-1] === symbol && 
           newBoard[row][col-2] === symbol) ||
          (row >= 2 && 
           newBoard[row-1][col] === symbol && 
           newBoard[row-2][col] === symbol)
        );
        
        newBoard[row][col] = symbol;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      score: 0,
      moves: INITIAL_MOVES,
      selectedCell: null,
      isSwapping: false
    }));
    setShowGameOver(false);
  };
  
  // Обработка клика по ячейке
  const handleCellClick = (row, col) => {
    if (gameState.isSwapping || gameState.moves <= 0) return;
    
    if (!gameState.selectedCell) {
      setGameState(prev => ({ ...prev, selectedCell: { row, col } }));
      return;
    }
    
    const selectedCell = gameState.selectedCell;
    
    // Проверка, являются ли ячейки соседними
    if (isAdjacent(selectedCell.row, selectedCell.col, row, col)) {
      swapCells(selectedCell.row, selectedCell.col, row, col);
    } else {
      // Выделяем новую ячейку
      setGameState(prev => ({ ...prev, selectedCell: { row, col } }));
    }
  };
  
  // Проверка, являются ли ячейки соседними
  const isAdjacent = (row1, col1, row2, col2) => {
    return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
           (Math.abs(col1 - col2) === 1 && row1 === row2);
  };
  
  // Обмен ячейками
  const swapCells = async (row1, col1, row2, col2) => {
    setGameState(prev => ({ ...prev, isSwapping: true }));
    
    // Создаем копию доски
    const newBoard = [...gameState.board];
    
    // Обмен значениями
    const temp = newBoard[row1][col1];
    newBoard[row1][col1] = newBoard[row2][col2];
    newBoard[row2][col2] = temp;
    
    setGameState(prev => ({ ...prev, board: newBoard }));
    
    // Проверка на совпадения
    const matches = findMatches(newBoard);
    
    if (matches.length > 0) {
      setGameState(prev => ({ ...prev, moves: prev.moves - 1 }));
      
      await removeMatches(matches, newBoard);
      await fillEmptySpaces(newBoard);
      
      if (gameState.moves - 1 <= 0) {
        endGame();
      }
    } else {
      // Возвращаем ячейки на место, если совпадений нет
      const temp = newBoard[row1][col1];
      newBoard[row1][col1] = newBoard[row2][col2];
      newBoard[row2][col2] = temp;
      
      setGameState(prev => ({ ...prev, board: newBoard }));
    }
    
    // Сбрасываем состояние
    setGameState(prev => ({
      ...prev,
      selectedCell: null,
      isSwapping: false
    }));
  };
  
  // Поиск совпадений
  const findMatches = (board) => {
    const matches = [];
    
    // Проверка горизонтальных совпадений
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const symbol = board[row][col];
        if (symbol && 
            symbol === board[row][col + 1] && 
            symbol === board[row][col + 2]) {
          matches.push({ row, col, direction: 'horizontal' });
        }
      }
    }
    
    // Проверка вертикальных совпадений
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const symbol = board[row][col];
        if (symbol && 
            symbol === board[row + 1][col] && 
            symbol === board[row + 2][col]) {
          matches.push({ row, col, direction: 'vertical' });
        }
      }
    }
    
    return matches;
  };
  
  // Функция проверки комбинаций
  const checkCombinations = (matches, board) => {
    const combinations = [];
    
    // Проверка на 4 и 5 в ряд
    matches.forEach(match => {
      if (match.direction === 'horizontal') {
        // Проверка на 5 в ряд
        if (match.col + 4 < BOARD_SIZE &&
            board[match.row][match.col] === board[match.row][match.col + 3] &&
            board[match.row][match.col] === board[match.row][match.col + 4]) {
          combinations.push({
            type: 'FIVE_IN_ROW',
            cells: [
              [match.row, match.col],
              [match.row, match.col + 1],
              [match.row, match.col + 2],
              [match.row, match.col + 3],
              [match.row, match.col + 4]
            ]
          });
        }
        // Проверка на 4 в ряд
        else if (match.col + 3 < BOARD_SIZE &&
                 board[match.row][match.col] === board[match.row][match.col + 3]) {
          combinations.push({
            type: 'FOUR_IN_ROW',
            cells: [
              [match.row, match.col],
              [match.row, match.col + 1],
              [match.row, match.col + 2],
              [match.row, match.col + 3]
            ]
          });
        }
      } else {
        // Проверка на 5 в ряд вертикально
        if (match.row + 4 < BOARD_SIZE &&
            board[match.row][match.col] === board[match.row + 3][match.col] &&
            board[match.row][match.col] === board[match.row + 4][match.col]) {
          combinations.push({
            type: 'FIVE_IN_ROW',
            cells: [
              [match.row, match.col],
              [match.row + 1, match.col],
              [match.row + 2, match.col],
              [match.row + 3, match.col],
              [match.row + 4, match.col]
            ]
          });
        }
        // Проверка на 4 в ряд вертикально
        else if (match.row + 3 < BOARD_SIZE &&
                 board[match.row][match.col] === board[match.row + 3][match.col]) {
          combinations.push({
            type: 'FOUR_IN_ROW',
            cells: [
              [match.row, match.col],
              [match.row + 1, match.col],
              [match.row + 2, match.col],
              [match.row + 3, match.col]
            ]
          });
        }
      }
    });
    
    // Проверка на Т-образные и L-образные комбинации
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const symbol = board[row][col];
        if (!symbol) continue;
        
        // Проверка Т-образной комбинации
        if (row + 2 < BOARD_SIZE && col + 2 < BOARD_SIZE) {
          if (symbol === board[row + 1][col] &&
              symbol === board[row + 2][col] &&
              symbol === board[row + 1][col + 1] &&
              symbol === board[row + 1][col + 2]) {
            combinations.push({
              type: 'T_SHAPE',
              cells: [
                [row, col],
                [row + 1, col],
                [row + 2, col],
                [row + 1, col + 1],
                [row + 1, col + 2]
              ]
            });
          }
        }
        
        // Проверка L-образной комбинации
        if (row + 2 < BOARD_SIZE && col + 2 < BOARD_SIZE) {
          if (symbol === board[row + 1][col] &&
              symbol === board[row + 2][col] &&
              symbol === board[row][col + 1] &&
              symbol === board[row][col + 2]) {
            combinations.push({
              type: 'L_SHAPE',
              cells: [
                [row, col],
                [row + 1, col],
                [row + 2, col],
                [row, col + 1],
                [row, col + 2]
              ]
            });
          }
        }
      }
    }
    
    return combinations;
  };
  
  // Удаление совпадений
  const removeMatches = async (matches, board) => {
    const matchedCells = new Set();
    const combinations = checkCombinations(matches, board);
    
    // Добавляем ячейки из комбинаций
    combinations.forEach(combination => {
      combination.cells.forEach(([row, col]) => {
        matchedCells.add(`${row},${col}`);
      });
      
      // Добавляем бонусные очки
      setGameState(prev => ({
        ...prev,
        score: prev.score + COMBINATIONS[combination.type].points
      }));
    });
    
    // Добавляем обычные совпадения
    matches.forEach(match => {
      if (match.direction === 'horizontal') {
        for (let i = 0; i < MIN_MATCH; i++) {
          matchedCells.add(`${match.row},${match.col + i}`);
        }
      } else {
        for (let i = 0; i < MIN_MATCH; i++) {
          matchedCells.add(`${match.row + i},${match.col}`);
        }
      }
    });
    
    // Обновление счета
    setGameState(prev => ({
      ...prev,
      score: prev.score + matchedCells.size * POINTS_PER_MATCH
    }));
    
    // Удаление совпадений
    const newBoard = [...board];
    matchedCells.forEach(pos => {
      const [row, col] = pos.split(',').map(Number);
      newBoard[row][col] = null;
    });
    
    setGameState(prev => ({ ...prev, board: newBoard }));
    
    // Задержка для анимации
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  // Заполнение пустых мест
  const fillEmptySpaces = async (board) => {
    const newBoard = [...board];
    
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
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          newBoard[row][col] = symbol;
        }
      }
    }
    
    setGameState(prev => ({ ...prev, board: newBoard }));
    
    // Проверка на новые совпадения
    const newMatches = findMatches(newBoard);
    if (newMatches.length > 0) {
      await removeMatches(newMatches, newBoard);
      await fillEmptySpaces(newBoard);
    }
  };
  
  // Окончание игры
  const endGame = () => {
    setShowGameOver(true);
  };
  
  // Переключение звука
  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      isSoundEnabled: !prev.isSoundEnabled
    }));
  };
  
  // Инициализация при монтировании
  useEffect(() => {
    initializeBoard();
  }, []);
  
  // Проверка на окончание ходов
  useEffect(() => {
    if (gameState.moves <= 0) {
      endGame();
    }
  }, [gameState.moves]);
  
  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Научный Три в ряд</h1>
        <div className="controls">
          <button 
            onClick={toggleSound}
            className="control-button"
          >
            {gameState.isSoundEnabled ? '🔊 Звук включен' : '🔇 Включить звук'}
          </button>
          <button 
            onClick={initializeBoard}
            className="control-button"
          >
            🔄 Новая игра
          </button>
        </div>
      </header>
      
      <div className="game-info">
        <div className="score-container">
          <span className="score-label">Счёт:</span>
          <span id="score" className="score-value">{gameState.score}</span>
        </div>
        <div className="moves-container">
          <span className="moves-label">Ходы:</span>
          <span id="moves" className="moves-value">{gameState.moves}</span>
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
        <div className="board" ref={boardRef}>
          {gameState.board.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="board-row">
              {row.map((cell, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`cell ${
                    gameState.selectedCell?.row === rowIndex && 
                    gameState.selectedCell?.col === colIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showGameOver && (
        <div className="game-over">
          <div className="game-over-content">
            <h2>Игра окончена!</h2>
            <p>Ваш счёт: <span id="finalScore">{gameState.score}</span></p>
            <button 
              onClick={initializeBoard}
              className="control-button"
            >
              Играть снова
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScientificMatchGame;