const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let gameOver = false;
let player, bullets = [], enemies = [], background, enemySpawnRate = 1500;
let shootSound, explosionSound, bgMusic;

const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Initialize audio
function loadSounds() {
    shootSound = new Audio('shoot.mp3');  // Adjust to your path
    explosionSound = new Audio('explosion.mp3');  // Adjust to your path
    bgMusic = new Audio('background-music.mp3');  // Adjust to your path
    bgMusic.loop = true;
    bgMusic.play();
}

// Game restart
function restartGame() {
    score = 0;
    gameOver = false;
    bullets = [];
    enemies = [];
    document.getElementById('gameOver').style.display = 'none';
    bgMusic.play();
    startGame();
}

// Load images
function loadAssets() {
    player = { 
        x: canvas.width / 2 - 50, 
        y: canvas.height - 100, 
        width: 50, 
        height: 50, 
        speed: 5, 
        image: new Image()
    };
    player.image.src = 'player.png';  // Adjust to your path

    background = { 
        image: new Image(), 
        x: 0, 
        y: 0, 
        speed: 2
    };
    background.image.src = 'background.png';  // Adjust to your path
}

// Game loop
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Update background
function updateBackground() {
    background.y += background.speed;
    if (background.y >= canvas.height) {
        background.y = 0;
    }
    ctx.drawImage(background.image, background.x, background.y, canvas.width, canvas.height);
}

// Update player movement
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

// Create bullets
function createBullet() {
    bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 20 });
    shootSound.play();
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.y -= 5;

        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Create enemies
function createEnemy() {
    let x = Math.random() * (canvas.width - 50);
    let speed = Math.random() * 3 + 2; // Random speed for enemies
    enemies.push({ x: x, y: 0, width: 50, height: 50, speed: speed, image: new Image() });
    enemies[enemies.length - 1].image.src = 'enemy.png';  // Adjust to your path
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.y += enemy.speed;

        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            continue;
        }

        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// Check for collisions
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            let bullet = bullets[i];
            let enemy = enemies[j];

            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                score += 10;
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                explosionSound.play();
                break;
            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            gameOver = true;
            document.getElementById('finalScore').textContent = `Final Score: ${score}`;
            document.getElementById('gameOver').style.display = 'block';
            bgMusic.pause();
        }
    }
}

// Draw the score
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Initialize game
function startGame() {
    loadSounds();
    loadAssets();
    setInterval(createEnemy, 1500); // Enemy spawn interval
    gameLoop();
}

// Player shooting action
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        createBullet();
    }
});

startGame();

