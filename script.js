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

    let width  = canvas.width  = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Smooth mouse
    let mouseX = width / 2, mouseY = height / 2;
    let targetX = width / 2, targetY = height / 2;

    // Effect pools
    const shockwaves  = [];
    const embers      = [];
    const mouseTrail  = [];
    const shootingStars = [];

    // ── Resize ──────────────────────────────────────────────
    window.addEventListener('resize', () => {
        width  = canvas.width  = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // ── Mouse & Touch Move Handlers ───────────────────────────
    function handlePointerMove(clientX, clientY) {
        targetX = clientX;
        targetY = clientY;
        mouseTrail.push({ x: clientX, y: clientY, alpha: 1 });
        if (mouseTrail.length > 28) mouseTrail.shift();
    }

    window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // ── Click & Touch Action → Shockwave + Ember burst ───────
    function triggerBurst(clientX, clientY) {
        // 3 concentric shockwave rings
        [0, 60, 130].forEach((delay, idx) => {
            setTimeout(() => {
                shockwaves.push({
                    x: clientX, y: clientY,
                    radius: 5 + idx * 20,
                    maxRadius: 260 + idx * 40,
                    speed: 8 - idx * 1.5,
                    alpha: 0.9 - idx * 0.2,
                    color: idx === 0 ? '0,240,255' : idx === 1 ? '157,78,221' : '255,0,127'
                });
            }, delay);
        });

        // 40 ember sparks
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 2;
            embers.push({
                x: clientX, y: clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 1,
                color: ['#00f0ff','#ff007f','#9d4edd','#00ff88'][Math.floor(Math.random()*4)],
                alpha: 1,
                decay: 0.018 + Math.random() * 0.015
            });
        }
    }

    window.addEventListener('click', (e) => triggerBurst(e.clientX, e.clientY));

    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            triggerBurst(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // ── Particle colours ─────────────────────────────────────
    const COLORS = [
        [0,   240, 255],  // cyan
        [157, 78,  221],  // purple
        [255, 0,   127],  // pink
        [0,   255, 136],  // green
        [80,  160, 255],  // blue
    ];

    // ── Main Particles (Responsive density: 120 mobile, 240 desktop) ──
    const isMobile = window.innerWidth < 768;
    const PCOUNT = isMobile ? 120 : 240;
    const particles = Array.from({ length: PCOUNT }, () => {
        const rgb = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 2.5 + 0.5,
            rgb, pulse: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.5 + 0.4,
            isHot: Math.random() < 0.12   // 12% bright hot nodes
        };
    });

    // ── Shooting Star spawner ────────────────────────────────
    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * width,
            y: -10,
            vx: (Math.random() - 0.3) * 6,
            vy: Math.random() * 7 + 4,
            len: Math.random() * 120 + 60,
            alpha: 1,
            color: Math.random() > 0.5 ? '0,240,255' : '157,78,221'
        });
    }
    setInterval(spawnShootingStar, 1400);

    // ── Grid offset ──────────────────────────────────────────
    let gridOff = 0;
    let frame   = 0;

    // ── MAIN RENDER LOOP ─────────────────────────────────────
    function render() {
        frame++;

        // Smooth mouse
        mouseX += (targetX - mouseX) * 0.1;
        mouseY += (targetY - mouseY) * 0.1;

        // ── TRUE BLACK background ────────────────────────────
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // ── Very subtle deep glow at cursor ─────────────────
        const cursorAura = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
        cursorAura.addColorStop(0, 'rgba(0,240,255,0.04)');
        cursorAura.addColorStop(1, 'transparent');
        ctx.fillStyle = cursorAura;
        ctx.fillRect(0, 0, width, height);

        // ── Perspective grid – scrolling toward viewer ───────
        gridOff = (gridOff + 0.4) % 80;
        ctx.lineWidth = 0.5;

        // Horizontal lines converging to horizon
        for (let row = 0; row < 20; row++) {
            const yRaw = (row / 20) * height + gridOff * (row / 20);
            const a = 0.03 + (row / 20) * 0.04;
            ctx.strokeStyle = `rgba(0,240,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(0, yRaw);
            ctx.lineTo(width, yRaw);
            ctx.stroke();
        }
        // Vertical lines
        const vCount = 18;
        for (let col = 0; col <= vCount; col++) {
            const xRaw = (col / vCount) * width;
            const a = 0.025;
            ctx.strokeStyle = `rgba(0,240,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(xRaw, height / 2);
            ctx.lineTo(xRaw, height);
            ctx.stroke();
        }

        // ── DNA Helix spirals in corners ─────────────────────
        const t = frame * 0.018;
        const helixPoints = 30;
        [[40, height/2], [width-40, height/2]].forEach(([hx, hy], si) => {
            for (let k = 0; k < helixPoints; k++) {
                const ang = t + k * 0.28 + si * Math.PI;
                const yy  = hy - 260 + k * 17;
                const xx1 = hx + Math.cos(ang) * 22;
                const xx2 = hx + Math.cos(ang + Math.PI) * 22;
                const prog = k / helixPoints;

                ctx.fillStyle = `rgba(0,240,255,${0.5 * prog})`;
                ctx.beginPath();
                ctx.arc(xx1, yy, 2.5, 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = `rgba(157,78,221,${0.5 * prog})`;
                ctx.beginPath();
                ctx.arc(xx2, yy, 2.5, 0, Math.PI*2);
                ctx.fill();

                // rung connecting strands
                if (k % 4 === 0) {
                    ctx.strokeStyle = `rgba(255,255,255,${0.08 * prog})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(xx1, yy);
                    ctx.lineTo(xx2, yy);
                    ctx.stroke();
                }
            }
        });

        // ── Shooting Stars ───────────────────────────────────
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += s.vx; s.y += s.vy;
            s.alpha -= 0.012;

            const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len/s.vy), s.y - s.len);
            grad.addColorStop(0, `rgba(${s.color},${s.alpha})`);
            grad.addColorStop(1, `rgba(${s.color},0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * (s.len/s.vy), s.y - s.len);
            ctx.stroke();

            if (s.alpha <= 0 || s.y > height + 20) shootingStars.splice(i, 1);
        }

        // ── Mouse Trail ──────────────────────────────────────
        for (let i = mouseTrail.length - 1; i >= 0; i--) {
            const tp = mouseTrail[i];
            const prog = i / mouseTrail.length;
            ctx.fillStyle = `rgba(0,240,255,${prog * 0.35})`;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, prog * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // ── Shockwaves ───────────────────────────────────────
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha  -= 0.016;

            ctx.strokeStyle = `rgba(${sw.color},${sw.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Push particles
            particles.forEach(p => {
                const pdx = p.x - sw.x, pdy = p.y - sw.y;
                const pd  = Math.hypot(pdx, pdy);
                if (Math.abs(pd - sw.radius) < 30 && pd > 0) {
                    p.vx += (pdx / pd) * 2.5;
                    p.vy += (pdy / pd) * 2.5;
                }
            });

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) shockwaves.splice(i, 1);
        }

        // ── Click Embers ─────────────────────────────────────
        for (let i = embers.length - 1; i >= 0; i--) {
            const e = embers[i];
            e.x += e.vx; e.y += e.vy;
            e.vx *= 0.93; e.vy *= 0.93;
            e.alpha -= e.decay;
            ctx.fillStyle = e.color;
            ctx.globalAlpha = e.alpha;
            ctx.shadowColor = e.color;
            ctx.shadowBlur  = 6;
            ctx.fillRect(e.x - e.size/2, e.y - e.size/2, e.size, e.size);
            ctx.shadowBlur  = 0;
            ctx.globalAlpha = 1;
            if (e.alpha <= 0) embers.splice(i, 1);
        }

        // ── Particles & Constellation Web ────────────────────
        ctx.save();
        for (let i = 0; i < PCOUNT; i++) {
            const p = particles[i];
            p.pulse += 0.025;
            const sz = p.size + Math.sin(p.pulse) * 0.5;

            // Drift + friction
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.992;
            p.vy *= 0.992;

            // Wrap
            if (p.x < 0) p.x = width;  if (p.x > width)  p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;

            // Mouse repel zone / laser filaments
            const dx   = mouseX - p.x;
            const dy   = mouseY - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 180 && dist > 0) {
                const fa = (1 - dist / 180) * 0.5;
                ctx.strokeStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${fa})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
                p.vx -= (dx / dist) * 0.35;
                p.vy -= (dy / dist) * 0.35;
            }

            // Constellation connections
            for (let j = i + 1; j < PCOUNT; j++) {
                const q   = particles[j];
                const qd  = Math.hypot(q.x - p.x, q.y - p.y);
                if (qd < 100) {
                    const la = (1 - qd / 100) * 0.2;
                    ctx.strokeStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${la})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            // Draw dot
            const r = p.rgb;
            if (p.isHot) {
                ctx.shadowColor = `rgb(${r[0]},${r[1]},${r[2]})`;
                ctx.shadowBlur  = 18;
            }
            ctx.fillStyle = `rgba(${r[0]},${r[1]},${r[2]},${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.4, sz), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();

        requestAnimationFrame(render);
    }

    render();
}

/* ==========================================
   2. WEB AUDIO API SYNTHESIZER — FULL REWRITE
   Fixes: Mobile unlock, distinct SFX per element,
          Arcade background music, Touch SFX
   ========================================== */
let sfxEnabled = true;
let audioCtx   = null;
let audioBooted = false;
let arcadeMusicNodes = null;

/* ── Unlock / get AudioContext ──────────────── */
function getAudioCtx() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

/* ── Single oscillator helper ───────────────── */
function makeNote(freq, endFreq, dur, vol, type, delayMs) {
    if (!sfxEnabled) return;
    const ac = getAudioCtx();
    if (!ac) return;
    setTimeout(() => {
        try {
            const now = ac.currentTime;
            const osc  = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(Math.max(1, freq), now);
            if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + dur);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            osc.start(now);
            osc.stop(now + dur + 0.02);
        } catch(e) {}
    }, delayMs || 0);
}

/* ── White noise burst helper ───────────────── */
function makeNoise(dur, vol, lpFreq) {
    const ac = getAudioCtx();
    if (!ac) return;
    try {
        const now    = ac.currentTime;
        const frames = ac.sampleRate * dur;
        const buf    = ac.createBuffer(1, frames, ac.sampleRate);
        const data   = buf.getChannelData(0);
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
        const src    = ac.createBufferSource();
        src.buffer   = buf;
        const filt   = ac.createBiquadFilter();
        filt.type    = 'lowpass';
        filt.frequency.setValueAtTime(lpFreq || 800, now);
        const gain   = ac.createGain();
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        src.connect(filt); filt.connect(gain); gain.connect(ac.destination);
        src.start(now); src.stop(now + dur + 0.02);
    } catch(e) {}
}

/* ── Main SFX dispatcher ────────────────────── */
window.playSFX = function(type) {
    if (!sfxEnabled) return;
    switch(type) {
        /* Nav link click — rising laser ping */
        case 'nav':
            makeNote(300, 900, 0.12, 0.05, 'sine');
            makeNote(600, 1200, 0.08, 0.03, 'triangle', 60);
            break;
        /* Generic button click — quick zap */
        case 'click':
            makeNote(700, 280, 0.09, 0.06, 'triangle');
            break;
        /* Game card hover / reveal */
        case 'card':
            makeNote(420, 840, 0.14, 0.04, 'sine');
            makeNote(840, 1260, 0.1, 0.025, 'sine', 80);
            break;
        /* Filter tab — blip */
        case 'filter':
            makeNote(900, 700, 0.05, 0.045, 'square');
            break;
        /* Hover — subtle tick */
        case 'hover':
            makeNote(600, 750, 0.04, 0.01, 'sine');
            break;
        /* Form keystroke */
        case 'keystroke':
            makeNote(950, 750, 0.025, 0.006, 'triangle');
            break;
        /* SFX toggle */
        case 'toggle':
            makeNote(440, 880, 0.15, 0.06, 'sine');
            makeNote(880, 440, 0.15, 0.04, 'sine', 150);
            break;
        /* Warp / nav CTA */
        case 'warp':
            makeNote(80, 1600, 0.35, 0.08, 'sawtooth');
            makeNote(160, 800, 0.35, 0.045, 'square', 20);
            break;
        /* Power-up */
        case 'powerup':
            makeNote(300, 900, 0.2, 0.06, 'sine');
            makeNote(600, 1200, 0.15, 0.05, 'sine', 180);
            break;
        /* Shockwave tap / touch */
        case 'tap':
            makeNote(500, 200, 0.08, 0.07, 'triangle');
            makeNoise(0.05, 0.03, 400);
            break;
        /* Explosion noise burst */
        case 'explosion':
            makeNoise(0.3, 0.14, 600);
            makeNote(120, 40, 0.3, 0.07, 'sawtooth', 30);
            break;
        /* Boot sequence */
        case 'boot':
            [0, 90, 200, 320, 480].forEach((d, i) => {
                const f = [220, 330, 440, 550, 880][i];
                makeNote(f, f * 1.5, 0.13, 0.05, 'sine', d);
            });
            break;
        /* Glitch stutter */
        case 'glitch':
            [0, 55, 115, 175].forEach(d => {
                makeNote(Math.random()*400+200, Math.random()*200+80, 0.05, 0.03, 'square', d);
            });
            break;
    }
};

/* ── Arcade chiptune music ──────────────────── */
window.startArcadeMusic = function() {
    if (!sfxEnabled) return;
    window.stopArcadeMusic();
    const ac = getAudioCtx();
    if (!ac) return;

    // Simple looping melody pattern (frequencies in Hz)
    const melody = [523, 659, 784, 659, 784, 880, 1047, 880,
                    784, 659, 523, 440, 523, 659, 523, 0];
    const bass   = [131, 131, 165, 165, 196, 196, 131, 131];
    const bpm    = 160;
    const beat   = 60 / bpm;

    const master = ac.createGain();
    master.gain.setValueAtTime(0.18, ac.currentTime);
    master.connect(ac.destination);

    const nodes = [master];
    let loopHandle;

    function scheduleLoop(startTime) {
        melody.forEach((freq, i) => {
            if (freq === 0) return;
            const t = startTime + i * beat * 0.5;
            const osc  = ac.createOscillator();
            const g    = ac.createGain();
            osc.type   = 'square';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.15, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.45);
            osc.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + beat * 0.5);
            nodes.push(osc, g);
        });

        bass.forEach((freq, i) => {
            const t = startTime + i * beat;
            const osc  = ac.createOscillator();
            const g    = ac.createGain();
            osc.type   = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
            osc.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + beat);
            nodes.push(osc, g);
        });

        const loopDur = melody.length * beat * 0.5;
        loopHandle = setTimeout(() => scheduleLoop(startTime + loopDur), (loopDur - 0.1) * 1000);
        nodes.push({ _timeout: loopHandle });
    }

    scheduleLoop(ac.currentTime + 0.05);
    arcadeMusicNodes = { master, nodes, loopHandle: null };
};

window.stopArcadeMusic = function() {
    if (!arcadeMusicNodes) return;
    try {
        arcadeMusicNodes.master.gain.setValueAtTime(0.0001, (audioCtx||{currentTime:0}).currentTime);
    } catch(e) {}
    if (arcadeMusicNodes.loopHandle) clearTimeout(arcadeMusicNodes.loopHandle);
    arcadeMusicNodes.nodes.forEach(n => { try { if (n._timeout) clearTimeout(n._timeout); else if (n.stop) n.stop(); } catch(e) {} });
    arcadeMusicNodes = null;
};

function initAudioEngine() {
    const sfxBtn = document.getElementById('sfx-toggle');

    /* ── Unlock AudioContext on FIRST touch or click ── */
    const unlockAudio = () => {
        getAudioCtx(); // creates and resumes
        if (!audioBooted && sfxEnabled) {
            audioBooted = true;
            setTimeout(() => playSFX('boot'), 300);
        }
    };
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    window.addEventListener('click',      unlockAudio, { once: true });

    /* ── SFX toggle button ── */
    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            sfxEnabled = !sfxEnabled;
            sfxBtn.querySelector('.btn-text').textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
            sfxBtn.style.borderColor = sfxEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)';
            if (sfxEnabled) playSFX('toggle');
        });
    }

    /* ── Per-element distinct SFX ── */

    // Nav links
    document.querySelectorAll('.nav-link, .hud-logo').forEach(el => {
        el.addEventListener('click', () => playSFX('nav'));
    });

    // Primary / secondary CTA buttons
    document.querySelectorAll('.primary-btn, .secondary-btn').forEach(el => {
        el.addEventListener('mouseenter', () => playSFX('hover'));
        el.addEventListener('click',      () => playSFX('warp'));
    });

    // Outline / general buttons
    document.querySelectorAll('.outline-btn, .hud-btn').forEach(el => {
        el.addEventListener('mouseenter', () => playSFX('hover'));
        el.addEventListener('click',      () => playSFX('click'));
    });

    // Game cards
    document.querySelectorAll('.game-card').forEach(el => {
        el.addEventListener('mouseenter', () => playSFX('card'));
        el.addEventListener('click',      () => playSFX('powerup'));
    });

    // Filter tabs
    document.querySelectorAll('.filter-btn').forEach(el => {
        el.addEventListener('click', () => playSFX('filter'));
    });

    // Form keystrokes
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('keydown', () => playSFX('keystroke'));
        el.addEventListener('focus',   () => playSFX('scan'));
    });

    // Touch SFX — fires for finger taps on mobile (touchstart not consumed by other handlers)
    window.addEventListener('touchstart', () => {
        if (sfxEnabled) playSFX('tap');
    }, { passive: true });

    /* ── Click shockwave ripple visual ── */
    const addRipple = (x, y) => {
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;border:2px solid rgba(0,240,255,0.9);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9997;animation:rippleOut 0.55s ease-out forwards;`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };
    document.addEventListener('click', e => addRipple(e.clientX, e.clientY));
    document.addEventListener('touchstart', e => {
        if (e.touches?.[0]) addRipple(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

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
