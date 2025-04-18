// boards.js
import {
  COLORS,
  DIFFICULTY_LEVELS,
  GRADE_THRESHOLDS,
  GRADE_DISPLAY
} from './constants.js';

function generateBoard(size = 6, difficulty = 1, seed = null) {
  return generateBoardWithSolution(size, difficulty, seed);
}

function generateBoardWithSolution(size = 6, difficulty = 1, seed = null) {
  const { adjacencyFactor: initialAdjacencyFactor, colorCount, targetMoves } =
    DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[1];

  let currentAdjacencyFactor = initialAdjacencyFactor;
  const expectedMoves = (difficulty < 12) ? difficulty + 2 : Math.floor(Math.random() * 4) + 12;
  const minAcceptableMoves = expectedMoves - 1;
  const maxAcceptableMoves = expectedMoves + 1;
  const maxAttempts = 10;
  let attempts = 0;
  let board, optimalSolution, analysis;
  
  while (attempts < maxAttempts) {
    attempts++;
    const boardColors = COLORS.slice(0, colorCount);
    board = createRandomBoard(size, boardColors, currentAdjacencyFactor);
    const startX = size - 1;
    const startY = 0;
    optimalSolution = findGreedyOptimalSolution(board, startX, startY, boardColors);
    
    if (optimalSolution.length >= minAcceptableMoves && 
        optimalSolution.length <= maxAcceptableMoves) {
      break;
    }
    
    if (optimalSolution.length < expectedMoves) {
      currentAdjacencyFactor = Math.max(0.2, currentAdjacencyFactor - 0.05);
    } else {
      currentAdjacencyFactor = Math.min(0.9, currentAdjacencyFactor + 0.05);
    }
  }
  
  if (attempts >= maxAttempts) {
    console.warn(`Could not generate board with exactly ${expectedMoves} moves after ${maxAttempts} attempts. Using best available: ${optimalSolution.length} moves`);
  }
  
  analysis = analyzeBoard(board);
  
  return {
    board,
    optimalSolution,
    optimalMoves: optimalSolution.length,
    analysis
  };
}

function createRandomBoard(size, boardColors, adjacencyFactor) {
  let board = Array(size).fill().map(() => 
    Array(size).fill().map(() => 
      boardColors[Math.floor(Math.random() * boardColors.length)]
    )
  );
  
  board = adjustBoardForDifficulty(board, boardColors, adjacencyFactor);
  
  const startX = size - 1;
  const startY = 0;
  
  const boardCopy = board.map(row => [...row]);
  
  let owned = Array(size).fill().map(() => Array(size).fill(false));
  owned[startY][startX] = true;
  
  const verificationLimitMoves = size * 4;
  let countMoves = 0;
  let canReachAll = false;
  
  while (countMoves < verificationLimitMoves) {
    countMoves++;
    
    const currentColor = getCurrentColor(owned, boardCopy);
    let madeProgress = false;
    
    for (const color of boardColors) {
      if (color === currentColor) continue;
      
      const newOwned = performFloodFill(boardCopy, owned, color);
      const gainedTiles = countNewTiles(owned, newOwned);
      
      if (gainedTiles > 0) {
        owned = newOwned;
        madeProgress = true;
        break;
      }
    }
    
    if (isFullyOwned(owned)) {
      canReachAll = true;
      break;
    }
    
    if (!madeProgress) {
      const adjacentColors = findAdjacentUnownedColors(boardCopy, owned);
      
      if (adjacentColors.length > 0 && !adjacentColors.includes(currentColor)) {
        const nextColor = adjacentColors[0];
        owned = performFloodFill(boardCopy, owned, nextColor);
      } else {
        const otherColors = boardColors.filter(c => c !== currentColor);
        const randomColor = otherColors[Math.floor(Math.random() * otherColors.length)];
        owned = performFloodFill(boardCopy, owned, randomColor);
      }
    }
  }
  
  if (!canReachAll) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!owned[y][x]) {
          const neighbors = [];
          if (x > 0) neighbors.push({x: x-1, y: y});
          if (x < size-1) neighbors.push({x: x+1, y: y});
          if (y > 0) neighbors.push({x: x, y: y-1});
          if (y < size-1) neighbors.push({x: x, y: y+1});
          
          const ownedNeighbors = neighbors.filter(n => owned[n.y][n.x]);
          
          if (ownedNeighbors.length > 0) {
            board[y][x] = boardColors[Math.floor(Math.random() * boardColors.length)];
          }
        }
      }
    }
  }
  
  return board;
}

function adjustBoardForDifficulty(board, boardColors, adjacencyFactor) {
  const size = board.length;
  const newBoard = JSON.parse(JSON.stringify(board));
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (Math.random() < adjacencyFactor) {
        const neighbors = [];
        if (x > 0) neighbors.push(newBoard[y][x-1]);
        if (y > 0) neighbors.push(newBoard[y-1][x]);
        
        if (neighbors.length > 0) {
          const neighborToMatch = neighbors[Math.floor(Math.random() * neighbors.length)];
          newBoard[y][x] = neighborToMatch;
        }
      } else {
        const otherColors = boardColors.filter(c => c !== newBoard[y][x]);
        if (otherColors.length > 0) {
          newBoard[y][x] = otherColors[Math.floor(Math.random() * otherColors.length)];
        }
      }
    }
  }
  
  return newBoard;
}

function findGreedyOptimalSolution(board, startX, startY, availableColors) {
  const size = board.length;
  
  let owned = Array(size).fill().map(() => Array(size).fill(false));
  owned[startY][startX] = true;
  
  const solution = [];
  
  const seenStates = new Set();
  
  let moveCount = 0;
  const maxMoves = size * size;
  
  while (!isFullyOwned(owned) && moveCount < maxMoves) {
    moveCount++;
    
    const currentColor = getCurrentColor(owned, board);
    
    const stateSignature = owned.map(row => row.map(cell => cell ? '1' : '0').join('')).join('') + '|' + currentColor;
    
    if (seenStates.has(stateSignature)) {
      const remainingColors = new Set();
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (!owned[y][x]) {
            remainingColors.add(board[y][x]);
          }
        }
      }
      
      const targetColor = Array.from(remainingColors)[0] || 
                         availableColors.find(c => c !== currentColor);
      
      solution.push(targetColor);
      owned = performFloodFill(board, owned, targetColor);
      
      seenStates.clear();
      continue;
    }
    
    seenStates.add(stateSignature);
    
    let bestColor = null;
    let maxGain = 0;
    
    for (const color of availableColors) {
      if (color === currentColor) continue;
      
      const newOwned = performFloodFill(board, owned, color);
      const tilesGained = countNewTiles(owned, newOwned);
      
      if (tilesGained > maxGain) {
        maxGain = tilesGained;
        bestColor = color;
      }
    }
    
    if (maxGain === 0) {
      const adjacentColors = findAdjacentUnownedColors(board, owned);
      
      if (adjacentColors.length > 0 && !adjacentColors.includes(currentColor)) {
        bestColor = adjacentColors[0];
      } else {
        const otherColors = availableColors.filter(color => color !== currentColor);
        bestColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      }
    }
    
    solution.push(bestColor);
    owned = performFloodFill(board, owned, bestColor);
  }
  
  return solution;
}

function findAdjacentUnownedColors(board, owned) {
  const size = board.length;
  const colors = new Set();
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (owned[y][x]) {
        const adjacentCells = [
          [x-1, y], [x+1, y], 
          [x, y-1], [x, y+1]
        ];
        
        for (const [nx, ny] of adjacentCells) {
          if (
            nx >= 0 && nx < size &&
            ny >= 0 && ny < size &&
            !owned[ny][nx]
          ) {
            colors.add(board[ny][nx]);
          }
        }
      }
    }
  }
  
  return Array.from(colors);
}

function getCurrentColor(owned, board) {
  for (let y = 0; y < owned.length; y++) {
    for (let x = 0; x < owned[0].length; x++) {
      if (owned[y][x]) {
        return board[y][x];
      }
    }
  }
  return null;
}

function countNewTiles(oldOwned, newOwned) {
  let count = 0;
  
  for (let y = 0; y < oldOwned.length; y++) {
    for (let x = 0; x < oldOwned[0].length; x++) {
      if (!oldOwned[y][x] && newOwned[y][x]) {
        count++;
      }
    }
  }
  
  return count;
}

function analyzeBoard(board) {
  const visited = new Set();
  let regions = 0;

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        regions++;
        const queue = [{ x, y }];
        const color = board[y][x];
        visited.add(key);

        while (queue.length > 0) {
          const { x: cx, y: cy } = queue.shift();
          const adjacentCells = [
            { x: cx - 1, y: cy }, { x: cx + 1, y: cy },
            { x: cx, y: cy - 1 }, { x: cx, y: cy + 1 }
          ];

          for (const cell of adjacentCells) {
            if (
              cell.x >= 0 && cell.x < board[0].length &&
              cell.y >= 0 && cell.y < board.length
            ) {
              const newKey = `${cell.x},${cell.y}`;
              if (!visited.has(newKey) && board[cell.y][cell.x] === color) {
                visited.add(newKey);
                queue.push(cell);
              }
            }
          }
        }
      }
    }
  }

  const estimatedDifficulty = regions > 20 ? "קשה מאוד" :
    regions > 15 ? "קשה" :
    regions > 10 ? "בינוני" :
    regions > 5 ? "קל" : "קל מאוד";

  return { regions, estimatedDifficulty };
}

function calculateGrade(moveCount, optimalMoves) {
  const difference = moveCount - optimalMoves;
  let gradeKey = 'FAIL';
  if (difference <= GRADE_THRESHOLDS.PERFECT) gradeKey = 'PERFECT';
  else if (difference <= GRADE_THRESHOLDS.GREAT) gradeKey = 'GREAT';
  else if (difference <= GRADE_THRESHOLDS.GOOD) gradeKey = 'GOOD';
  else if (difference <= GRADE_THRESHOLDS.OK) gradeKey = 'OK';

  return {
    grade: gradeKey,
    displayText: GRADE_DISPLAY[gradeKey],
    difference
  };
}

function isFullyOwned(owned) {
  return owned.every(row => row.every(cell => cell));
}

function performFloodFill(board, owned, newColor) {
  const size = board.length;
  const newOwned = owned.map(row => [...row]);
  const queue = [];
  const visited = Array(size).fill().map(() => Array(size).fill(false));
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (owned[y][x]) {
        queue.push([x, y]);
        visited[y][x] = true;
      }
    }
  }
  
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    
    const adjacentCells = [
      [x-1, y], [x+1, y], 
      [x, y-1], [x, y+1]
    ];
    
    for (const [nx, ny] of adjacentCells) {
      if (
        nx >= 0 && nx < size &&
        ny >= 0 && ny < size &&
        !visited[ny][nx] &&
        board[ny][nx] === newColor
      ) {
        newOwned[ny][nx] = true;
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }
  
  return newOwned;
}

export {
  generateBoard,
  generateBoardWithSolution,
  analyzeBoard,
  calculateGrade
};