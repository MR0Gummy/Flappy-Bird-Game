// Constants for different device types
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let highScores = [];

//board
let board;
let boardWidth = isMobile ? window.innerWidth : 360;
let boardHeight = isMobile ? window.innerHeight : 640;
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
let velocityY = isMobile ? -4 : 0; // Adjusted jump velocity for mobile devices
let gravity = 0.4;

let gameOver = false;
let score = 0;
let playerName = ""; // Store player's name

// Function to start the game
function startGame() {
    console.log("startGame() called");
    playerName = document.getElementById("playerName").value.trim(); // Get player's name
    if (playerName === "") {
        alert("Please enter your name.");
        return; // Don't start the game if the player's name is empty
    }
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("scoreBoard").style.display = "none"; // Hide high scores
    document.getElementById("board").style.backgroundImage = "url('flappybirdbg.png')"; // Show game background
    document.removeEventListener("keydown", moveBird); // Remove existing event listeners
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    // Initialize game state without instantly transitioning to game over screen
    resetGame();
}

// Function to display scores
function displayScores() {
    let scoresDisplay = document.getElementById("scoresDisplay");
    scoresDisplay.style.display = "block"; // Show scores
    scoresDisplay.innerHTML = "";
    highScores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.textContent = entry.name + ": " + entry.score;
        scoresDisplay.appendChild(li);
    });
}

// Function to reset the game
function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = isMobile ? -4 : 0; // Reset jump velocity for mobile devices
    requestAnimationFrame(update);
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
}

// Function to save high scores
function saveHighScores() {
    let playerName = document.getElementById("playerName").value;
    if (playerName.trim() === "") {
        playerName = "Anonymous"; // Set default name if no name is provided
    }
    let data = JSON.stringify({ name: playerName, score: score });
    fetch('/saveScores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        displayScores(); // Update scores after saving
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to load high scores
function loadHighScores() {
    fetch('/loadScores')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        highScores = JSON.parse(data);
        displayScores();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


window.onload = function() {
    loadHighScores(); // Load scores from local storage
    document.getElementById("startScreen").style.display = "block"; // Display start screen
    document.getElementById("gameScreen").style.display = "none"; // Hide game screen
    document.getElementById("endScreen").style.display = "none"; // Hide end screen
    document.getElementById("scoreBoard").style.display = "block"; // Display high scores
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load bird image
    birdImg = new Image();
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    birdImg.src = "./flappybird.png";

    // Load top pipe image
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    // Load bottom pipe image
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Add event listener for "Start Game" button click
    document.getElementById("startButton").addEventListener("click", startGame);
    document.addEventListener("keydown", moveBird);
}

let pipeSpawnCounter = 0; // Counter to keep track of pipe spawning
let pipeSpawnDelay = 100; // Delay between pipe spawns (adjust as needed)

function update() {
    console.log("update function called");
    requestAnimationFrame(update);
    if (gameOver) {
        // Game over logic
        document.getElementById("endScreen").style.display = "block";
        document.getElementById("gameScreen").style.display = "none"; // Hide game screen
        document.getElementById("scoresDisplay").style.display = "block"; // Show scores after game over
        // Ask for player's name after game over
        document.getElementById("endScreen").innerHTML = `
            <h2>Game Over</h2>
            <p>Your score: ${score}</p>
            <button onclick="saveHighScores()">Save</button>
            <button onclick="restartGame()">Restart</button>
        `;
        return;
    }

    // Update bird position
    velocityY += gravity;
    bird.y += velocityY;

    // Update pipe positions
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        // Check for collision with pipes
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            break; // Exit loop early since the game is over
        }

        // Check if bird passes the pipe to increment score
        if (bird.x > pipe.x + pipe.width && !pipe.passed) {
            score += 0.5;
            pipe.passed = true;
        }
    }

    // Check for out of bounds
    if (bird.y > board.height || bird.y + bird.height < 0) {
        gameOver = true;
    }

    // Increment pipe spawn counter
    pipeSpawnCounter++;

    // Spawn new pipes if counter reaches delay
    if (pipeSpawnCounter >= pipeSpawnDelay) {
        placePipes();
        pipeSpawnCounter = 0; // Reset the counter
    }

    // Drawing logic
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Drawing pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    // Drawing score
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(score, 10, 30);
}

function restartGame() {
    document.getElementById("endScreen").style.display = "none";
    resetGame();
    startGame();
    
    // Reattach event listeners
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
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

// Event listener for spacebar key to make the bird jump
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (!gameOver) {
            jump();
        }
    }
}

// Event listener for touch input to make the bird jump
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

// Function to handle bird jumping
function jump() {
    if (!gameOver) {
        velocityY = isMobile ? -4 : -6; // Adjusted jump velocity for mobile devices
    } else {
        resetGame(); // Reset the game after game over
    }
}

// Function to detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
