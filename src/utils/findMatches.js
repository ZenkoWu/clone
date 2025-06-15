export const findMatches = (currentBoard, BOARD_SIZE) => {
  const matches = [];

  // Проверка горизонтальных совпадений
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const symbol = currentBoard[row][col];
      if (
        symbol &&
        symbol === currentBoard[row][col + 1] &&
        symbol === currentBoard[row][col + 2]
      ) {
        matches.push({ row, col, direction: "horizontal" });
      }
    }
  }

  // Проверка вертикальных совпадений
  for (let row = 0; row < BOARD_SIZE - 2; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const symbol = currentBoard[row][col];
      if (
        symbol &&
        symbol === currentBoard[row + 1][col] &&
        symbol === currentBoard[row + 2][col]
      ) {
        matches.push({ row, col, direction: "vertical" });
      }
    }
  }

  return matches;
};
