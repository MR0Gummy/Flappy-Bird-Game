const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

const SCORES_FILE_PATH = 'scores.txt';

// Route to save score
app.post('/scores', (req, res) => {
    const { playerName, score } = req.body;
    const newScore = `${playerName}: ${score}\n`;
    fs.appendFile(SCORES_FILE_PATH, newScore, (err) => {
        if (err) {
            console.error('Error saving score:', err);
            res.status(500).send('Error saving score');
        } else {
            console.log('Score saved successfully');
            res.status(201).send('Score saved successfully');
        }
    });
});

// Route to get all scores
app.get('/scores', (req, res) => {
    fs.readFile(SCORES_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading scores:', err);
            res.status(500).send('Error reading scores');
        } else {
            const scores = data.split('\n').filter(Boolean);
            res.json(scores);
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Define global variables
let scoreboard;
let scoreDisplay;
let animationId;

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4; // Adjusted gravity for phones

// Define constants
const MS_PER_UPDATE = 16; // 60 FPS

// Variable to keep track of accumulated time
let accumulatedTime = 0;
let lastTime = performance.now();

let gameOver = false;
let score = 0;

let playerName;

// Function to initialize scoreboard
function initScoreboard() {
    scoreboard = document.getElementById("scoreboard");
    scoreDisplay = document.getElementById("score");
}

// Function to update score
function updateScore() {
    scoreDisplay.textContent = score;
}

// Function to show scoreboard
function showScoreboard() {
    scoreboard.style.display = "block";
}

// Function to hide scoreboard
function hideScoreboard() {
    scoreboard.style.display = "none";
}

// Function to pause the game
function pauseGame() {
    cancelAnimationFrame(animationId);
}

// Function to resume the game
function resumeGame() {
    animationId = requestAnimationFrame(mainLoop);
}

// Function to save the score to file
function saveScoreToFile(playerName, score) {
    const newScore = `${playerName}: ${score}\n`;
    fs.appendFile(SCORES_FILE_PATH, newScore, (err) => {
        if (err) {
            console.error('Error saving score to file:', err);
        } else {
            console.log('Score saved to file successfully');
        }
    });
}

// Function to adjust game parameters based on screen size
function adjustGameForScreenSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth < 600) { // Small screens (e.g., phones)
        gravity = 0.3; // Adjusted gravity for smaller screens
        velocityY = -4; // Adjusted velocity for smaller screens
        // Adjust other parameters as needed for smaller screens
    } else { // Larger screens (e.g., computers)
        gravity = 0.4; // Default gravity for larger screens
        velocityY = -6; // Default velocity for larger screens
        // Adjust other parameters as needed for larger screens
    }
}

// Call the function initially
adjustGameForScreenSize();

// Call the function whenever the window is resized
window.addEventListener('resize', adjustGameForScreenSize);

// Main game loop
function mainLoop(currentTime) {
    if (!gameOver) {
        // Calculate elapsed time since last frame
        let deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Accumulate elapsed time
        accumulatedTime += deltaTime;

        // Update game logic in fixed time steps
        while (accumulatedTime >= MS_PER_UPDATE) {
            update();
            accumulatedTime -= MS_PER_UPDATE;
        }

        // Render the game
        render();

        // Request the next frame
        animationId = requestAnimationFrame(mainLoop);
    }
}

// Function to start the game
function startGame() {
    playerName = document.getElementById("player-name").value;
    if (playerName.trim() === "") {
        alert("Please enter your name.");
        return;
    }

    // Hide the menu and display the game canvas
    const menu = document.getElementById("menu");
    const gameScreen = document.getElementById("game-container");

    if (menu && gameScreen) {
        menu.style.display = "none";
        gameScreen.style.display = "block";
        showScoreboard(); // Show the scoreboard
        pauseGame(); // Pause the game initially
        resetGame(); // Reset the game
    } else {
        console.error("Menu or game-screen element not found!");
    }
}

// Function to reset the game state
function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
}

// Function to handle touch input for bird jumping
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

// Function to handle bird jumping
function jump() {
    if (!gameOver) {
        velocityY = -6; // Adjusted jump velocity for touch input
    } else {
        startGame(); // Restart the game if the player taps after game over
        resumeGame(); // Resume the game
    }
}

// Start the game when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    initScoreboard(); // Initialize scoreboard

    // Handle form submission to start the game
    document.getElementById("start-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form submission
        startGame();
        resumeGame(); // Resume the game when started
    });
});

function update() {
    if (gameOver) {
        return;
    }

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    // Update the score
    updateScore();

    // Save score to file when game over
    if (gameOver) {
        saveScoreToFile(playerName, score);
    }
}

function render() {
    context.clearRect(0, 0, board.width, board.height);

    //bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6; // Adjusted jump velocity
        if (gameOver) {
            resetGame();
            startGame(); // Restart the game if the player presses space after game over
            resumeGame(); // Resume the game
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
