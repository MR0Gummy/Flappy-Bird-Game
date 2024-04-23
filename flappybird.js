// Constants for different device types
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let playerName;
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

function startGame() {
    console.log("startGame() called"); // Add this log to check if startGame() is being called
    playerName = document.getElementById("playerName").value;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("board").style.display = "block";
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
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.pop();
    }
    localStorage.setItem("highScores", JSON.stringify(highScores));
    displayScores();
}

// Function to load high scores
function loadHighScores() {
    let storedScores = localStorage.getItem("highScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
    displayScores();
}

window.onload = function() {
    console.log("Window loaded"); // Add this line

    loadHighScores(); // Load scores from local storage
    if (!isMobile) {
        document.getElementById("scoreBoard").style.display = "block"; // Display scores on computer
    }
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImg = new Image();
    birdImg.onload = function() {
        console.log("Bird image loaded"); // Add this line
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.onload = function() {
        console.log("Top pipe image loaded"); // Add this line
    }
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.onload = function() {
        console.log("Bottom pipe image loaded"); // Add this line
    }
    bottomPipeImg.src = "./bottompipe.png";

    // Add event listener for "Enter" key to start game
    document.getElementById("playerName").addEventListener("keypress", function(event) {
        console.log("Key pressed: " + event.key); // Add this line
        if (event.key === "Enter") {
            startGame();
        }
    });
}


function update() {
    console.log("update function called")
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    

    // Update bird position
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Check if bird goes out of bounds
    if (bird.y > board.height || bird.y + bird.height < 0) {
        gameOver = true;
        saveHighScores();
        displayScores();
        document.getElementById("endScreen").style.display = "block";
        return; // Exit the update loop
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            saveHighScores();
            displayScores();
            document.getElementById("endScreen").style.display = "block";
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
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
    console.log("Pipe placed")
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

function moveBird(event) {
    console.log("Bird moved")
    if (event.code === "Space") { // Only respond to spacebar key
        if (!gameOver) {
            jump();
        }
    }
}

function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

function jump() {
    if (!gameOver) {
        velocityY = isMobile ? -4 : -6; // Adjusted jump velocity for mobile devices
    } else {
        resetGame();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
