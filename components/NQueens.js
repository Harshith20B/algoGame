class NQueensGame {
    constructor() {
        this.boardSize = 8;
        this.queens = [];
        this.isGameActive = false;
        this.timer = 0;
        this.points = 0;
        this.timerInterval = null;

        // DOM elements
        this.boardElement = document.getElementById('game-board');
        this.messageElement = document.getElementById('message');
        this.timerElement = document.getElementById('timer');
        this.pointsElement = document.getElementById('points');
        this.queensCountElement = document.getElementById('queens-count');

        // Bind event listeners
        document.getElementById('board-size').addEventListener('change', (e) => {
            this.boardSize = parseInt(e.target.value);
            this.initializeBoard();
        });

        document.getElementById('reset-board').addEventListener('click', () => {
            this.initializeBoard();
        });

        document.getElementById('hint-button').addEventListener('click', () => {
            this.getHint();
        });

        // Initialize the game
        this.initializeBoard();
    }

    initializeBoard() {
        // Reset game state
        this.queens = [];
        this.isGameActive = false;
        this.timer = 0;
        this.points = 0;
        clearInterval(this.timerInterval);
        
        // Update UI
        this.updateStats();
        this.setMessage('');
        
        // Create board grid
        this.boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 1 ? 'dark' : ''}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                this.boardElement.appendChild(cell);
            }
        }
    }

    startTimer() {
        if (!this.isGameActive) {
            this.isGameActive = true;
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateStats();
            }, 1000);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateStats() {
        this.timerElement.textContent = this.formatTime(this.timer);
        this.pointsElement.textContent = this.points;
        this.queensCountElement.textContent = `${this.queens.length}/${this.boardSize}`;
    }

    setMessage(text, type = '') {
        this.messageElement.textContent = text;
        this.messageElement.className = 'message ' + type;
        if (text) {
            setTimeout(() => this.setMessage(''), 2000);
        }
    }

    isValidPosition(row, col) {
        for (const [queenRow, queenCol] of this.queens) {
            if (queenRow === row || queenCol === col) return false;
            if (Math.abs(queenRow - row) === Math.abs(queenCol - col)) return false;
        }
        return true;
    }

    handleCellClick(row, col) {
        this.startTimer();

        const queenIndex = this.queens.findIndex(([r, c]) => r === row && c === col);
        const cell = this.boardElement.children[row * this.boardSize + col];

        if (queenIndex !== -1) {
            // Remove queen
            this.queens.splice(queenIndex, 1);
            cell.innerHTML = '';
            this.checkBoardValidity();
        } else if (this.queens.length < this.boardSize) {
            // Add queen if position is valid
            if (this.isValidPosition(row, col)) {
                this.queens.push([row, col]);
                cell.innerHTML = '<span class="queen">♕</span>';
                this.points += 10;
                this.checkBoardValidity();
            } else {
                this.points -= 10;
                this.setMessage('Invalid position! Queens can attack each other.', 'error');
            }
        }

        this.updateStats();
    }

    checkBoardValidity() {
        if (this.queens.length === this.boardSize) {
            this.setMessage('Congratulations! You solved the puzzle!', 'success');
            this.isGameActive = false;
            clearInterval(this.timerInterval);
        }
    }

    getHint() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidPosition(row, col) && 
                    !this.queens.some(([r, c]) => r === row && c === col)) {
                    this.setMessage(`Hint: Place a queen at row ${row + 1}, column ${col + 1}`);
                    return;
                }
            }
        }
        this.setMessage('No valid positions available for a hint.');
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NQueensGame();
});