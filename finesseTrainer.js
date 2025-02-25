
const canvas = document.getElementById('tetrisBoard');
const context = canvas.getContext('2d');

const blockSize = 25;
const borderSize = 1;
const gridWidth = 10;
const gridHeight = 22;

canvas.height = borderSize + gridHeight*blockSize;
canvas.width = borderSize + gridWidth*blockSize;

const pieceColor = [
    "cyan",
    "blue",
    "orange",
    "yellow",
    "lime",
    "purple",
    "red"
];
const ghostColor = [
    '#007F7F',
    '#00007F',
    '#7f5200',
    '#7F7F00',
    '#007F00',
    '#3F003F',
    '#7F0000'
];

// Define shape of the pieces
const pieces = [
    // I piece
    [[-1,0],[0,0],[1,0],[2,0]],
    // J piece
    [[-1,-1],[-1,0],[0,0],[1,0]],
    // L piece
    [[1,-1],[-1,0],[0,0],[1,0]],
    // O piece
    [[0,-1],[1,-1],[0,0],[1,0]],
    // S piece
    [[0,-1],[1,-1],[-1,0],[0,0]],
    // T piece
    [[0,-1],[-1,0],[0,0],[1,0]],
    // Z piece
    [[-1,-1],[0,-1],[0,0],[1,0]]
];

// I piece rotates differently, must be hard coded
const iRotations = [
    [[-1, 0], [0, 0], [1, 0], [2, 0]],
    [[1, 2], [1, 1], [1, 0,], [1, -1]],
    [[-1, 1], [0, 1], [1, 1], [2, 1]],
    [[0, 2], [0, 1], [0, 0], [0, -1]]
];

// Define possible junk patterns for each piece
const junkPatterns = [
    // I
    [
        [3,[0,6]],
        [4,[0,9]]   
    ],
    // J
    [
        [0,[2,9]],
        [1,[0,8]],
        [2,[0,7]],
        [5,[0,8]],
    ],
    // L 
    [
        [0,[0,7]],
        [1,[0,8]],
        [2,[0,7]],
        [5,[1,9]],
    ],
    // O
    [
        [1,[0,8]]
    ],
    // S
    [
        [1,[0,7]],
        [7,[1,9]]
    ],
    // T
    [
        [2, [0, 7]],
        [6, [0, 8]],
        [7, [1, 9]],
        [8, [1, 9]]
    ],
    // Z
    [
        [1,[1,8]],
        [6,[0,8]]
    ]
];

// Define "correct" move count
const finesse = [
    // I
    {
        3: [1,2,1,0,1,2,1,0,0,0],
        4: [1,1,1,1,0,0,1,1,1,1]
    },
    // J
    {
        0: [0,0,1,2,1,0,1,2,2,1],
        1: [1,2,1,0,1,2,2,1,1,0],
        2: [1,2,1,0,1,2,2,1,0,0],
        5: [1,1,2,1,0,1,2,2,1,0]
    },
    // L
    {
        0: [1,2,1,0,1,2,2,1,0,0],
        1: [1,1,2,1,0,1,2,2,1,0],
        2: [1,2,1,0,1,2,2,1,0,0],
        5: [0,1,2,1,0,1,2,2,1,1]
    },
    // O
    {
        1: [1,2,2,1,0,1,2,2,1,0]
    },
    // S
    {
        1: [1,2,1,0,1,2,2,1,0,0],
        7: [0,1,1,1,0,0,1,2,1,1]
    },
    // T
    {
        2: [1,2,1,0,1,2,2,1,0,0],
        6: [1,1,2,1,0,1,2,2,1,0],
        7: [0,1,2,1,0,1,2,2,1,1],
        8: [0,1,2,1,0,1,2,2,1,0]
    },
    // Z
    {
        1: [0,1,2,1,0,1,2,2,1,0],
        6: [1,1,1,0,0,1,2,1,1,0]
    }
]

const defaultControlsCode = {
    "left-input": "KeyA",
    "right-input": "KeyD",
    "hard-drop-input": "KeyW",
    "cw-input": "ArrowRight",
    "ccw-input": "ArrowLeft" 
};
const defaultControlsKey = {
    "left-input": "a",
    "right-input": "d",
    "hard-drop-input": "w",
    "cw-input": "ArrowRight",
    "ccw-input": "ArrowLeft" 
}

// Get keyboard input
let rotateCWPressed = 0;
let rotateCCWPressed = 0;
let leftPressed = 0;
let rightPressed = 0;
let dropPressed = 0;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case localStorage.getItem("cw-input-code"):
            rotateCWPressed = 1;
            break;
        case localStorage.getItem('left-input-code'):
            leftPressed = 1;
            break;
        case localStorage.getItem('ccw-input-code'):
            rotateCCWPressed = 1;
            break;
        case localStorage.getItem('right-input-code'):
            rightPressed = 1;
            break;
        case localStorage.getItem('hard-drop-input-code'):
            dropPressed = 1;
    }
    
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case localStorage.getItem("cw-input-code"):
            rotateCWPressed = 0;
            break;
        case localStorage.getItem('left-input-code'):
            leftPressed = 0;
            break;
        case localStorage.getItem('ccw-input-code'):
            rotateCCWPressed = 0;
            break;
        case localStorage.getItem('right-input-code'):
            rightPressed = 0;
            break;
        case localStorage.getItem('hard-drop-input-code'):
            dropPressed = 0;
            break;
    }
});

let x = 4
let piece = 0;
let rotation = 0;

function drawGrid() {
    // Draw grid line color
    if(localStorage.getItem("grid-box") === "true") {
        context.fillStyle = 'gray';
    } else {
        context.fillStyle = 'black';
    }
    context.fillRect(0,0,canvas.width,canvas.height);

    // Draw squares color
    context.fillStyle = 'black';
    for(let i = 0; i < gridHeight; i++) {
        for(let j = 0; j < gridWidth; j++) {
            context.fillRect(borderSize + j * blockSize, borderSize + i * blockSize, blockSize - borderSize, blockSize - borderSize);
        }
    }
}

// 0 for CW, 1 for CCW
function rotate(direction) {
    if(piece == 0) {
        for(let i in currentPiece) {
            currentPiece[i][0] = iRotations[rotation][i][0];
            currentPiece[i][1] = iRotations[rotation][i][1];
        }
        return;
    }
    if(piece == 3) {
        return;
    }
    for(let i = 0; i < 4; i++) {
        let a = currentPiece[i][0];
        let b = currentPiece[i][1];

        if(direction === 0) {
            currentPiece[i][0] = -b;
            currentPiece[i][1] = a;
        } else {
            currentPiece[i][0] = b;
            currentPiece[i][1] = -a;
        }
    }
}

// Helper function for drawing pieces
function drawSquare(x, y) {
    context.fillRect(x*blockSize, y*blockSize, blockSize + borderSize, blockSize + borderSize);
}

const currentPiece = [[-1,-1],[0,-1],[1,-1],[2,-1]];

function updateCurrentPiece() {
    const p = pieces[piece];

    for(let i = 0; i < 4; i++) {
        currentPiece[i][0] = p[i][0];
        currentPiece[i][1] = p[i][1];
    }
}

function drawPiece(x, y) {
    for(let i = 0; i < 4; i++) {
        const square = currentPiece[i];
        drawSquare(x + square[0], y + square[1]);
    }
}

// Main loop code for drawing active piece
function drawMainPiece() {
    let y = 1;

    context.fillStyle = pieceColor[piece];
    drawPiece(x,y);
}

function drawGhostPiece() {
    // Do not draw ghost piece if checkbox is unchecked
    if(localStorage.getItem('ghost-box') === 'false') {
        return;
    }
  
    let floor = -1;
    for(let block of currentPiece) {
        const n = junkArray[block[0] + x] + block[1];
        floor = n > floor ? n : floor;
    }
    context.fillStyle = ghostColor[piece];
    drawPiece(x, gridHeight - floor - 1);
}

let junkPattern = 0;
let junkX = 0;

const junkArray = [0,0,0,0,0,0,0,0,0,0];
initializeJunkArray();

function initializeJunkArray() {
    const patternsArr = junkPatterns[piece];
    const patternData = patternsArr[Math.floor(patternsArr.length*Math.random())]

    junkPattern = patternData[0];
    junkX = Math.floor((patternData[1][1]-patternData[1][0])*Math.random() + patternData[1][0]);

    for(let i = 0; i < 10; i++) {
        // 1 wide
        if (junkPattern === 0) {
            junkArray[i] = i != junkX ? 1 : 0;
        // 2 wide
        } else if (junkPattern === 1) {
            junkArray[i] = i < junkX || i > junkX+1 ? 1 : 0;
        // 3 wide
        } else if (junkPattern === 2) {
            junkArray[i] = i < junkX || i > junkX+2 ? 1 : 0;
        // 4 wide
        } else if (junkPattern === 3) {
            junkArray[i] = i < junkX || i > junkX+3 ? 1 : 0;
        // I dependency
        } else if (junkPattern === 4) {
            junkArray[i] = i != junkX ? 4 : 0;
        // L/J dependency
        } else if(junkPattern === 5) {
            junkArray[i] = i != junkX ? 2 : 0;
        // Right Stair
        } else if(junkPattern === 6){
            if(i === junkX) {
                junkArray[i] = 0;
            } else if(i === junkX+1) {
                junkArray[i] = 1;
            } else {
                junkArray[i] = 2;
            }
        // Left Stair
        } else if(junkPattern === 7){
            if(i === junkX) {
                junkArray[i] = 0;
            } else if(i === junkX-1) {
                junkArray[i] = 1;
            } else {
                junkArray[i] = 2;
            }
        // T-hole
        } else {
            if(i === junkX) {
                junkArray[i] = 0;
            } else if(i === junkX-1 || i === junkX+1) {
                junkArray[i] = 1;
            } else {
                junkArray[i] = 2;
            }

        }

    }
}

function drawJunk() {
    context.fillStyle = 'gray';
    for(let i = 0; i < 10; i++) {
        for(let j = 1; j <= junkArray[i]; j++) {
            drawSquare(i, gridHeight-j);
        }
    }
}

function newPiece() {
    if (moveCount === finesse[piece][junkPattern][junkX] && checkDrop()) {
        piece = (piece + 1) % 7;
        initializeJunkArray();
    }
    
    x = 4;
    rotation = 0;
    moveCount = 0;
    updateCurrentPiece();
    clearInputs();
}

function checkDrop() {
    switch(piece) {
        case 0:
            // I
            if(junkPattern === 3) {
                return rotation === 0 && x === junkX + 1;
            } else {
                return rotation === 1 && x === junkX - 1 || rotation === 3 && x === junkX;
            }  
        case 1:
            // J
            if(junkPattern === 0) {
                return rotation === 2 && x === junkX - 1;
            } else if(junkPattern === 1) {
                return rotation === 3 && x === junkX + 1;
            } else if (junkPattern === 2) {
                return rotation === 0 && x === junkX + 1;
            } else {
                return rotation === 1 && x === junkX;
            }
        case 2:
            // L
            if(junkPattern === 0) {
                return rotation === 2 && x === junkX + 1;
            } else if(junkPattern === 1) {
                return rotation === 1 && x === junkX;
            } else if(junkPattern === 2) {
                return rotation === 0 && x === junkX + 1;
            } else {
                return rotation === 3 && x === junkX;
            }
        case 3:
            // O
            return x === junkX;
        case 4:
            // S
            if(junkPattern === 1) {
                return rotation === 0 && x === junkX + 1;
            } else {
                return rotation === 1 && x === junkX - 1 || rotation === 3 && x === junkX;
            }
        case 5:
            // T
            if(junkPattern === 2) {
                return rotation === 0 && x === junkX + 1;
            } else if(junkPattern === 6) {
                return rotation === 1 && x === junkX;
            } else if(junkPattern === 7) {
                return rotation === 3 && x === junkX;
            } else {
                return rotation === 2 && x === junkX;
            }
        case 6:
            // Z
            if(junkPattern === 1) {
                return rotation === 0 && x === junkX;
            } else {
                return rotation === 1 && x === junkX || rotation === 3 && x === junkX + 1;
            }
    }

    return false;
}

let dropped = false;
let rotatedCW = false;
let rotatedCCW = false;

let inputDir = 0;
let moveDir = 0;

let DAStimer = 0;
let ARRtimer = 0;

let moveCount = 0;

function movePiece(deltaTime) {
    if(dropPressed) {
        if(!dropped) {
            newPiece();
            dropped = true;
        }
    } else {
        dropped = false;
    }

    // Rotate piece based on user input
    if(rotateCWPressed) {
        if(!rotatedCW) {
            rotatedCW = true;
            rotation = (rotation + 1) % 4;
            rotate(0);
            addInput("CW");
        }
    } else {
        rotatedCW = false;
    }
    if(rotateCCWPressed) {
        if(!rotatedCCW) {
            rotatedCCW = true;
            rotation = (rotation + 3) % 4;
            rotate(1);
            addInput("CCW");
        }
    } else {
        rotatedCCW = false;
    }

    // Handle input direction
    inputDir = Number(rightPressed) - Number(leftPressed);
    
    // Initialize movement control values based on localstorage
    let ARR = localStorage.getItem("ARR-input");
    let DAS = localStorage.getItem("DAS-input");

    // Move piece based on input and DAS timer
    if(inputDir !== 0) {
        if(inputDir !== moveDir) {
            moveDir = inputDir;
            x += moveDir;

            // Reset DAS timer
            DAStimer = 0;

            moveCount++;
        } else {
            DAStimer += deltaTime;
            if(DAStimer >= DAS) {
                if(ARR <= 0) {
                    x += 10 * moveDir;
                } else if(ARRtimer > ARR) {
                    ARRtimer = 0;
                    x += moveDir;
                }
                ARRtimer += deltaTime;
            }
        }
    } else {
        if(moveDir > 0) {
            if(DAStimer >= DAS) {
                addInput("DAS right");
            } else {
                addInput("right");
            }
        } else if(moveDir < 0) {
            if(DAStimer >= DAS) {
                addInput("DAS left");
            } else {
                addInput("left");
            }
        }
        moveDir = 0;
    }

    // Handle wall collisions
    //
    // I piece
    if(piece === 0) {
        if(rotation == 0 || rotation === 2) {
            x = clamp(x, 1, 7);
        } else if(rotation === 1) {
            x = clamp(x, -1, 8);
        } else {
            x = clamp(x, 0, 9);
        }
    // O piece
    } else if(piece === 3) {
        x = clamp(x, 0, 8);
    // All other pieces
    } else {
        if(rotation == 0 || rotation == 2) {
            x = clamp(x, 1, 8);
        } else if(rotation === 1) {
            x = clamp(x, 0, 8);
        } else {
            x = clamp(x, 1, 9);
        }
    }
}

// Helper function for tracking inputs (disabled)
function addInput(str) {
    return;
    let element = document.getElementById("inputs");
    if (element.innerText) {
        element.innerText += ", " + str;
    } else {
        element.innerText += str;
    }
}
function clearInputs() {
    let element = document.getElementById("inputs");
    element.innerText = "";
}

// Helper math function
function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

// Main animation loop
let lastTimestamp;
function animate(timestamp) {
    if(!lastTimestamp) {
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    let deltaTime = timestamp - lastTimestamp;

    movePiece(deltaTime);
    drawGrid();
    drawMainPiece();
    drawJunk();
    drawGhostPiece();
    requestAnimationFrame(animate);

    lastTimestamp = timestamp;
}

// Initialize input element values to localstorage values
// Add eventlisteners to update localstorage values
function initializeSetting(inputId) {
    const input = document.getElementById(inputId);
    if(localStorage.getItem(inputId) !== null) {
        input.value = localStorage.getItem(inputId);
    } else {
        localStorage.setItem(inputId, input.value);
    }
    input.addEventListener("input", () => {
        localStorage.setItem(inputId, input.value);
    });
}
initializeSetting("ARR-input");
initializeSetting("DAS-input");

function initializeCheckbox(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if(localStorage.getItem(checkboxId) !== null) {
        checkbox.checked = localStorage.getItem(checkboxId) === 'true';
    } else {
        localStorage.setItem(checkboxId, checkbox.chedked);
    }
    checkbox.addEventListener("change", () => {
        localStorage.setItem(checkboxId, checkbox.checked);
    });
}
initializeCheckbox("ghost-box");
initializeCheckbox("grid-box");

function initializeControlInput(inputId) {
    const input = document.getElementById(inputId);
    if(localStorage.getItem(inputId) === null) {
        localStorage.setItem(inputId, defaultControlsKey[inputId]);
        localStorage.setItem(inputId + "-code", defaultControlsCode[inputId]); 
    }
    input.value = localStorage.getItem(inputId);
    input.addEventListener("keydown", (event) => {
        if (event.code === "Tab") {
            return;
        }
        event.preventDefault();
        let key = event.key;
        key = key === " " ? "space" : key;

        input.value = key;
        localStorage.setItem(inputId, key);
        localStorage.setItem(inputId + "-code", event.code);
    })
}
initializeControlInput("left-input");
initializeControlInput("right-input");
initializeControlInput("hard-drop-input");
initializeControlInput("cw-input");
initializeControlInput("ccw-input");

// Start animation loop
animate();