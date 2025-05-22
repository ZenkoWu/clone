document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const swapSound = document.getElementById('swapSound');
    const matchSound = document.getElementById('matchSound');
    const fallSound = document.getElementById('fallSound');
    
    let score = 0;
    const colors = ['🧪', '🌡️', '🧫', '⚛️', '🔬', '⚗️'];
    const rows = 8;
    const cols = 8;
    let selectedCell = null;
    let isAnimating = false;

    // Инициализация игры
    function initGame() {
        createBoard();
        setupEventListeners();
    }

    // Создание игрового поля
    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < rows * cols; i++) {
            createCell(i);
        }
    }

    // Создание клетки
    function createCell(index) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = index;
        cell.textContent = colors[Math.floor(Math.random() * colors.length)];
        board.appendChild(cell);
        return cell;
    }

    // Обработчики событий
    function setupEventListeners() {
        board.addEventListener('click', (e) => {
            if (isAnimating) return;
            const cell = e.target.closest('.cell');
            if (cell) handleCellClick(cell);
        });
    }

    // Обработка клика
    function handleCellClick(cell) {
        if (!selectedCell) {
            selectedCell = cell;
            cell.classList.add('selected');
            return;
        }

        if (selectedCell === cell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
            return;
        }

        if (areAdjacent(selectedCell, cell)) {
            isAnimating = true;
            swapCells(selectedCell, cell, () => {
                checkMatches(() => {
                    isAnimating = false;
                });
            });
        }

        selectedCell.classList.remove('selected');
        selectedCell = null;
    }

    // Проверка соседства
    function areAdjacent(cell1, cell2) {
        const index1 = parseInt(cell1.dataset.index);
        const index2 = parseInt(cell2.dataset.index);
        const row1 = Math.floor(index1 / cols);
        const col1 = index1 % cols;
        const row2 = Math.floor(index2 / cols);
        const col2 = index2 % cols;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }

    // Обмен клеток с анимацией
    function swapCells(cell1, cell2, callback) {
        cell1.classList.add('swapping');
        cell2.classList.add('swapping');
        swapSound.currentTime = 0;
        swapSound.play();

        setTimeout(() => {
            const temp = cell1.textContent;
            cell1.textContent = cell2.textContent;
            cell2.textContent = temp;

            setTimeout(() => {
                cell1.classList.remove('swapping');
                cell2.classList.remove('swapping');
                if (callback) callback();
            }, 300);
        }, 100);
    }

    // Проверка совпадений
    function checkMatches(callback) {
        const cells = Array.from(document.querySelectorAll('.cell'));
        let matches = new Set();

        // Поиск совпадений
        findMatches(cells, matches);

        if (matches.size > 0) {
            explodeMatches(matches, () => {
                updateScore(matches.size / 3 * 30);
                collapseBoard(() => {
                    fillEmptyCells(() => {
                        setTimeout(() => {
                            checkMatches(callback); // Рекурсивная проверка
                        }, 300);
                    });
                });
            });
        } else if (callback) {
            callback();
        }
    }

    // Поиск совпадений
    function findMatches(cells, matches) {
        // Горизонтальные совпадения
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols - 2; col++) {
                const index = row * cols + col;
                if (cells[index].textContent && 
                    cells[index].textContent === cells[index + 1].textContent && 
                    cells[index].textContent === cells[index + 2].textContent) {
                    matches.add(index).add(index + 1).add(index + 2);
                }
            }
        }

        // Вертикальные совпадения
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows - 2; row++) {
                const index = row * cols + col;
                if (cells[index].textContent && 
                    cells[index].textContent === cells[index + cols].textContent && 
                    cells[index].textContent === cells[index + 2 * cols].textContent) {
                    matches.add(index).add(index + cols).add(index + 2 * cols);
                }
            }
        }
    }

    // Анимация взрыва совпадений
    function explodeMatches(matches, callback) {
        const cells = document.querySelectorAll('.cell');
        matchSound.currentTime = 0;
        matchSound.play();

        matches.forEach(index => {
            cells[index].classList.add('matched');
            createParticles(cells[index]);
        });

        setTimeout(() => {
            matches.forEach(index => {
                cells[index].textContent = '';
                cells[index].classList.remove('matched');
            });
            if (callback) callback();
        }, 300);
    }

    // Создание частиц
    function createParticles(cell) {
        const rect = cell.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${rect.left + rect.width/2}px`;
            particle.style.top = `${rect.top + rect.height/2}px`;
            particle.style.background = getRandomColor();
            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 5;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;

            let posX = rect.left + rect.width/2;
            let posY = rect.top + rect.height/2;
            let opacity = 1;

            const animate = () => {
                posX += x;
                posY += y;
                opacity -= 0.02;

                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    function getRandomColor() {
        const colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Обновление счета
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        
        // Анимация счета
        scoreElement.style.transform = 'scale(1.5)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 300);
    }

    // Обрушение элементов
    function collapseBoard(callback) {
        const cells = Array.from(document.querySelectorAll('.cell'));
        let moved = false;

        for (let col = 0; col < cols; col++) {
            const columnCells = [];
            for (let row = 0; row < rows; row++) {
                columnCells.push(cells[row * cols + col]);
            }

            const nonEmpty = columnCells.filter(cell => cell.textContent);
            const emptyCount = rows - nonEmpty.length;

            for (let i = 0; i < rows; i++) {
                if (i < emptyCount) {
                    if (columnCells[i].textContent !== '') {
                        moved = true;
                    }
                    columnCells[i].textContent = '';
                } else {
                    if (columnCells[i].textContent !== nonEmpty[i - emptyCount].textContent) {
                        moved = true;
                    }
                    columnCells[i].textContent = nonEmpty[i - emptyCount].textContent;
                }
            }
        }

        if (moved) {
            fallSound.currentTime = 0;
            fallSound.play();
            setTimeout(() => {
                if (callback) callback();
            }, 500);
        } else if (callback) {
            callback();
        }
    }

    // Заполнение пустых клеток
    function fillEmptyCells(callback) {
        const cells = document.querySelectorAll('.cell');
        let filled = false;

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                const index = row * cols + col;
                if (!cells[index].textContent) {
                    cells[index].textContent = colors[Math.floor(Math.random() * colors.length)];
                    cells[index].classList.add('new');
                    setTimeout(() => cells[index].classList.remove('new'), 600);
                    filled = true;
                }
            }
        }

        if (filled) {
            setTimeout(() => {
                if (callback) callback();
            }, 600);
        } else if (callback) {
            callback();
        }
    }

    // Запуск игры
    initGame();
});