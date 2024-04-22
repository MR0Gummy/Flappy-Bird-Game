// Define variables for game components
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let bird;
let birdImg;
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let accumulatedTime = 0;
let lastTime = performance.now();
let gameOver = false;
let score = 0;

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
    requestAnimationFrame(mainLoop);
}

// Start the game loop
requestAnimationFrame(mainLoop);

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load images and initialize game components
    loadGameComponents();

    // Handle form submission to start the game
    document.getElementById("start-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form submission
        startGame();
    });
}

function loadGameComponents() {
    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        // Initialize bird object
        bird = {
            x : boardWidth / 8,
            y : boardHeight / 2,
            width : birdImg.width,
            height : birdImg.height
        };
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Initialize other game components as needed
}

function startGame() {
    // Hide the menu and display the game canvas
    document.getElementById("menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    // Start the game logic
    requestAnimationFrame(mainLoop);
}

function update() {
    if (gameOver) {
        return;
    }

    // Update game logic
}

function render() {
    context.clearRect(0, 0, board.width, board.height);
    // Render game components
}

function placePipes() {
    if (gameOver) {
        return;
    }
    // Place pipes logic
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6; // Adjusted jump velocity
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
        velocityY = -6; // Adjusted jump velocity for touch input
    } else {
        resetGame();
    }
}

function resetGame() {
    // Reset game logic
}

function detectCollision(a, b) {
    // Collision detection logic
}
