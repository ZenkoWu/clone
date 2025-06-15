export const checkCombinations = (currentBoard, matches, BOARD_SIZE) => {
  const combinations = [];

  // Проверка на 4 и 5 в ряд
  matches.forEach((match) => {
    if (match.direction === "horizontal") {
      // Проверка на 5 в ряд
      if (
        match.col + 4 < BOARD_SIZE &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row][match.col + 3] &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row][match.col + 4]
      ) {
        combinations.push({
          type: "FIVE_IN_ROW",
          cells: [
            [match.row, match.col],
            [match.row, match.col + 1],
            [match.row, match.col + 2],
            [match.row, match.col + 3],
            [match.row, match.col + 4],
          ],
        });
      }
      // Проверка на 4 в ряд
      else if (
        match.col + 3 < BOARD_SIZE &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row][match.col + 3]
      ) {
        combinations.push({
          type: "FOUR_IN_ROW",
          cells: [
            [match.row, match.col],
            [match.row, match.col + 1],
            [match.row, match.col + 2],
            [match.row, match.col + 3],
          ],
        });
      }
    } else {
      // Проверка на 5 в ряд вертикально
      if (
        match.row + 4 < BOARD_SIZE &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row + 3][match.col] &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row + 4][match.col]
      ) {
        combinations.push({
          type: "FIVE_IN_ROW",
          cells: [
            [match.row, match.col],
            [match.row + 1, match.col],
            [match.row + 2, match.col],
            [match.row + 3, match.col],
            [match.row + 4, match.col],
          ],
        });
      }
      // Проверка на 4 в ряд вертикально
      else if (
        match.row + 3 < BOARD_SIZE &&
        currentBoard[match.row][match.col] ===
          currentBoard[match.row + 3][match.col]
      ) {
        combinations.push({
          type: "FOUR_IN_ROW",
          cells: [
            [match.row, match.col],
            [match.row + 1, match.col],
            [match.row + 2, match.col],
            [match.row + 3, match.col],
          ],
        });
      }
    }
  });

  // Проверка на Т-образные и L-образные комбинации
  for (let row = 0; row < BOARD_SIZE - 2; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const symbol = currentBoard[row][col];
      if (!symbol) continue;

      // Проверка Т-образной комбинации
      if (row + 2 < BOARD_SIZE && col + 2 < BOARD_SIZE) {
        if (
          symbol === currentBoard[row + 1][col] &&
          symbol === currentBoard[row + 2][col] &&
          symbol === currentBoard[row + 1][col + 1] &&
          symbol === currentBoard[row + 1][col + 2]
        ) {
          combinations.push({
            type: "T_SHAPE",
            cells: [
              [row, col],
              [row + 1, col],
              [row + 2, col],
              [row + 1, col + 1],
              [row + 1, col + 2],
            ],
          });
        }
      }

      // Проверка L-образной комбинации
      if (row + 2 < BOARD_SIZE && col + 2 < BOARD_SIZE) {
        if (
          symbol === currentBoard[row + 1][col] &&
          symbol === currentBoard[row + 2][col] &&
          symbol === currentBoard[row][col + 1] &&
          symbol === currentBoard[row][col + 2]
        ) {
          combinations.push({
            type: "L_SHAPE",
            cells: [
              [row, col],
              [row + 1, col],
              [row + 2, col],
              [row, col + 1],
              [row, col + 2],
            ],
          });
        }
      }
    }
  }

  return combinations;
};
