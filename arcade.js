/* ==========================================
   FUN ARCADE ROOM - 3 MINI-GAMES ENGINE
   Games: Space Defender, Gravity Flip, Brick Breaker
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();

    const canvas = document.getElementById('arcade-room-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tabs = document.querySelectorAll('#arcade-game-tabs .filter-btn');
    const startOverlay = document.getElementById('arcade-room-overlay');
    const startBtn = document.getElementById('start-arcade-room-btn');
    const titleText = document.getElementById('arcade-title-text');
    const descText = document.getElementById('arcade-desc-text');
    const controlsGuide = document.getElementById('arcade-controls-guide');

    const scoreEl = document.getElementById('room-score');
    const livesEl = document.getElementById('room-lives');
    const statusEl = document.getElementById('room-status');

    let currentGameIndex = 0;
    let gameLoopId = null;
    let gameActive = false;
    let score = 0;
    let lives = 3;

    // Keys State
    const keys = {};
    let mouseX = canvas.width / 2;

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space' && gameActive) {
            e.preventDefault();
            handleSpacePress();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
    });

    canvas.addEventListener('click', () => {
        if (gameActive && currentGameIndex === 1) { // Gravity Flip on click
            flipGravity();
        }
    });

    const gameMetaData = [
        {
            title: "SPACE DEFENDER 2099",
            desc: "Fly your space ship, dodge asteroids, and shoot enemy drones!",
            controls: `<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move Ship</span><span><kbd>SPACE</kbd> Shoot Lasers</span>`
        },
        {
            title: "GRAVITY FLIP RUNNER",
            desc: "Flip gravity to dodge wall obstacles and survive as long as possible!",
            controls: `<span><kbd>SPACEBAR</kbd> or <kbd>CLICK</kbd> Flip Gravity</span>`
        },
        {
            title: "CYBER BRICK BREAKER",
            desc: "Move paddle, bounce the glowing energy sphere, and smash all cyber bricks!",
            controls: `<span><kbd>A</kbd><kbd>D</kbd> or <kbd>MOUSE</kbd> Move Paddle</span><span><kbd>SPACEBAR</kbd> Launch Ball</span>`
        }
    ];

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentGameIndex = parseInt(tab.getAttribute('data-arcade'), 10);
            setupSelectedGame();
        });
    });

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startSelectedGame();
        });
    }

    function setupSelectedGame() {
        stopGame();
        const meta = gameMetaData[currentGameIndex];
        titleText.textContent = meta.title;
        descText.textContent = meta.desc;
        controlsGuide.innerHTML = meta.controls;

        startOverlay.style.display = 'flex';
        score = 0;
        lives = 3;
        updateHUD('READY', 'var(--neon-cyan)');
    }

    function startSelectedGame() {
        startOverlay.style.display = 'none';
        gameActive = true;
        score = 0;
        lives = 3;
        updateHUD('ACTIVE', 'var(--neon-green)');

        if (window.playSFX) window.playSFX('click');

        if (currentGameIndex === 0) initSpaceDefender();
        else if (currentGameIndex === 1) initGravityFlip();
        else if (currentGameIndex === 2) initBrickBreaker();

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function stopGame() {
        gameActive = false;
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
    }

    function updateHUD(status, color) {
        if (scoreEl) scoreEl.textContent = String(score).padStart(4, '0');
        if (livesEl) livesEl.textContent = '❤'.repeat(Math.max(0, lives));
        if (statusEl) {
            statusEl.textContent = status;
            statusEl.style.color = color || 'var(--neon-cyan)';
        }
    }

    function handleSpacePress() {
        if (currentGameIndex === 0) fireSpaceLaser();
        else if (currentGameIndex === 1) flipGravity();
        else if (currentGameIndex === 2 && !ballLaunched) launchBall();
    }

    /* ==========================================
       GAME 1: SPACE DEFENDER 2099
       ========================================== */
    let ship, spaceLasers, spaceEnemies, spaceParticles, enemyTimer;

    function initSpaceDefender() {
        ship = { x: canvas.width / 2, y: canvas.height - 60, speed: 6 };
        spaceLasers = [];
        spaceEnemies = [];
        spaceParticles = [];
        enemyTimer = 0;
    }

    function fireSpaceLaser() {
        spaceLasers.push({ x: ship.x, y: ship.y - 15, speed: 10 });
        if (window.playSFX) window.playSFX('laser');
    }

    function updateSpaceDefender() {
        // Controls
        if (keys['KeyA'] || keys['ArrowLeft']) ship.x -= ship.speed;
        if (keys['KeyD'] || keys['ArrowRight']) ship.x += ship.speed;
        if (keys['KeyW'] || keys['ArrowUp']) ship.y -= ship.speed;
        if (keys['KeyS'] || keys['ArrowDown']) ship.y += ship.speed;

        ship.x = Math.max(20, Math.min(canvas.width - 20, ship.x));
        ship.y = Math.max(100, Math.min(canvas.height - 30, ship.y));

        // Render Ship
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - 18);
        ctx.lineTo(ship.x - 16, ship.y + 14);
        ctx.lineTo(ship.x, ship.y + 6);
        ctx.lineTo(ship.x + 16, ship.y + 14);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Spawn Enemies
        enemyTimer++;
        if (enemyTimer > 40) {
            enemyTimer = 0;
            spaceEnemies.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -20,
                speed: Math.random() * 2 + 2,
                size: 24
            });
        }

        // Update Lasers
        for (let i = spaceLasers.length - 1; i >= 0; i--) {
            const l = spaceLasers[i];
            l.y -= l.speed;
            ctx.fillStyle = '#ff007f';
            ctx.fillRect(l.x - 2, l.y, 4, 12);
            if (l.y < 0) spaceLasers.splice(i, 1);
        }

        // Update Enemies
        for (let i = spaceEnemies.length - 1; i >= 0; i--) {
            const e = spaceEnemies[i];
            e.y += e.speed;

            ctx.fillStyle = '#ffb700';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Hit by Laser
            for (let j = spaceLasers.length - 1; j >= 0; j--) {
                const l = spaceLasers[j];
                if (Math.hypot(e.x - l.x, e.y - l.y) < e.size / 2 + 6) {
                    addExplosion(e.x, e.y);
                    spaceEnemies.splice(i, 1);
                    spaceLasers.splice(j, 1);
                    score += 100;
                    updateHUD('ACTIVE', 'var(--neon-green)');
                    if (window.playSFX) window.playSFX('explosion');
                    break;
                }
            }

            // Hit Ship
            if (e && Math.hypot(e.x - ship.x, e.y - ship.y) < e.size / 2 + 14) {
                addExplosion(ship.x, ship.y);
                spaceEnemies.splice(i, 1);
                lives--;
                updateHUD('ACTIVE', 'var(--neon-green)');
                if (window.playSFX) window.playSFX('explosion');

                if (lives <= 0) triggerGameOver();
            }

            if (e && e.y > canvas.height + 20) spaceEnemies.splice(i, 1);
        }

        // Update Particles
        for (let i = spaceParticles.length - 1; i >= 0; i--) {
            const p = spaceParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            ctx.fillStyle = `rgba(255, 0, 127, ${p.alpha})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            if (p.alpha <= 0) spaceParticles.splice(i, 1);
        }
    }

    function addExplosion(x, y) {
        for (let i = 0; i < 12; i++) {
            spaceParticles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                alpha: 1
            });
        }
    }

    /* ==========================================
       GAME 2: GRAVITY FLIP RUNNER
       ========================================== */
    let runnerPlayer, runnerObstacles, obstacleTimer, runnerSpeed;

    function initGravityFlip() {
        runnerPlayer = {
            x: 120,
            y: canvas.height - 70,
            targetY: canvas.height - 70,
            width: 28,
            height: 28,
            isGrounded: true,
            onCeiling: false
        };
        runnerObstacles = [];
        obstacleTimer = 0;
        runnerSpeed = 4.5;
    }

    function flipGravity() {
        runnerPlayer.onCeiling = !runnerPlayer.onCeiling;
        runnerPlayer.targetY = runnerPlayer.onCeiling ? 50 : canvas.height - 70;
        if (window.playSFX) window.playSFX('hover');
    }

    function updateGravityFlip() {
        // Smooth Y Movement towards target Y
        runnerPlayer.y += (runnerPlayer.targetY - runnerPlayer.y) * 0.25;

        // Draw Ceilings
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, 40);
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        // Draw Player Cube
        ctx.fillStyle = runnerPlayer.onCeiling ? '#ff007f' : '#00f0ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fillRect(runnerPlayer.x, runnerPlayer.y, runnerPlayer.width, runnerPlayer.height);
        ctx.shadowBlur = 0;

        // Spawn Obstacles
        obstacleTimer++;
        if (obstacleTimer > 75) {
            obstacleTimer = 0;
            const topSpike = Math.random() > 0.5;
            runnerObstacles.push({
                x: canvas.width + 20,
                y: topSpike ? 40 : canvas.height - 90,
                width: 24,
                height: 50,
                topSpike: topSpike
            });
        }

        // Update Obstacles
        for (let i = runnerObstacles.length - 1; i >= 0; i--) {
            const obs = runnerObstacles[i];
            obs.x -= runnerSpeed;

            ctx.fillStyle = '#ffb700';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Collision Check
            if (
                runnerPlayer.x < obs.x + obs.width &&
                runnerPlayer.x + runnerPlayer.width > obs.x &&
                runnerPlayer.y < obs.y + obs.height &&
                runnerPlayer.y + runnerPlayer.height > obs.y
            ) {
                runnerObstacles.splice(i, 1);
                lives--;
                updateHUD('ACTIVE', 'var(--neon-green)');
                if (window.playSFX) window.playSFX('explosion');

                if (lives <= 0) triggerGameOver();
            }

            if (obs.x < -40) runnerObstacles.splice(i, 1);
        }

        // Increase Score over time
        score += 1;
        updateHUD('ACTIVE', 'var(--neon-green)');
    }

    /* ==========================================
       GAME 3: CYBER BRICK BREAKER
       ========================================== */
    let paddle, ball, bricks, ballLaunched;

    function initBrickBreaker() {
        paddle = { x: canvas.width / 2 - 50, y: canvas.height - 35, width: 100, height: 12, speed: 8 };
        ball = { x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4, radius: 8 };
        ballLaunched = false;

        bricks = [];
        const rows = 4;
        const cols = 8;
        const bw = 85;
        const bh = 20;
        const padding = 10;
        const offsetLeft = 20;
        const offsetTop = 60;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                bricks.push({
                    x: offsetLeft + c * (bw + padding),
                    y: offsetTop + r * (bh + padding),
                    width: bw,
                    height: bh,
                    status: 1,
                    color: r % 2 === 0 ? '#00f0ff' : '#9d4edd'
                });
            }
        }
    }

    function launchBall() {
        ballLaunched = true;
        if (window.playSFX) window.playSFX('laser');
    }

    function updateBrickBreaker() {
        // Paddle Controls
        if (keys['KeyA'] || keys['ArrowLeft']) paddle.x -= paddle.speed;
        if (keys['KeyD'] || keys['ArrowRight']) paddle.x += paddle.speed;

        if (mouseX) paddle.x = mouseX - paddle.width / 2;
        paddle.x = Math.max(10, Math.min(canvas.width - paddle.width - 10, paddle.x));

        // Draw Paddle
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.shadowBlur = 0;

        if (!ballLaunched) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - 12;
        } else {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall Collisions
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
                ball.dx = -ball.dx;
                if (window.playSFX) window.playSFX('hover');
            }
            if (ball.y - ball.radius < 50) {
                ball.dy = -ball.dy;
                if (window.playSFX) window.playSFX('hover');
            }

            // Paddle Collision
            if (
                ball.y + ball.radius >= paddle.y &&
                ball.x >= paddle.x &&
                ball.x <= paddle.x + paddle.width
            ) {
                ball.dy = -Math.abs(ball.dy);
                if (window.playSFX) window.playSFX('hover');
            }

            // Bottom Drop
            if (ball.y > canvas.height) {
                lives--;
                ballLaunched = false;
                updateHUD('ACTIVE', 'var(--neon-green)');
                if (window.playSFX) window.playSFX('explosion');

                if (lives <= 0) triggerGameOver();
            }
        }

        // Draw Ball
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw & Check Bricks
        let remainingBricks = 0;
        bricks.forEach(b => {
            if (b.status === 1) {
                remainingBricks++;
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, b.width, b.height);

                if (
                    ball.x > b.x && ball.x < b.x + b.width &&
                    ball.y - ball.radius < b.y + b.height &&
                    ball.y + ball.radius > b.y
                ) {
                    b.status = 0;
                    ball.dy = -ball.dy;
                    score += 150;
                    updateHUD('ACTIVE', 'var(--neon-green)');
                    if (window.playSFX) window.playSFX('explosion');
                }
            }
        });

        if (remainingBricks === 0) {
            triggerWin();
        }
    }

    function triggerGameOver() {
        gameActive = false;
        updateHUD('MISSION FAILED', 'var(--neon-pink)');
        startOverlay.querySelector('h2').textContent = 'GAME OVER - SCORE: ' + score;
        startOverlay.style.display = 'flex';
    }

    function triggerWin() {
        gameActive = false;
        updateHUD('MISSION COMPLETE!', 'var(--neon-green)');
        startOverlay.querySelector('h2').textContent = 'VICTORY! ALL BRICKS CLEARED!';
        startOverlay.style.display = 'flex';
    }

    /* ==========================================
       MAIN GAME LOOP RENDERER
       ========================================== */
    function gameLoop() {
        if (!gameActive) return;

        // Clear Canvas
        ctx.fillStyle = '#080b12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Background Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 15; i++) {
            const rx = (Math.sin(i * 44 + Date.now() * 0.001) * 0.5 + 0.5) * canvas.width;
            const ry = (Math.cos(i * 12 + Date.now() * 0.001) * 0.5 + 0.5) * canvas.height;
            ctx.fillRect(rx, ry, 2, 2);
        }

        if (currentGameIndex === 0) updateSpaceDefender();
        else if (currentGameIndex === 1) updateGravityFlip();
        else if (currentGameIndex === 2) updateBrickBreaker();

        if (gameActive) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    // Default Initialization
    setupSelectedGame();
});
