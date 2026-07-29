/* ==========================================
   NEXUS GAMING PORTFOLIO - JAVASCRIPT ENGINE
   Includes Canvas Matrix, SFX Synth, Micro-Game
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Initialize Subsystems
    initBackgroundCanvas();
    initAudioEngine();
    initCustomCursor();
    initGameShowcase();
    initPlayableArcadeModal();
    initScrollObserver();
    initQuestTerminal();
});

/* ==========================================
   1. BACKGROUND CANVAS MATRIX & CYBER GRID
   ========================================== */
function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const shockwaves = [];
    const cyberEmbers = [];

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    window.addEventListener('click', (e) => {
        shockwaves.push({
            x: e.clientX,
            y: e.clientY,
            radius: 5,
            maxRadius: 220,
            alpha: 1
        });

        // Spawn sparkling cyber embers on click
        for (let i = 0; i < 22; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            cyberEmbers.push({
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.4 ? '#00f0ff' : '#ff007f',
                alpha: 1
            });
        }
    });

    // Color Palette
    const colors = [
        'rgba(0, 240, 255, ',   // Neon Cyan
        'rgba(157, 78, 221, ',  // Neon Purple
        'rgba(255, 0, 127, ',   // Cyber Pink
        'rgba(0, 255, 136, '    // Neon Green
    ];

    // 160 Interactive Nodes
    const particleCount = 160;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            size: Math.random() * 2.2 + 0.8,
            colorPrefix: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.6 + 0.4,
            pulse: Math.random() * Math.PI
        });
    }

    // Floating Nebula Gas Spheres
    const nebulae = [
        { x: width * 0.2, y: height * 0.3, radius: 320, color: 'rgba(0, 240, 255, 0.035)', vx: 0.15, vy: 0.1 },
        { x: width * 0.8, y: height * 0.7, radius: 380, color: 'rgba(157, 78, 221, 0.04)', vx: -0.12, vy: -0.08 },
        { x: width * 0.5, y: height * 0.5, radius: 280, color: 'rgba(255, 0, 127, 0.025)', vx: 0.08, vy: -0.12 }
    ];

    let gridOffset = 0;

    function render() {
        // Smooth mouse lag
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        ctx.clearRect(0, 0, width, height);

        // Deep Space Multi-Stop Background
        const bgGrad = ctx.createRadialGradient(
            mouseX, mouseY, 50,
            width / 2, height / 2, Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#0a0d20');
        bgGrad.addColorStop(0.5, '#050712');
        bgGrad.addColorStop(1, '#020308');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Render Floating Nebulae
        nebulae.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -100 || n.x > width + 100) n.vx *= -1;
            if (n.y < -100 || n.y > height + 100) n.vy *= -1;

            const nGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            nGrad.addColorStop(0, n.color);
            nGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nGrad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Cyber Grid Lines with Cursor Highlight
        const gridSize = 60;
        gridOffset = (gridOffset + 0.25) % gridSize;

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = gridOffset; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Interactive Cursor Grid Glow
        const cursorGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 220);
        cursorGlow.addColorStop(0, 'rgba(0, 240, 255, 0.07)');
        cursorGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 220, 0, Math.PI * 2);
        ctx.fill();

        // Update & Render Shockwaves
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += 7;
            sw.alpha -= 0.02;

            ctx.strokeStyle = `rgba(0, 240, 255, ${sw.alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Push particles outward from shockwave
            particles.forEach(p => {
                const pdx = p.x - sw.x;
                const pdy = p.y - sw.y;
                const pdist = Math.hypot(pdx, pdy);
                if (Math.abs(pdist - sw.radius) < 25 && pdist > 0) {
                    p.vx += (pdx / pdist) * 2;
                    p.vy += (pdy / pdist) * 2;
                }
            });

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                shockwaves.splice(i, 1);
            }
        }

        // Render Click Embers
        for (let i = cyberEmbers.length - 1; i >= 0; i--) {
            const e = cyberEmbers[i];
            e.x += e.vx;
            e.y += e.vy;
            e.vx *= 0.95;
            e.vy *= 0.95;
            e.alpha -= 0.025;

            ctx.fillStyle = e.color;
            ctx.globalAlpha = e.alpha;
            ctx.fillRect(e.x, e.y, e.size, e.size);
            ctx.globalAlpha = 1;

            if (e.alpha <= 0) cyberEmbers.splice(i, 1);
        }

        // Update & Draw Particles & Constellation Lasers
        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];

            p.pulse += 0.03;
            const currentSize = p.size + Math.sin(p.pulse) * 0.4;

            p.x += p.vx;
            p.y += p.vy;

            // Friction
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Screen Wrap
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Mouse Interaction (Magnet & Push)
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 150) {
                // Laser filament to cursor
                const alpha = (1 - dist / 150) * 0.6;
                ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();

                // Gentle magnetic drift
                p.x -= (dx / dist) * 0.6;
                p.y -= (dy / dist) * 0.6;
            }

            // Connect lines between close particles
            for (let j = i + 1; j < particleCount; j++) {
                const p2 = particles[j];
                const pdx = p2.x - p.x;
                const pdy = p2.y - p.y;
                const pdist = Math.hypot(pdx, pdy);

                if (pdist < 110) {
                    const lineAlpha = (1 - pdist / 110) * 0.25;
                    ctx.strokeStyle = p.colorPrefix + lineAlpha + ')';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw Node Dot
            ctx.fillStyle = p.colorPrefix + p.alpha + ')';
            ctx.shadowColor = p.colorPrefix + '1)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(render);
    }

    render();
}

/* ==========================================
   2. WEB AUDIO API SYNTHESIZER - SCI-FI UPGRADE
   ========================================== */
let sfxEnabled = true;
let audioCtx = null;
let audioBooted = false;

function initAudioEngine() {
    const sfxBtn = document.getElementById('sfx-toggle');
    
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Rich Sci-Fi SFX Library
    window.playSFX = function(type) {
        if (!sfxEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            function makeOsc(freq, endFreq, duration, volume, oscType) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = oscType || 'sine';
                osc.frequency.setValueAtTime(freq, now);
                if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
                gain.gain.setValueAtTime(volume, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                osc.start(now);
                osc.stop(now + duration + 0.01);
            }

            switch (type) {
                case 'hover':    makeOsc(550, 750, 0.045, 0.012, 'sine'); break;
                case 'click':    makeOsc(700, 300, 0.07, 0.055, 'triangle'); break;
                case 'laser':    makeOsc(1100, 180, 0.14, 0.065, 'sawtooth'); break;
                case 'scan':     makeOsc(400, 1600, 0.3, 0.04, 'sine'); break;
                case 'warp':
                    makeOsc(80, 1600, 0.4, 0.09, 'sawtooth');
                    makeOsc(160, 800, 0.4, 0.05, 'square');
                    break;
                case 'powerup':
                    makeOsc(300, 900, 0.2, 0.06, 'sine');
                    setTimeout(() => makeOsc(600, 1200, 0.15, 0.05, 'sine'), 180);
                    break;
                case 'glitch':
                    [0, 50, 110, 170].forEach(d => {
                        setTimeout(() => makeOsc(Math.random()*400+200, Math.random()*200+100, 0.05, 0.035, 'square'), d);
                    });
                    break;
                case 'keystroke': makeOsc(900, 700, 0.028, 0.007, 'triangle'); break;
                case 'boot':
                    [0, 80, 180, 300, 460].forEach((delay, i) => {
                        const freqs = [220, 330, 440, 550, 880];
                        setTimeout(() => makeOsc(freqs[i], freqs[i]*1.5, 0.12, 0.05, 'sine'), delay);
                    });
                    break;
                case 'alarm':
                    [0, 200, 400].forEach(d => setTimeout(() => makeOsc(880, 440, 0.15, 0.06, 'square'), d));
                    break;
                case 'explosion': {
                    const bufLen = ctx.sampleRate * 0.3;
                    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
                    const src = ctx.createBufferSource();
                    src.buffer = buf;
                    const expGain = ctx.createGain();
                    const expFilter = ctx.createBiquadFilter();
                    expFilter.type = 'lowpass';
                    expFilter.frequency.setValueAtTime(600, now);
                    src.connect(expFilter); expFilter.connect(expGain); expGain.connect(ctx.destination);
                    expGain.gain.setValueAtTime(0.15, now);
                    expGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                    src.start(now); src.stop(now + 0.35);
                    break;
                }
            }
        } catch (e) { console.warn('Audio error', e); }
    };

    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            sfxEnabled = !sfxEnabled;
            sfxBtn.querySelector('.btn-text').textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
            sfxBtn.style.borderColor = sfxEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)';
            if (sfxEnabled) playSFX('powerup');
        });
    }

    // Boot jingle on first click
    const bootOnce = () => {
        if (!audioBooted && sfxEnabled) { audioBooted = true; setTimeout(() => playSFX('boot'), 200); }
        window.removeEventListener('click', bootOnce);
    };
    window.addEventListener('click', bootOnce);

    // SFX on interactive elements
    document.querySelectorAll('button, a, .filter-btn, .game-card').forEach(el => {
        el.addEventListener('mouseenter', () => playSFX('hover'));
        el.addEventListener('click', () => playSFX('click'));
    });

    // Keystroke SFX
    document.querySelectorAll('input, textarea').forEach(el => el.addEventListener('keydown', () => playSFX('keystroke')));

    // Shockwave ripple on any click
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0;border:2px solid rgba(0,240,255,0.9);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9997;animation:rippleOut 0.55s ease-out forwards;`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
    if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = '@keyframes rippleOut { to { width:80px;height:80px;opacity:0;border-color:rgba(0,240,255,0); } }';
        document.head.appendChild(s);
    }
}

/* ==========================================
   3. CUSTOM CYBER CURSOR
   ========================================== */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    const toggleBtn = document.getElementById('cursor-toggle');

    let active = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            active = !active;
            document.body.classList.toggle('custom-cursor-active', active);
            toggleBtn.querySelector('.btn-text').textContent = active ? 'AIM: ON' : 'AIM';
            toggleBtn.style.color = active ? 'var(--neon-pink)' : 'var(--text-bright)';
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!active) return;
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
    });
}

/* ==========================================
   4. ARCADE VAULT SHOWCASE & FILTERING
   ========================================== */
function initGameShowcase() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');
    const searchInput = document.getElementById('game-search');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            filterGames(filter, searchInput ? searchInput.value : '');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            filterGames(activeFilter, e.target.value);
        });
    }

    function filterGames(category, query) {
        const q = query.toLowerCase().trim();

        gameCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            const cardText = card.textContent.toLowerCase();

            const matchesCategory = (category === 'all' || cardCat === category);
            const matchesSearch = (!q || cardText.includes(q));

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

/* ==========================================
   5. PLAYABLE RETRO ARCADE MODAL GAME
   ========================================== */
function initPlayableArcadeModal() {
    const modal = document.getElementById('game-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const triggers = document.querySelectorAll('.play-trigger-btn');
    
    const canvas = document.getElementById('arcade-game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const startOverlay = document.getElementById('arcade-overlay');
    const startBtn = document.getElementById('start-arcade-btn');
    
    const scoreEl = document.getElementById('game-score');
    const livesEl = document.getElementById('game-lives');
    const statusEl = document.getElementById('game-status');
    const modalTitle = document.getElementById('modal-game-title');
    const modalDesc = document.getElementById('modal-game-desc');
    const specEngine = document.getElementById('spec-engine');

    const gameData = [
        {
            title: "NEON OVERDRIVE: CYBER CITY (WEBGL DEMO)",
            desc: "Fast-paced hack-and-slash action title built with Unity 6 HDRP. Features custom physics combat state machines, combos, and FMOD reactive music.",
            engine: "Unity 6 / HDRP"
        },
        {
            title: "STEEL TITAN: MECH STRIKE (WEBGL SIMULATOR)",
            desc: "High-octane space combat simulator featuring 500+ simultaneous projectile entities rendered smoothly using Unity DOTS / ECS architecture.",
            engine: "Unity DOTS / ECS"
        },
        {
            title: "SYNTH RUNNER 2099 (RETRO ARCADE)",
            desc: "Precise physics-driven 2D synthwave platformer with procedural obstacles, parallax depth, and sound-beat synchronization.",
            engine: "Unity 2D / Universal RP"
        },
        {
            title: "AETHERIA: VR DUNGEON CRAWLER (SIMULATOR)",
            desc: "Physics-based spellcasting and sword combat built for Meta Quest & OpenXR with custom gesture spell casting interactions.",
            engine: "OpenXR / Quest SDK"
        }
    ];

    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.getAttribute('data-game') || '0', 10);
            const data = gameData[index] || gameData[0];
            
            modalTitle.textContent = data.title;
            modalDesc.textContent = data.desc;
            specEngine.textContent = data.engine;

            modal.classList.add('active');
            resetArcadeGame();
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            stopArcadeGame();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            stopArcadeGame();
        }
    });

    // Arcade Game Engine Logic
    let gameLoopId = null;
    let gameActive = false;
    let score = 0;
    let lives = 3;

    let ship = { x: 400, y: 380, width: 32, height: 32, speed: 6 };
    let lasers = [];
    let enemies = [];
    let particles = [];
    let keys = {};

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space' && gameActive) {
            e.preventDefault();
            fireLaser();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startArcadeGame();
        });
    }

    function resetArcadeGame() {
        stopArcadeGame();
        startOverlay.style.display = 'flex';
        score = 0;
        lives = 3;
        if (scoreEl) scoreEl.textContent = '0000';
        if (livesEl) livesEl.textContent = '❤❤❤';
        if (statusEl) {
            statusEl.textContent = 'READY';
            statusEl.style.color = 'var(--neon-cyan)';
        }
    }

    function startArcadeGame() {
        startOverlay.style.display = 'none';
        gameActive = true;
        score = 0;
        lives = 3;
        ship.x = canvas.width / 2;
        ship.y = canvas.height - 60;
        lasers = [];
        enemies = [];
        particles = [];
        
        if (statusEl) {
            statusEl.textContent = 'ACTIVE';
            statusEl.style.color = 'var(--neon-green)';
        }

        if (window.playSFX) window.playSFX('click');

        lastTime = performance.now();
        gameLoopId = requestAnimationFrame(updateArcadeGame);
    }

    function stopArcadeGame() {
        gameActive = false;
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
    }

    function fireLaser() {
        lasers.push({ x: ship.x, y: ship.y - 15, speed: 10 });
        if (window.playSFX) window.playSFX('laser');
    }

    let enemyTimer = 0;

    function updateArcadeGame() {
        if (!gameActive || !ctx) return;

        // Clear Canvas
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Retro Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 20; i++) {
            const rx = (Math.sin(i * 99 + Date.now() * 0.001) * 0.5 + 0.5) * canvas.width;
            const ry = (Math.cos(i * 33 + Date.now() * 0.002) * 0.5 + 0.5) * canvas.height;
            ctx.fillRect(rx, ry, 2, 2);
        }

        // Ship Controls
        if (keys['KeyA'] || keys['ArrowLeft']) ship.x -= ship.speed;
        if (keys['KeyD'] || keys['ArrowRight']) ship.x += ship.speed;
        if (keys['KeyW'] || keys['ArrowUp']) ship.y -= ship.speed;
        if (keys['KeyS'] || keys['ArrowDown']) ship.y += ship.speed;

        // Boundaries
        ship.x = Math.max(20, Math.min(canvas.width - 20, ship.x));
        ship.y = Math.max(100, Math.min(canvas.height - 30, ship.y));

        // Draw Ship (Player Tri-fighter)
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
        if (enemyTimer > 45) {
            enemyTimer = 0;
            enemies.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -20,
                speed: Math.random() * 2 + 2,
                size: 24
            });
        }

        // Update Lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.y -= l.speed;
            
            ctx.fillStyle = '#ff007f';
            ctx.shadowColor = '#ff007f';
            ctx.shadowBlur = 8;
            ctx.fillRect(l.x - 2, l.y, 4, 12);
            ctx.shadowBlur = 0;

            if (l.y < 0) lasers.splice(i, 1);
        }

        // Update Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.y += e.speed;

            // Draw Enemy Drone
            ctx.fillStyle = '#ffb700';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Collision with Lasers
            for (let j = lasers.length - 1; j >= 0; j--) {
                const l = lasers[j];
                const dist = Math.hypot(e.x - l.x, e.y - l.y);
                if (dist < e.size / 2 + 6) {
                    // Explosion FX
                    createExplosion(e.x, e.y);
                    enemies.splice(i, 1);
                    lasers.splice(j, 1);
                    score += 100;
                    if (scoreEl) scoreEl.textContent = String(score).padStart(4, '0');
                    if (window.playSFX) window.playSFX('explosion');
                    break;
                }
            }

            // Collision with Ship
            if (e && Math.hypot(e.x - ship.x, e.y - ship.y) < e.size / 2 + 14) {
                createExplosion(ship.x, ship.y);
                enemies.splice(i, 1);
                lives--;
                if (livesEl) livesEl.textContent = '❤'.repeat(Math.max(0, lives));
                if (window.playSFX) window.playSFX('explosion');

                if (lives <= 0) {
                    gameActive = false;
                    statusEl.textContent = 'MISSION FAILED';
                    statusEl.style.color = 'var(--neon-pink)';
                    startOverlay.querySelector('h2').textContent = 'GAME OVER - FINAL SCORE: ' + score;
                    startOverlay.style.display = 'flex';
                }
            }

            if (e && e.y > canvas.height + 20) {
                enemies.splice(i, 1);
            }
        }

        // Draw Explosion Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;

            ctx.fillStyle = `rgba(255, 0, 127, ${p.alpha})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            if (p.alpha <= 0) particles.splice(i, 1);
        }

        if (gameActive) {
            gameLoopId = requestAnimationFrame(updateArcadeGame);
        }
    }

    function createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                alpha: 1
            });
        }
    }
}

/* ==========================================
   6. SCROLL OBSERVER (SKILL BARS)
   ========================================== */
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target.querySelector('.progress-fill');
                if (bar) {
                    const targetWidth = bar.getAttribute('style');
                    // Trigger reflow for CSS transition
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.setAttribute('style', targetWidth);
                    }, 50);
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-item').forEach(item => observer.observe(item));
}

/* ==========================================
   7. QUEST TERMINAL CONTACT FORM
   ========================================== */
function initQuestTerminal() {
    const form = document.getElementById('quest-form');
    const output = document.getElementById('terminal-console-output');

    if (!form || !output) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('commander-name').value;
        const email = document.getElementById('commander-email').value;
        const type = document.getElementById('project-type').value;

        output.style.display = 'block';
        output.innerHTML = `> TRANSMITTING DISPATCH...<br>> ENCRYPTING COMM LINK (${email})...<br>> SENT TO ARCHITECT BASIL JIJO!`;

        if (window.playSFX) window.playSFX('laser');

        setTimeout(() => {
            output.innerHTML += `<br><br><span style="color:var(--neon-green)">[200 OK]: Quest Message successfully logged! Basil will reply within 24 hours.</span>`;
            form.reset();
        }, 1200);
    });
}
