// Элементы ячеек доски
export const SYMBOLS = ["🧪", "🌡️", "🧫", "⚛️", "🔬", "⚗️"];

// Комбинации ячеек
export const COMBINATIONS = {
  FOUR_IN_ROW: {
    name: "Четыре в ряд",
    points: 50,
    description: "4 одинаковых элемента в ряд",
  },
  FIVE_IN_ROW: {
    name: "Пять в ряд",
    points: 100,
    description: "5 одинаковых элементов в ряд",
  },
  T_SHAPE: {
    name: "Т-образная комбинация",
    points: 75,
    description: "Т-образное расположение элементов",
  },
  L_SHAPE: {
    name: "L-образная комбинация",
    points: 75,
    description: "L-образное расположение элементов",
  },
};

// Звуковые эффекты
export const SOUNDS = {
  move: "/sounds/move.mp3",
  gameOver: "/sounds/game-over.mp3",
  combination: "/sounds/combination.mp3",
};
