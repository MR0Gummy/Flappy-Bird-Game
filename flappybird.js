// JavaScript code

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
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
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

// Function to start the game
function startGame() {
    playerName = document.getElementById("playerName").value;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("board").style.display = "block";
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
}

// Function to display the start screen
function showStartScreen() {
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";
}

// Function to show end screen with score
function showEndScreen() {
    document.getElementById("finalScore").textContent = "Score: " + score;
    document.getElementById("endScreen").style.display = "block";
}

// Function to save high scores
function saveHighScores() {
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.pop();
    }
    // Save to file
    // You need to implement this part (saving to a file)
}

// Function to load high scores
function loadHighScores() {
    // Load from file
    // You need to implement this part (loading from a file)
}

// Function to display high scores
function displayHighScores() {
    loadHighScores();
    let highScoresList = document.getElementById("highScores");
    highScoresList.innerHTML = "";
    highScores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.textContent = entry.name + ": " + entry.score;
        highScoresList.appendChild(li);
    });
}

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    displayHighScores();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        saveHighScores();
        displayHighScores();
        showEndScreen();
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
            displayHighScores();
            showEndScreen();
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = isMobile ? -4 : -6; // Adjusted jump velocity for mobile devices

        if (gameOver) {
            resetGame();
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

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    requestAnimationFrame(update);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
