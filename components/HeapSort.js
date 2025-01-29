const getParentIndex = (index) => Math.floor((index - 1) / 2);
const getLeftChildIndex = (index) => 2 * index + 1;
const getRightChildIndex = (index) => 2 * index + 2;

function calculateNodePosition(index) {
    const levelWidth = 800;
    const levelHeight = 80;
    const level = Math.floor(Math.log2(index + 1));
    const nodesInLevel = Math.pow(2, level);
    const position = index - Math.pow(2, level) + 1;
    const x = (position + 0.5) * (levelWidth / nodesInLevel);
    const y = (level + 1) * levelHeight;
    return { x, y };
}

const PHASES = {
    INITIAL: {
        name: 'Initial Array',
        instructions: 'This is your starting array. We\'ll convert it into a max heap.'
    },
    HEAPIFY: {
        name: 'Building Max Heap',
        instructions: 'Click the parent node first, then the larger child to swap them and create a max heap.'
    },
    SORT: {
        name: 'Heap Sort',
        instructions: 'Click the root node (largest element) to start extraction.'
    },
    SWAP_ROOT: {
        name: 'Swap with Last',
        instructions: 'Click the last unsorted node to swap with the root.'
    },
    REHEAPIFY: {
        name: 'Reheapify',
        instructions: 'Click parent-child pairs to restore max heap property after the swap.'
    },
    COMPLETE: {
        name: 'Complete',
        instructions: 'Congratulations! The array is now sorted in descending order!'
    }
};

let gameState = {
    initialArray: [],
    heap: [],
    score: 0,
    mistakes: 0,
    timer: 0,
    selectedNodes: [],
    phase: 'INITIAL',
    expectedSwap: null,
    showHint: false,
    timerInterval: null,
    sortedArray: [],
    canInteract: true,
    heapSize: 0
};

function initializeGame() {
    const numbers = Array.from({ length: 7 }, () => Math.floor(Math.random() * 99) + 1);
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState = {
        initialArray: [...numbers],
        heap: [...numbers],
        score: 0,
        mistakes: 0,
        timer: 0,
        selectedNodes: [],
        phase: 'INITIAL',
        expectedSwap: null,
        showHint: false,
        timerInterval: null,
        sortedArray: [],
        canInteract: true,
        heapSize: numbers.length
    };
    
    gameState.timerInterval = setInterval(updateTimer, 1000);
    
    updatePhaseDisplay();
    updateArrayDisplays();
    updateScoreDisplay();
    showMessage('Start by identifying parent-child pairs that violate the max heap property.', 'info');
    
    setTimeout(() => {
        gameState.phase = 'HEAPIFY';
        updatePhaseDisplay();
        findNextHeapifyStep();
        drawHeap();
    }, 1000);
}
// Update phase display
function updatePhaseDisplay() {
    const phase = PHASES[gameState.phase];
    document.getElementById('currentPhase').textContent = phase.name;
    document.getElementById('instructions').textContent = phase.instructions;
}
function updateArrayDisplays() {
    document.getElementById('initialArray').innerHTML = gameState.initialArray
        .map(num => `<div class="array-item">${num}</div>`)
        .join('');
    document.getElementById('sortedArray').innerHTML = gameState.sortedArray
        .map(num => `<div class="array-item sorted">${num}</div>`)
        .join('');
}

function updateScoreDisplay() {
    document.getElementById('score-controls').textContent = gameState.score;
    document.getElementById('mistakes-controls').textContent = gameState.mistakes;
    document.getElementById('timer-controls').textContent = `${gameState.timer}s`;
}

function findNextHeapifyStep() {
    const n = gameState.heapSize;
    let lastParentIdx = Math.floor(n / 2) - 1;
    
    gameState.expectedSwap = null;
    
    for (let i = lastParentIdx; i >= 0; i--) {
        const leftIdx = getLeftChildIndex(i);
        const rightIdx = getRightChildIndex(i);
        
        let largest = i;
        
        if (leftIdx < n && gameState.heap[leftIdx] > gameState.heap[largest]) {
            largest = leftIdx;
        }
        
        if (rightIdx < n && gameState.heap[rightIdx] > gameState.heap[largest]) {
            largest = rightIdx;
        }
        
        if (largest !== i) {
            gameState.expectedSwap = { parent: i, child: largest };
            return;
        }
    }
    
    if (gameState.phase === 'HEAPIFY' || gameState.phase === 'REHEAPIFY') {
        if (gameState.sortedArray.length === gameState.initialArray.length) {
            gameState.phase = 'COMPLETE';
        } else {
            gameState.phase = 'SORT';
        }
        gameState.expectedSwap = null;
        showMessage(gameState.phase === 'COMPLETE' ? 
            'Sorting complete! The array is now sorted in descending order.' : 
            'Max heap created! Click the root node to extract the maximum.', 'success');
        updatePhaseDisplay();
    }
}
// Handle node clicks
function handleNodeClick(index) {
    if (!gameState.canInteract) return;
    
    switch (gameState.phase) {
        case 'HEAPIFY':
        case 'REHEAPIFY':
            handleHeapifyClick(index);
            break;
            
        case 'SORT':
            if (index === 0) {
                gameState.selectedNodes = [index];
                gameState.phase = 'SWAP_ROOT';
                updatePhaseDisplay();
                showMessage('Now click the last unsorted node to swap with root', 'info');
            } else {
                showMessage('Click the root node (largest element) first!', 'error');
            }
            break;
            
        case 'SWAP_ROOT':
            handleSwapRootClick(index);
            break;
    }
    drawHeap();
}

function handleHeapifyClick(index) {
    if (!gameState.expectedSwap) return;
    
    if (gameState.selectedNodes.length === 0) {
        if (index === gameState.expectedSwap.parent || index === gameState.expectedSwap.child) {
            gameState.selectedNodes = [index];
            showMessage('Good! Now select the node to swap with.', 'info');
        } else {
            gameState.mistakes++;
            gameState.score = Math.max(0, gameState.score - 5);
            showMessage('Select either the parent or the larger child node.', 'error');
            updateScoreDisplay();
        }
        return;
    }
    
    if (gameState.selectedNodes.length === 1) {
        const firstNode = gameState.selectedNodes[0];
        const isValidSwap = (
            (firstNode === gameState.expectedSwap.parent && index === gameState.expectedSwap.child) ||
            (firstNode === gameState.expectedSwap.child && index === gameState.expectedSwap.parent)
        );
        
        if (isValidSwap) {
            // Perform the swap
            [gameState.heap[gameState.expectedSwap.parent], gameState.heap[gameState.expectedSwap.child]] = 
            [gameState.heap[gameState.expectedSwap.child], gameState.heap[gameState.expectedSwap.parent]];
            
            gameState.score += 10; // +10 points for correct heapify
            showMessage('Correct swap! Keep going!', 'success');
        } else {
            gameState.mistakes++;
            gameState.score = Math.max(0, gameState.score - 5); // Subtract 5 points for mistake
            showMessage('Invalid swap! Try again.', 'error');
        }
        
        gameState.selectedNodes = [];
        updateScoreDisplay();
        findNextHeapifyStep();
    }
}

function handleSwapRootClick(index) {
    const lastIndex = gameState.heapSize - 1;
    
    if (index === lastIndex) {
        [gameState.heap[0], gameState.heap[lastIndex]] = 
        [gameState.heap[lastIndex], gameState.heap[0]];
        
        gameState.sortedArray.unshift(gameState.heap[lastIndex]);
        gameState.heapSize--;
        
        gameState.score += 20;
        updateScoreDisplay();
        gameState.selectedNodes = [];
        
        updateArrayDisplays();
        
        if (gameState.heapSize <= 1) {
            if (gameState.heapSize === 1) {
                gameState.sortedArray.unshift(gameState.heap[0]);
            }
            gameState.phase = 'COMPLETE';
            updatePhaseDisplay();
            showVictoryPopup();
            clearInterval(gameState.timerInterval);
        } else {
            gameState.phase = 'REHEAPIFY';
            findNextHeapifyStep();
            updatePhaseDisplay();
            showMessage('Now restore the max heap property.', 'info');
        }
    } else {
        gameState.mistakes++;
        gameState.score = Math.max(0, gameState.score - 5);
        updateScoreDisplay();
        showMessage('Select the last unsorted node to swap with root!', 'error');
    }
}

function updateTimer() {
    gameState.timer++;
    updateScoreDisplay();
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function drawHeap() {
    const svg = document.getElementById('heapVisualization');
    svg.innerHTML = '';
    
    svg.setAttribute('viewBox', '0 0 800 300');
    
    for (let i = 0; i < gameState.heapSize; i++) {
        const leftChild = getLeftChildIndex(i);
        const rightChild = getRightChildIndex(i);
        const parentPos = calculateNodePosition(i);
        
        if (leftChild < gameState.heapSize) {
            const leftPos = calculateNodePosition(leftChild);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x);
            line.setAttribute('y1', parentPos.y);
            line.setAttribute('x2', leftPos.x);
            line.setAttribute('y2', leftPos.y);
            line.setAttribute('stroke', '#334155');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }
        
        if (rightChild < gameState.heapSize) {
            const rightPos = calculateNodePosition(rightChild);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x);
            line.setAttribute('y1', parentPos.y);
            line.setAttribute('x2', rightPos.x);
            line.setAttribute('y2', rightPos.y);
            line.setAttribute('stroke', '#334155');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }
    }
    
    for (let i = 0; i < gameState.heapSize; i++) {
        const pos = calculateNodePosition(i);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        g.setAttribute('class', 'heap-node');
        
        const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitArea.setAttribute('r', '30');
        hitArea.setAttribute('fill', 'transparent');
        hitArea.style.cursor = 'pointer';
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '24');
        circle.setAttribute('stroke-width', '2');
        
        let fillColor = '#1e293b';
        let strokeColor = '#334155';
        let textColor = '#e2e8f0';
        
        if (gameState.selectedNodes.includes(i)) {
            fillColor = '#3b82f6';
            strokeColor = '#60a5fa';
            textColor = 'white';
        } else if (gameState.showHint && gameState.expectedSwap && 
                  (i === gameState.expectedSwap.parent || i === gameState.expectedSwap.child)) {
            fillColor = 'rgba(245, 158, 11, 0.2)';
            strokeColor = '#f59e0b';
        }
        
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = gameState.heap[i];
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '16px');
        
        const clickHandler = () => handleNodeClick(i);
        g.addEventListener('click', clickHandler);
        
        g.appendChild(hitArea);
        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    }
}

function showVictoryPopup() {
    gameState.canInteract = false;
    clearInterval(gameState.timerInterval);
    
    const popup = document.createElement('div');
    popup.className = 'victory-popup';
    popup.innerHTML = `
        <div class="victory-content">
            <h2>Congratulations!</h2>
            <div class="final-stats">
                <p>Score: ${gameState.score}</p>
                <p>Time: ${gameState.timer}s</p>
                <p>Mistakes: ${gameState.mistakes}</p>
            </div>
            <div class="victory-buttons">
            <button id="newGameBtn" class="button">New Game</button>
                <button id="homeBtn" class="button button-outline">Return Home</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById('newGameBtn').addEventListener('click', () => {
        popup.remove();
        gameState.canInteract = true;
        initializeGame();
    });
    
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = 'HomePage.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newGame').addEventListener('click', () => {
        initializeGame();
    });
    
    document.getElementById('showHint').addEventListener('click', () => {
        if (gameState.expectedSwap) {
            gameState.score = Math.max(0, gameState.score - 2);
            updateScoreDisplay();
            gameState.showHint = true;
            drawHeap();
            showMessage('Hint: Swap nodes to maintain max heap property (parent larger than children)', 'info');
            setTimeout(() => {
                gameState.showHint = false;
                drawHeap();
            }, 2000);
        } else {
            showMessage('No hints available at this moment', 'info');
        }
    });
    
    initializeGame();
});