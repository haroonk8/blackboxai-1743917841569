// Game Constants
const CAR_WIDTH = 50;
const CAR_HEIGHT = 100;
const ROAD_WIDTH = 400;
const OBSTACLE_COUNT = 5;

// Game State
let gameRunning = false;
let score = 0;
let difficulty = 'medium';
let animationId = null;
let lastTimestamp = 0;
let roadMarkings = [];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const canvas = document.getElementById('race-track');
const ctx = canvas.getContext('2d');
const finalScoreDisplay = document.getElementById('final-score');

// Game Objects
const car = {
    x: canvas.width / 2 - CAR_WIDTH / 2,
    y: canvas.height - CAR_HEIGHT - 20,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    speed: 0,
    maxSpeed: 10,
    acceleration: 0.2,
    deceleration: 0.1,
    steering: 0,
    steeringSpeed: 0.1
};

const obstacles = [];

// Initialize Game
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    car.x = canvas.width / 2 - CAR_WIDTH / 2;
    car.y = canvas.height - CAR_HEIGHT - 20;
    generateRoadMarkings();
    generateObstacles();
}

function generateRoadMarkings() {
    roadMarkings = [];
    const markingCount = Math.ceil(canvas.height / 100);
    for (let i = 0; i < markingCount; i++) {
        roadMarkings.push({
            x: canvas.width / 2 - 5,
            y: i * 100
        });
    }
}

function generateObstacles() {
    obstacles.length = 0;
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: -Math.random() * canvas.height * 2,
            width: 40,
            height: 40,
            speed: 3 + Math.random() * 2
        });
    }
}

// Game Loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    update(deltaTime);
    render();
    
    animationId = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    // Update car position
    car.x += car.steering * car.speed;
    car.x = Math.max(ROAD_WIDTH / 2, Math.min(canvas.width - ROAD_WIDTH / 2 - car.width, car.x));
    
    // Update road markings
    roadMarkings.forEach(marking => {
        marking.y += car.speed;
        if (marking.y > canvas.height) {
            marking.y = -20;
        }
    });
    
    // Update obstacles
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
        if (obstacle.y > canvas.height) {
            obstacle.y = -100;
            obstacle.x = Math.random() * (canvas.width - 60) + 30;
        }
        
        // Collision detection
        if (checkCollision(car, obstacle)) {
            gameOver();
        }
    });
    
    // Increase score
    score += car.speed * 0.1;
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width / 2 - ROAD_WIDTH / 2, 0, ROAD_WIDTH, canvas.height);
    
    // Draw road markings
    ctx.fillStyle = 'yellow';
    roadMarkings.forEach(marking => {
        ctx.fillRect(marking.x, marking.y, 10, 60);
    });
    
    // Draw car
    ctx.fillStyle = 'blue';
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Draw obstacles
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width - 20, 40);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game Controls
function handleKeyDown(e) {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
            break;
        case 'ArrowDown':
            car.speed = Math.max(car.speed - car.deceleration, 0);
            break;
        case 'ArrowLeft':
            car.steering = -car.steeringSpeed;
            break;
        case 'ArrowRight':
            car.steering = car.steeringSpeed;
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            car.steering = 0;
            break;
    }
}

// Game State Management
function startGame() {
    startScreen.classList.add('hidden');
    canvas.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    score = 0;
    init();
    lastTimestamp = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    canvas.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = Math.floor(score);
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

// Initialize on window load
window.addEventListener('load', () => {
    init();
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            difficulty = e.target.dataset.difficulty;
            switch(difficulty) {
                case 'easy':
                    car.maxSpeed = 8;
                    break;
                case 'hard':
                    car.maxSpeed = 12;
                    break;
                default:
                    car.maxSpeed = 10;
            }
            startGame();
        });
    });
});

window.addEventListener('resize', () => {
    if (gameRunning) {
        init();
    }
});