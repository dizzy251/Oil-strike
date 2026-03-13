import React, { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play, Trophy, Zap, Fuel, Smartphone, Coins, Crosshair } from "lucide-react";

const Card = ({ children, className = "" }) => <div className={className}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;
const Button = ({ children, onClick, className = "", type = "button" }) => (
  <button type={type} onClick={onClick} className={className}>
    {children}
  </button>
);
const Badge = ({ children, className = "" }) => <span className={className}>{children}</span>;

export default function OilSkyPrototype() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const gameRef = useRef(null);

  const [status, setStatus] = useState("menu");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [oil, setOil] = useState(0);
  const [cash, setCash] = useState(0);
  const [shotsHit, setShotsHit] = useState(0);
  const [distance, setDistance] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isTouching, setIsTouching] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [viewportSize, setViewportSize] = useState({
  width: typeof window !== "undefined" ? window.innerWidth : 1280,
  height: typeof window !== "undefined" ? window.innerHeight : 720,
});
const [layoutVersion, setLayoutVersion] = useState(0);

  const statusRef = useRef("menu");
  const isTouchingRef = useRef(false);
  const scoreRef = useRef(0);
  const oilRef = useRef(0);
  const cashRef = useRef(0);
  const shotsHitRef = useRef(0);
  const distanceRef = useRef(0);
  const difficultyRef = useRef(1);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const palette = useMemo(
    () => ({
      skyTop: "#09111f",
      skyBottom: "#14345c",
      cloud: "rgba(255,255,255,0.18)",
      groundDark: "#0f1726",
      groundLight: "#1d2c42",
      gold: "#f5c04c",
      red: "#ff5f57",
      teal: "#66e0da",
      oil: "#171717",
      oilHighlight: "#2b2b2b",
      white: "#f6f8fc",
    }),
    []
  );

  useEffect(() => {
    const saved = Number(localStorage.getItem("oil-sky-best") || 0);
    setBest(saved);
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    isTouchingRef.current = isTouching;
  }, [isTouching]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    oilRef.current = oil;
  }, [oil]);

  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);

  useEffect(() => {
    shotsHitRef.current = shotsHit;
  }, [shotsHit]);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);
  useEffect(() => {
  let frame = 0;
  let timeoutId = 0;

  function updateViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width <= 1024;
    const landscape = width > height;

    setViewportSize({ width, height });
    setIsMobileLandscape(mobile && landscape);
    setLayoutVersion((v) => v + 1);
  }

  function handleViewportChange() {
    cancelAnimationFrame(frame);
    clearTimeout(timeoutId);

    frame = requestAnimationFrame(() => {
      updateViewport();

      timeoutId = window.setTimeout(() => {
        updateViewport();
      }, 250);
    });
  }

  updateViewport();

  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleViewportChange);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportChange);
  }

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timeoutId);
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("orientationchange", handleViewportChange);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", handleViewportChange);
    }
  };
}, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const game = {
      width: 0,
      height: 0,
      viewScale: 1,
      lastTs: 0,
      running: true,
      input: false,
      spawnTimer: 0,
      missileTimer: 0,
      fireTimer: 0,
      cloudOffset: 0,
      farOffset: 0,
      nearOffset: 0,
      shake: 0,
      flash: 0,
      player: null,
      rigs: [],
      missiles: [],
      bullets: [],
      barrels: [],
      particles: [],
      stars: [],
      tryShoot: null,
    };
    gameRef.current = game;

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
function resize() {
  const rect = wrap.getBoundingClientRect();

  const landscapeZoom = isMobileLandscape ? 0.58 : 1;
  game.viewScale = landscapeZoom;

  game.width = Math.max(360, rect.width / game.viewScale);
  game.height = Math.max(isMobileLandscape ? 500 : 640, rect.height / game.viewScale);

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  resetGame(false);
}

  const scaleX = game.width / oldWidth;
  const scaleY = game.height / oldHeight;

  if (game.player) {
    game.player.x *= scaleX;
    game.player.y *= scaleY;
    game.player.y = clamp(game.player.y, 54, game.height - 120);
  }

  game.rigs = game.rigs.map((rig) => ({
    ...rig,
    x: rig.x * scaleX,
    y: rig.y * scaleY,
    w: rig.w * scaleX,
    h: rig.h * scaleY,
  }));

  game.missiles = game.missiles.map((missile) => ({
    ...missile,
    x: missile.x * scaleX,
    y: missile.y * scaleY,
    r: missile.r * Math.min(scaleX, scaleY),
  }));

  game.bullets = game.bullets.map((bullet) => ({
    ...bullet,
    x: bullet.x * scaleX,
    y: bullet.y * scaleY,
    r: bullet.r * Math.min(scaleX, scaleY),
    trail: bullet.trail * scaleX,
  }));

  game.barrels = game.barrels.map((barrel) => ({
    ...barrel,
    x: barrel.x * scaleX,
    y: barrel.y * scaleY,
    r: barrel.r * Math.min(scaleX, scaleY),
  }));

  game.particles = game.particles.map((part) => ({
    ...part,
    x: part.x * scaleX,
    y: part.y * scaleY,
    size: part.size * Math.min(scaleX, scaleY),
  }));

  game.stars = game.stars.map((star) => ({
    ...star,
    x: star.x * scaleX,
    y: star.y * scaleY,
  }));
}

    function resetGame(startPlaying = true) {
      game.spawnTimer = 0;
      game.missileTimer = 1.2;
      game.fireTimer = 0;
      game.cloudOffset = 0;
      game.farOffset = 0;
      game.nearOffset = 0;
      game.shake = 0;
      game.flash = 0;
      game.rigs = [];
      game.missiles = [];
      game.bullets = [];
      game.barrels = [];
      game.particles = [];
      game.stars = Array.from({ length: 55 }, () => ({
        x: Math.random() * game.width,
        y: Math.random() * game.height * 0.75,
        s: Math.random() * 2 + 0.4,
        a: Math.random() * 0.8 + 0.2,
      }));
      game.player = {
        x: game.width * 0.24,
        y: game.height * 0.42,
        vy: 0,
        fuelHeat: 0,
        tilt: 0,
        alive: true,
      };
      scoreRef.current = 0;
      oilRef.current = 0;
      cashRef.current = 0;
      shotsHitRef.current = 0;
      distanceRef.current = 0;
      difficultyRef.current = 1;
      setScore(0);
      setOil(0);
      setCash(0);
      setShotsHit(0);
      setDistance(0);
      setDifficulty(1);
      setStatus(startPlaying ? "playing" : "menu");
    }

    function emitExplosion(x, y, intensity = 1) {
      const count = Math.floor(18 * intensity);
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x,
          y,
          vx: random(-180, 180) * intensity,
          vy: random(-180, 180) * intensity,
          life: random(0.35, 0.8),
          maxLife: 0.8,
          size: random(3, 8),
          type: Math.random() > 0.25 ? "fire" : "smoke",
        });
      }
      game.shake = Math.max(game.shake, 8 * intensity);
      game.flash = Math.max(game.flash, 0.12 * intensity);
    }

    function emitJetTrail(x, y) {
      game.particles.push({
        x,
        y,
        vx: random(-70, -10),
        vy: random(-20, 20),
        life: random(0.18, 0.4),
        maxLife: 0.4,
        size: random(4, 8),
        type: Math.random() > 0.4 ? "trail" : "spark",
      });
    }

    function spawnRig() {
      const h = random(90, 180);
      const w = random(70, 110);
      const y = game.height - h - 28;
      game.rigs.push({
        x: game.width + w + 40,
        y,
        w,
        h,
        bob: random(0, Math.PI * 2),
      });
    }

    function spawnMissile() {
      const level = Math.min(8, 1 + Math.floor(distanceRef.current / 700));
      const fromTop = Math.random() > 0.4;
      game.missiles.push({
        x: game.width + 70,
        y: fromTop ? random(40, game.height * 0.42) : random(game.height * 0.22, game.height - 110),
        vx: -random(240 + level * 18, 390 + level * 28),
        vy: random(-42, 42),
        turn: random(0.45, 2.1),
        phase: random(0, Math.PI * 2),
        drift: random(-26, 26),
        wave: random(18, 72),
        profile: Math.random() > 0.5 ? "agile" : "heavy",
        r: random(12, 17),
      });
    }

    function spawnBarrel(x, y) {
      game.barrels.push({
        x,
        y,
        vy: random(-55, -15),
        vx: random(-15, 20),
        r: 13,
        spin: random(-2, 2),
        a: random(0, Math.PI * 2),
      });
    }

    function spawnBullet() {
      const p = game.player;
      if (!p || !p.alive) return;
      if (game.fireTimer > 0) return;
      game.fireTimer = 0.5;
      game.bullets.push({ x: p.x + 46, y: p.y + 1, vx: 780, vy: 0, r: 6, life: 1.2, trail: 22 });
      game.particles.push(
        {
          x: p.x + 34,
          y: p.y + 2,
          vx: random(50, 95),
          vy: random(-16, 16),
          life: 0.12,
          maxLife: 0.12,
          size: random(1.5, 3),
          type: "spark",
        },
        {
          x: p.x + 36,
          y: p.y + 2,
          vx: random(20, 50),
          vy: random(-10, 10),
          life: 0.16,
          maxLife: 0.16,
          size: random(2, 4),
          type: "fire",
        }
      );
    }

    game.tryShoot = spawnBullet;

    function circleHit(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const r = a.r + b.r;
      return dx * dx + dy * dy <= r * r;
    }

    function playerHit() {
      if (!game.player?.alive) return;
      game.player.alive = false;
      emitExplosion(game.player.x + 16, game.player.y, 1.8);
      setStatus("gameover");
    }

    function update(dt) {
      if (statusRef.current !== "playing") return;
      const p = game.player;
      if (!p) return;

      const nextDistance = distanceRef.current + dt * 140;
      const nextDifficulty = 1 + Math.floor(nextDistance / 350);
      const nextScore = Math.floor(nextDistance + oilRef.current * 12 + shotsHitRef.current * 20);

      distanceRef.current = nextDistance;
      difficultyRef.current = nextDifficulty;
      scoreRef.current = nextScore;
      setDistance(nextDistance);
      setDifficulty(nextDifficulty);
      setScore(nextScore);

      game.cloudOffset += dt * 16;
      game.farOffset += dt * (30 + nextDifficulty * 1.2);
      game.nearOffset += dt * (85 + nextDifficulty * 2.8);
      game.shake *= 0.9;
      game.flash *= 0.9;
      game.fireTimer = Math.max(0, game.fireTimer - dt);

      const gravity = 900;
      const thrust = isTouchingRef.current || game.input ? -1800 : 0;
      p.vy += (gravity + thrust) * dt;
      p.vy = clamp(p.vy, -380, 380);
      p.y += p.vy * dt;
      p.fuelHeat = clamp(p.fuelHeat + ((isTouchingRef.current || game.input ? 1 : -1) * dt * 3.2), 0, 1);
      p.tilt = clamp((p.vy / 340) * 0.55, -0.45, 0.85);
      if (isTouchingRef.current || game.input) emitJetTrail(p.x - 30, p.y + 8);

      const ceiling = 54;
      const floor = game.height - 88;
      if (p.y < ceiling) {
        p.y = ceiling;
        p.vy = 40;
      }
      if (p.y > floor) playerHit();

      game.spawnTimer += dt;
      game.missileTimer -= dt;

      const rigGap = clamp(1.2 - nextDifficulty * 0.04, 0.55, 1.2);
      if (game.spawnTimer >= rigGap) {
        game.spawnTimer = 0;
        spawnRig();
      }

      if (game.missileTimer <= 0) {
        spawnMissile();
        game.missileTimer = clamp(1.45 - nextDifficulty * 0.06, 0.5, 1.45);
      }

      for (const rig of game.rigs) {
        rig.x -= (230 + nextDifficulty * 14) * dt;
        rig.bob += dt;
      }
      for (const missile of game.missiles) {
        missile.phase += dt * missile.turn;
        missile.x += missile.vx * dt;
        missile.y += missile.vy * dt + Math.sin(missile.phase) * missile.wave * dt + missile.drift * dt;
        missile.vy *= 0.996;
      }
      for (const barrel of game.barrels) {
        barrel.x -= (220 + nextDifficulty * 12) * dt - barrel.vx * dt;
        barrel.y += barrel.vy * dt;
        barrel.vy += 130 * dt;
        barrel.a += barrel.spin * dt;
      }
      for (const bullet of game.bullets) {
        bullet.x += bullet.vx * dt;
        bullet.life -= dt;
      }
      for (const part of game.particles) {
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.life -= dt;
        part.vx *= 0.985;
        part.vy *= 0.985;
      }

      game.rigs = game.rigs.filter((rig) => rig.x + rig.w > -60);
      game.missiles = game.missiles.filter((m) => m.x + 40 > -60 && m.y > -80 && m.y < game.height + 80);
      game.barrels = game.barrels.filter((b) => b.x + b.r > -40 && b.y < game.height + 40);
      game.bullets = game.bullets.filter((b) => b.life > 0 && b.x < game.width + 80);
      game.particles = game.particles.filter((p2) => p2.life > 0);

      for (let i = game.rigs.length - 1; i >= 0; i--) {
        const rig = game.rigs[i];
        const playerCircle = { x: p.x + 12, y: p.y + 6, r: 24 };
        const obstacleCircle = { x: rig.x + rig.w * 0.5, y: rig.y + rig.h * 0.46, r: Math.min(rig.w, rig.h) * 0.35 };
        if (circleHit(playerCircle, obstacleCircle)) {
          playerHit();
          break;
        }
        if (rig.x + rig.w < p.x && !rig.passed) {
          rig.passed = true;
          if (Math.random() > 0.1) spawnBarrel(rig.x + rig.w * 0.5, rig.y - 12);
          emitExplosion(rig.x + rig.w * 0.65, rig.y + rig.h * 0.25, 0.8);
        }
      }

      for (const missile of game.missiles) {
        const playerCircle = { x: p.x + 10, y: p.y + 6, r: 22 };
        if (circleHit(playerCircle, missile)) {
          playerHit();
          break;
        }
      }

      for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        let consumed = false;

        for (let j = game.missiles.length - 1; j >= 0; j--) {
          const missile = game.missiles[j];
          if (circleHit(bullet, missile)) {
            emitExplosion(missile.x, missile.y, 0.75);
            game.missiles.splice(j, 1);
            game.bullets.splice(i, 1);
            shotsHitRef.current += 1;
            setShotsHit(shotsHitRef.current);
            consumed = true;
            break;
          }
        }
        if (consumed) continue;

        for (let j = game.rigs.length - 1; j >= 0; j--) {
          const rig = game.rigs[j];
          const target = { x: rig.x + rig.w * 0.45, y: rig.y + rig.h * 0.35, r: Math.min(rig.w, rig.h) * 0.28 };
          if (circleHit(bullet, target)) {
            emitExplosion(target.x, target.y, 0.55);
            if (Math.random() > 0.15) spawnBarrel(rig.x + rig.w * 0.5, rig.y - 10);
            game.rigs.splice(j, 1);
            game.bullets.splice(i, 1);
            break;
          }
        }
      }

      for (let i = game.barrels.length - 1; i >= 0; i--) {
        const barrel = game.barrels[i];
        const playerCircle = { x: p.x + 6, y: p.y + 4, r: 26 };
        if (circleHit(playerCircle, barrel)) {
          game.barrels.splice(i, 1);
          oilRef.current += 1;
          cashRef.current += 100;
          setOil(oilRef.current);
          setCash(cashRef.current);
          for (let k = 0; k < 10; k++) {
            game.particles.push({
              x: barrel.x,
              y: barrel.y,
              vx: random(-110, 110),
              vy: random(-110, 110),
              life: random(0.25, 0.5),
              maxLife: 0.5,
              size: random(2, 5),
              type: "gold",
            });
          }
        }
      }
    }

    function drawBackground(ctx2) {
      const grad = ctx2.createLinearGradient(0, 0, 0, game.height);
      grad.addColorStop(0, palette.skyTop);
      grad.addColorStop(0.6, palette.skyBottom);
      grad.addColorStop(1, "#214c73");
      ctx2.fillStyle = grad;
      ctx2.fillRect(0, 0, game.width, game.height);

      for (const s of game.stars) {
        ctx2.globalAlpha = s.a;
        ctx2.fillStyle = palette.white;
        ctx2.beginPath();
        ctx2.arc(s.x, s.y, s.s, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;

      for (let i = 0; i < 5; i++) {
        const x = ((i * 260 - game.cloudOffset * (18 + i * 3)) % (game.width + 300)) - 140;
        const y = 80 + i * 55;
        drawCloud(ctx2, x, y, 0.9 + i * 0.14);
      }

      drawMountains(ctx2, game.farOffset, game.height - 142, 0.32, "rgba(8,18,34,0.55)");
      drawMountains(ctx2, game.nearOffset, game.height - 102, 0.48, "rgba(11,24,46,0.9)");

      ctx2.fillStyle = palette.groundDark;
      ctx2.fillRect(0, game.height - 56, game.width, 56);
      ctx2.fillStyle = palette.groundLight;
      for (let i = 0; i < game.width / 48 + 2; i++) {
        const x = ((i * 48 - game.nearOffset * 2.5) % (game.width + 48)) - 48;
        ctx2.fillRect(x, game.height - 56, 28, 56);
      }
    }

    function drawCloud(ctx2, x, y, scale) {
      ctx2.save();
      ctx2.translate(x, y);
      ctx2.scale(scale, scale);
      ctx2.fillStyle = palette.cloud;
      ctx2.beginPath();
      ctx2.arc(20, 24, 20, 0, Math.PI * 2);
      ctx2.arc(46, 18, 28, 0, Math.PI * 2);
      ctx2.arc(82, 24, 22, 0, Math.PI * 2);
      ctx2.arc(58, 34, 28, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.restore();
    }

    function drawMountains(ctx2, offset, baseY, amp, color) {
      ctx2.fillStyle = color;
      ctx2.beginPath();
      ctx2.moveTo(0, game.height);
      for (let x = -40; x <= game.width + 40; x += 80) {
        const waveX = x - (offset % 240);
        const peak = baseY - (Math.sin((x + offset) * 0.012) * 38 + Math.cos((x + offset) * 0.008) * 28) * amp * 4;
        ctx2.lineTo(waveX, peak + 52);
        ctx2.lineTo(waveX + 40, peak);
        ctx2.lineTo(waveX + 80, peak + 52);
      }
      ctx2.lineTo(game.width, game.height);
      ctx2.closePath();
      ctx2.fill();
    }

    function drawRig(ctx2, rig) {
      ctx2.save();
      ctx2.translate(rig.x, rig.y + Math.sin(rig.bob) * 1.4);
      ctx2.fillStyle = "rgba(0,0,0,0.22)";
      ctx2.fillRect(12, rig.h + 8, rig.w * 0.9, 10);
      ctx2.fillStyle = "#26384d";
      ctx2.fillRect(0, rig.h * 0.28, rig.w * 0.88, rig.h * 0.72);
      ctx2.fillStyle = "#394d63";
      ctx2.fillRect(rig.w * 0.08, 0, rig.w * 0.2, rig.h * 0.7);
      ctx2.fillRect(rig.w * 0.45, rig.h * 0.12, rig.w * 0.14, rig.h * 0.56);
      ctx2.restore();
    }

    function drawMissile(ctx2, missile) {
      ctx2.save();
      ctx2.translate(missile.x, missile.y);
      ctx2.rotate(Math.atan2(missile.vy + Math.sin(missile.phase) * missile.wave * 0.35, missile.vx));

      const len = missile.profile === "heavy" ? 40 : 34;
      const bodyGrad = ctx2.createLinearGradient(-len * 0.55, 0, len * 0.5, 0);
      bodyGrad.addColorStop(0, "#566171");
      bodyGrad.addColorStop(0.45, "#a7b3c0");
      bodyGrad.addColorStop(1, "#e3e8ee");
      ctx2.fillStyle = bodyGrad;
      ctx2.beginPath();
      ctx2.moveTo(len * 0.5, 0);
      ctx2.lineTo(len * 0.18, -7);
      ctx2.lineTo(-len * 0.2, -7);
      ctx2.lineTo(-len * 0.5, 0);
      ctx2.lineTo(-len * 0.2, 7);
      ctx2.lineTo(len * 0.18, 7);
      ctx2.closePath();
      ctx2.fill();

      ctx2.fillStyle = "#d84c3f";
      ctx2.beginPath();
      ctx2.moveTo(len * 0.5, 0);
      ctx2.lineTo(len * 0.16, -5.5);
      ctx2.lineTo(len * 0.16, 5.5);
      ctx2.closePath();
      ctx2.fill();

      ctx2.fillStyle = "#727f8f";
      ctx2.beginPath();
      ctx2.moveTo(-len * 0.12, -7);
      ctx2.lineTo(-len * 0.4, -14);
      ctx2.lineTo(-len * 0.22, -2);
      ctx2.closePath();
      ctx2.fill();
      ctx2.beginPath();
      ctx2.moveTo(-len * 0.12, 7);
      ctx2.lineTo(-len * 0.4, 14);
      ctx2.lineTo(-len * 0.22, 2);
      ctx2.closePath();
      ctx2.fill();

      const glow = ctx2.createLinearGradient(-len * 0.8, 0, -len * 0.28, 0);
      glow.addColorStop(0, "rgba(255,145,75,0)");
      glow.addColorStop(0.45, "rgba(255,145,75,0.85)");
      glow.addColorStop(1, "rgba(255,236,192,1)");
      ctx2.fillStyle = glow;
      ctx2.beginPath();
      ctx2.moveTo(-len * 0.28, -5);
      ctx2.quadraticCurveTo(-len * 0.8, 0, -len * 0.28, 5);
      ctx2.closePath();
      ctx2.fill();
      ctx2.restore();
    }

    function drawBullet(ctx2, bullet) {
      ctx2.save();
      ctx2.translate(bullet.x, bullet.y);

      const trailGrad = ctx2.createLinearGradient(-bullet.trail, 0, 10, 0);
      trailGrad.addColorStop(0, "rgba(255,183,77,0)");
      trailGrad.addColorStop(0.45, "rgba(255,183,77,0.55)");
      trailGrad.addColorStop(1, "rgba(255,241,210,0.95)");
      ctx2.fillStyle = trailGrad;
      ctx2.beginPath();
      ctx2.moveTo(-bullet.trail, -4);
      ctx2.lineTo(3, -2.5);
      ctx2.lineTo(8, 0);
      ctx2.lineTo(3, 2.5);
      ctx2.lineTo(-bullet.trail, 4);
      ctx2.closePath();
      ctx2.fill();

      const shotGrad = ctx2.createLinearGradient(-2, 0, 14, 0);
      shotGrad.addColorStop(0, "#ffd98a");
      shotGrad.addColorStop(0.65, "#fff4d6");
      shotGrad.addColorStop(1, "#ffffff");
      ctx2.fillStyle = shotGrad;
      ctx2.beginPath();
      ctx2.ellipse(2, 0, bullet.r, bullet.r * 0.72, 0, 0, Math.PI * 2);
      ctx2.fill();

      ctx2.fillStyle = "rgba(255,255,255,0.8)";
      ctx2.beginPath();
      ctx2.ellipse(6, 0, bullet.r * 0.45, bullet.r * 0.4, 0, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.restore();
    }

    function drawBarrel(ctx2, barrel) {
      ctx2.save();
      ctx2.translate(barrel.x, barrel.y);
      ctx2.rotate(barrel.a);
      ctx2.fillStyle = palette.oil;
      ctx2.fillRect(-11, -14, 22, 28);
      ctx2.fillStyle = palette.oilHighlight;
      ctx2.fillRect(-11, -10, 22, 4);
      ctx2.fillRect(-11, 6, 22, 4);
      ctx2.fillStyle = palette.gold;
      ctx2.fillRect(-7, -2, 14, 4);
      ctx2.restore();
    }

    function drawPlayer(ctx2) {
      const p = game.player;
      if (!p) return;
      ctx2.save();
      ctx2.translate(p.x, p.y);
      ctx2.rotate(p.tilt);

      ctx2.fillStyle = "rgba(0,0,0,0.2)";
      ctx2.beginPath();
      ctx2.ellipse(10, 36, 38, 10, 0, 0, Math.PI * 2);
      ctx2.fill();

      const fuselageGrad = ctx2.createLinearGradient(-42, 0, 42, 0);
      fuselageGrad.addColorStop(0, "#d9e1eb");
      fuselageGrad.addColorStop(0.45, "#f4f7fb");
      fuselageGrad.addColorStop(0.8, "#b6c3d3");
      fuselageGrad.addColorStop(1, "#8e9caf");
      ctx2.fillStyle = fuselageGrad;
      ctx2.beginPath();
      ctx2.moveTo(-34, 0);
      ctx2.quadraticCurveTo(-10, -22, 28, -10);
      ctx2.quadraticCurveTo(48, -2, 42, 5);
      ctx2.quadraticCurveTo(26, 16, -6, 16);
      ctx2.quadraticCurveTo(-24, 16, -34, 0);
      ctx2.closePath();
      ctx2.fill();

      ctx2.strokeStyle = "rgba(255,255,255,0.55)";
      ctx2.lineWidth = 1.3;
      ctx2.beginPath();
      ctx2.moveTo(-20, -5);
      ctx2.lineTo(28, -2);
      ctx2.stroke();

      ctx2.fillStyle = "#6f7f93";
      ctx2.beginPath();
      ctx2.moveTo(-2, -1);
      ctx2.lineTo(-44, -19);
      ctx2.lineTo(-10, -6);
      ctx2.closePath();
      ctx2.fill();
      ctx2.beginPath();
      ctx2.moveTo(0, 8);
      ctx2.lineTo(-30, 24);
      ctx2.lineTo(10, 13);
      ctx2.closePath();
      ctx2.fill();
      ctx2.beginPath();
      ctx2.moveTo(12, -5);
      ctx2.lineTo(40, -19);
      ctx2.lineTo(24, 0);
      ctx2.closePath();
      ctx2.fill();

      ctx2.fillStyle = "#44566e";
      ctx2.beginPath();
      ctx2.moveTo(-26, -2);
      ctx2.lineTo(-44, -8);
      ctx2.lineTo(-39, 2);
      ctx2.closePath();
      ctx2.fill();

      const canopyGrad = ctx2.createLinearGradient(-2, -16, 20, 8);
      canopyGrad.addColorStop(0, "rgba(20,48,78,0.95)");
      canopyGrad.addColorStop(1, "rgba(93,136,178,0.9)");
      ctx2.fillStyle = canopyGrad;
      ctx2.beginPath();
      ctx2.moveTo(-3, -8);
      ctx2.quadraticCurveTo(8, -19, 20, -8);
      ctx2.quadraticCurveTo(18, 2, 2, 3);
      ctx2.quadraticCurveTo(-5, -1, -3, -8);
      ctx2.closePath();
      ctx2.fill();

      ctx2.save();
      ctx2.beginPath();
      ctx2.moveTo(-2, -7);
      ctx2.quadraticCurveTo(8, -15, 18, -8);
      ctx2.quadraticCurveTo(16, 1, 2, 2);
      ctx2.quadraticCurveTo(-3, -1, -2, -7);
      ctx2.closePath();
      ctx2.clip();

      ctx2.fillStyle = "#203246";
      ctx2.fillRect(-4, -12, 26, 18);
      ctx2.fillStyle = "#efc3a1";
      ctx2.beginPath();
      ctx2.ellipse(7, -2, 6.5, 7.5, 0, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = "#d98b2b";
      ctx2.beginPath();
      ctx2.moveTo(-1, -5);
      ctx2.quadraticCurveTo(8, -13, 16, -4);
      ctx2.quadraticCurveTo(11, -1, 2, -1);
      ctx2.closePath();
      ctx2.fill();
      ctx2.fillStyle = "#111827";
      ctx2.fillRect(1, -3, 10, 2);
      ctx2.fillStyle = "#d63031";
      ctx2.fillRect(5, 4, 2, 7);
      ctx2.restore();

      ctx2.fillStyle = "#c23b32";
      ctx2.fillRect(14, -1, 7, 2);

      const flame = 14 + p.fuelHeat * 22;
      const flameGrad = ctx2.createLinearGradient(-62, 0, -24, 0);
      flameGrad.addColorStop(0, "rgba(255,115,59,0)");
      flameGrad.addColorStop(0.35, "rgba(255,115,59,0.8)");
      flameGrad.addColorStop(1, "rgba(255,240,200,0.95)");
      ctx2.fillStyle = flameGrad;
      ctx2.beginPath();
      ctx2.moveTo(-28, -4);
      ctx2.quadraticCurveTo(-52 - flame, 0, -28, 4);
      ctx2.closePath();
      ctx2.fill();

      ctx2.restore();
    }

    function drawParticles(ctx2) {
      for (const p of game.particles) {
        const t = Math.max(0, p.life / p.maxLife);
        ctx2.globalAlpha = t;
        if (p.type === "fire") ctx2.fillStyle = "#ff9347";
        else if (p.type === "smoke") ctx2.fillStyle = "rgba(60,68,77,0.8)";
        else if (p.type === "gold") ctx2.fillStyle = palette.gold;
        else if (p.type === "spark") ctx2.fillStyle = "#ffdca2";
        else ctx2.fillStyle = "rgba(206,232,255,0.75)";
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
    }

    function roundRect(ctx2, x, y, w, h, r) {
      ctx2.beginPath();
      ctx2.moveTo(x + r, y);
      ctx2.arcTo(x + w, y, x + w, y + h, r);
      ctx2.arcTo(x + w, y + h, x, y + h, r);
      ctx2.arcTo(x, y + h, x, y, r);
      ctx2.arcTo(x, y, x + w, y, r);
      ctx2.closePath();
    }

   function drawHUD(ctx2) {
  const compact = isMobileLandscape;
  const boxW = compact ? 92 : 128;
  const boxH = compact ? 42 : 62;
  const x1 = compact ? 12 : 18;
  const x2 = compact ? x1 + boxW + 8 : x1 + boxW + 12;
  const y = compact ? 10 : 18;

  function panel(x, title, value, accent) {
    ctx2.fillStyle = "rgba(6,12,20,0.45)";
    roundRect(ctx2, x, y, boxW, boxH, compact ? 14 : 18);
    ctx2.fill();

    ctx2.fillStyle = accent;
    ctx2.fillRect(x + (compact ? 8 : 14), y + (compact ? 8 : 14), compact ? 3 : 4, boxH - (compact ? 16 : 28));

    ctx2.fillStyle = "rgba(255,255,255,0.75)";
    ctx2.font = compact ? "10px Inter, system-ui, sans-serif" : "12px Inter, system-ui, sans-serif";
    ctx2.fillText(title, x + (compact ? 18 : 28), y + (compact ? 15 : 23));

    ctx2.fillStyle = palette.white;
    ctx2.font = compact ? "700 16px Inter, system-ui, sans-serif" : "700 24px Inter, system-ui, sans-serif";
    ctx2.fillText(String(value), x + (compact ? 18 : 28), y + (compact ? 33 : 48));
  }

  panel(x1, "SCORE", scoreRef.current, palette.gold);
  panel(x2, "OIL", oilRef.current, palette.teal);

  if (compact) {
    const row2Y = y + boxH + 8;

    ctx2.fillStyle = "rgba(6,12,20,0.45)";
    roundRect(ctx2, x1, row2Y, boxW, boxH, 14);
    ctx2.fill();
    ctx2.fillStyle = "rgba(255,255,255,0.75)";
    ctx2.font = "10px Inter, system-ui, sans-serif";
    ctx2.fillText("CASH", x1 + 18, row2Y + 15);
    ctx2.fillStyle = palette.gold;
    ctx2.font = "700 16px Inter, system-ui, sans-serif";
    ctx2.fillText(`$${cashRef.current}`, x1 + 18, row2Y + 33);

    ctx2.fillStyle = "rgba(6,12,20,0.45)";
    roundRect(ctx2, x2, row2Y, boxW, boxH, 14);
    ctx2.fill();
    ctx2.fillStyle = "rgba(255,255,255,0.75)";
    ctx2.font = "10px Inter, system-ui, sans-serif";
    ctx2.fillText("HITS", x2 + 18, row2Y + 15);
    ctx2.fillStyle = palette.teal;
    ctx2.font = "700 16px Inter, system-ui, sans-serif";
    ctx2.fillText(String(shotsHitRef.current), x2 + 18, row2Y + 33);

    const dangerW = 118;
    ctx2.fillStyle = "rgba(6,12,20,0.45)";
    roundRect(ctx2, game.width - dangerW - 12, y, dangerW, boxH, 14);
    ctx2.fill();
    ctx2.fillStyle = "rgba(255,255,255,0.75)";
    ctx2.font = "10px Inter, system-ui, sans-serif";
    ctx2.fillText("DANGER", game.width - dangerW, y + 15);
    ctx2.fillStyle = palette.red;
    ctx2.font = "700 16px Inter, system-ui, sans-serif";
    ctx2.fillText(String(difficultyRef.current), game.width - dangerW, y + 33);

    return;
  }

  ctx2.fillStyle = "rgba(6,12,20,0.52)";
  roundRect(ctx2, 18, 92, 128, 52, 18);
  ctx2.fill();
  ctx2.fillStyle = "rgba(255,255,255,0.7)";
  ctx2.font = "12px Inter, system-ui, sans-serif";
  ctx2.fillText("CASH", 46, 114);
  ctx2.fillStyle = palette.gold;
  ctx2.font = "700 22px Inter, system-ui, sans-serif";
  ctx2.fillText(`$${cashRef.current}`, 46, 132);

  ctx2.fillStyle = "rgba(6,12,20,0.52)";
  roundRect(ctx2, 158, 92, 128, 52, 18);
  ctx2.fill();
  ctx2.fillStyle = "rgba(255,255,255,0.7)";
  ctx2.font = "12px Inter, system-ui, sans-serif";
  ctx2.fillText("HITS", 186, 114);
  ctx2.fillStyle = palette.teal;
  ctx2.font = "700 22px Inter, system-ui, sans-serif";
  ctx2.fillText(String(shotsHitRef.current), 186, 132);

  ctx2.fillStyle = "rgba(6,12,20,0.52)";
  roundRect(ctx2, game.width - 176, 18, 158, 62, 18);
  ctx2.fill();
  ctx2.fillStyle = "rgba(255,255,255,0.7)";
  ctx2.font = "12px Inter, system-ui, sans-serif";
  ctx2.fillText("DANGER LEVEL", game.width - 158, 41);
  ctx2.fillStyle = palette.red;
  ctx2.font = "700 22px Inter, system-ui, sans-serif";
  ctx2.fillText(String(difficultyRef.current), game.width - 158, 66);
}
    function render() {
  const shakeX = (Math.random() - 0.5) * game.shake;
  const shakeY = (Math.random() - 0.5) * game.shake;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  ctx.scale(game.viewScale, game.viewScale);
  ctx.translate(shakeX, shakeY);

  drawBackground(ctx);
  for (const rig of game.rigs) drawRig(ctx, rig);
  for (const barrel of game.barrels) drawBarrel(ctx, barrel);
  for (const missile of game.missiles) drawMissile(ctx, missile);
  for (const bullet of game.bullets) drawBullet(ctx, bullet);
  drawPlayer(ctx);
  drawParticles(ctx);
  drawHUD(ctx);

  if (game.flash > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${game.flash})`;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  ctx.restore();
}

    function loop(ts) {
      if (!game.running) return;
      if (!game.lastTs) game.lastTs = ts;
      const dt = Math.min((ts - game.lastTs) / 1000, 1 / 30);
      game.lastTs = ts;
      update(dt);
      render();
      requestAnimationFrame(loop);
    }

    function onKeyDown(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        game.input = true;
      }
      if (e.code === "Enter") {
        e.preventDefault();
        if (statusRef.current === "playing") game.tryShoot?.();
      }
      if (e.key.toLowerCase() === "p") {
        setStatus((prev) => (prev === "playing" ? "paused" : prev === "paused" ? "playing" : prev));
      }
      if (e.key.toLowerCase() === "r") resetGame(true);
    }

    function onKeyUp(e) {
      if (e.code === "Space" || e.code === "ArrowUp") game.input = false;
    }

    resize();
    requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
  game.running = false;
  window.removeEventListener("resize", resize);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
};
}, [dpr, palette, isMobileLandscape]);

  useEffect(() => {
    if (status === "gameover") {
      setBest((prev) => {
        const next = Math.max(prev, score);
        localStorage.setItem("oil-sky-best", String(next));
        return next;
      });
    }
  }, [score, status]);

  const startRun = () => {
    const game = gameRef.current;
    if (!game) return;
    game.lastTs = 0;
    game.spawnTimer = 0;
    game.missileTimer = 1.1;
    game.fireTimer = 0;
    game.rigs = [];
    game.missiles = [];
    game.bullets = [];
    game.barrels = [];
    game.particles = [];
    game.player = {
      x: game.width * 0.24,
      y: game.height * 0.42,
      vy: 0,
      fuelHeat: 0,
      tilt: 0,
      alive: true,
    };
    scoreRef.current = 0;
    oilRef.current = 0;
    cashRef.current = 0;
    shotsHitRef.current = 0;
    distanceRef.current = 0;
    difficultyRef.current = 1;
    setScore(0);
    setOil(0);
    setCash(0);
    setShotsHit(0);
    setDistance(0);
    setDifficulty(1);
    setStatus("playing");
  };

  const restart = () => startRun();

  return (
  <div className="min-h-[100dvh] bg-slate-950 text-slate-50">
    <div
  key={`landscape-${layoutVersion}-${viewportSize.width}x${viewportSize.height}`}
  ref={wrapRef}
  className="relative w-full touch-none bg-slate-950"
  style={{ width: viewportSize.width, height: viewportSize.height }}
          <Card className="relative h-full w-full overflow-hidden bg-slate-950">
            <CardContent className="h-full p-0">
              <div
  key={`landscape-${layoutVersion}-${viewportSize.width}x${viewportSize.height}`}
  ref={wrapRef}
  className="relative w-full touch-none bg-slate-950"
  style={{ width: viewportSize.width, height: viewportSize.height }}
                onMouseDown={(e) => {
                  const rect = wrapRef.current?.getBoundingClientRect();
                  const x = rect ? e.clientX - rect.left : 0;
                  if (rect && x > rect.width * 0.58) {
                    const game = gameRef.current;
                    if (game?.player && statusRef.current === "playing") {
                      game.tryShoot?.();
                    }
                  } else {
                    setIsTouching(true);
                  }
                }}
                onMouseUp={() => setIsTouching(false)}
                onMouseLeave={() => setIsTouching(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const rect = wrapRef.current?.getBoundingClientRect();
                  const touch = e.touches?.[0];
                  const x = rect && touch ? touch.clientX - rect.left : 0;
                  if (rect && x > rect.width * 0.58) {
                    const game = gameRef.current;
                    if (game?.player && statusRef.current === "playing") {
                      game.tryShoot?.();
                    }
                  } else {
                    setIsTouching(true);
                  }
                }}
                onTouchEnd={() => setIsTouching(false)}
              >
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

                {status === "menu" && (
                  <Overlay
                    title="Oil Strike"
                    subtitle="Tippe Start."
                    buttonLabel="Start"
                    onClick={startRun}
                  />
                )}
                {status === "paused" && (
                  <Overlay
                    title="Pausiert"
                    subtitle="Tippe auf Weiter."
                    buttonLabel="Weiter"
                    onClick={() => setStatus("playing")}
                  />
                )}
                {status === "gameover" && (
                  <Overlay
                    title="Jet zerstört"
                    subtitle={`Score ${score} • Best ${Math.max(best, score)} • Öl ${oil} • $${cash}`}
                    buttonLabel="Nochmal"
                    onClick={restart}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : (
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 md:p-6 lg:grid lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/30 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">Prototype Build</Badge>
                  <h1 className="text-3xl font-black tracking-tight">Oil Strike</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Eine stabile spielbare Testversion mit realistischerem Jet, sichtbarem Piloten, manueller Schusskontrolle und sauberer Vorschau.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat icon={Trophy} label="Best" value={best} />
                <Stat icon={Zap} label="Danger" value={difficulty} />
                <Stat icon={Fuel} label="Oil" value={oil} />
                <Stat icon={Coins} label="Cash" value={`$${cash}`} />
                <Stat icon={Crosshair} label="Hits" value={shotsHit} />
                <Stat icon={Smartphone} label="Mode" value="Touch" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {status !== "playing" ? (
                  <Button onClick={startRun} className="rounded-2xl bg-amber-500 px-5 py-2 text-slate-950 hover:bg-amber-400">
                    <span className="inline-flex items-center gap-2"><Play className="h-4 w-4" /> Start Testversion</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStatus("paused")}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2 text-slate-100 hover:bg-slate-700"
                  >
                    Pause
                  </Button>
                )}
                <Button
                  onClick={restart}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2 text-slate-100 hover:bg-slate-700"
                >
                  <span className="inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Neustart</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
            <CardContent className="p-6 text-sm leading-6 text-slate-300">
              <h2 className="mb-3 text-lg font-bold text-slate-100">Controls</h2>
              <p>Linke Seite halten = steigen</p>
              <p>Rechte Seite tippen oder klicken = schießen</p>
              <p>Schuss-Cooldown = 0.5 Sekunden</p>
              <p>Space / Pfeil hoch = steigen</p>
              <p>Enter = schießen</p>
              <p>P = Pause</p>
              <p>R = Neustart</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-h-[720px] items-stretch">
          <Card className="relative w-full overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40">
            <CardContent className="h-full p-0">
              <div
                ref={wrapRef}
                className="relative h-[72vh] min-h-[720px] w-full touch-none bg-slate-950"
                onMouseDown={(e) => {
                  const rect = wrapRef.current?.getBoundingClientRect();
                  const x = rect ? e.clientX - rect.left : 0;
                  if (rect && x > rect.width * 0.58) {
                    const game = gameRef.current;
                    if (game?.player && statusRef.current === "playing") {
                      game.tryShoot?.();
                    }
                  } else {
                    setIsTouching(true);
                  }
                }}
                onMouseUp={() => setIsTouching(false)}
                onMouseLeave={() => setIsTouching(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const rect = wrapRef.current?.getBoundingClientRect();
                  const touch = e.touches?.[0];
                  const x = rect && touch ? touch.clientX - rect.left : 0;
                  if (rect && x > rect.width * 0.58) {
                    const game = gameRef.current;
                    if (game?.player && statusRef.current === "playing") {
                      game.tryShoot?.();
                    }
                  } else {
                    setIsTouching(true);
                  }
                }}
                onTouchEnd={() => setIsTouching(false)}
              >
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

                {status === "menu" && (
                  <Overlay
                    title="Oil Strike"
                    subtitle="Links halten zum Fliegen, rechts tippen oder klicken zum Schießen. Cooldown: 0.5 Sekunden."
                    buttonLabel="Run starten"
                    onClick={startRun}
                  />
                )}
                {status === "paused" && (
                  <Overlay
                    title="Pausiert"
                    subtitle="Dein Run ist eingefroren. Weiter geht's mit einem Klick."
                    buttonLabel="Weiter"
                    onClick={() => setStatus("playing")}
                  />
                )}
                {status === "gameover" && (
                  <Overlay
                    title="Jet zerstört"
                    subtitle={`Score ${score} • Best ${Math.max(best, score)} • Öl ${oil} • $${cash}`}
                    buttonLabel="Nochmal spielen"
                    onClick={restart}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )}
  </div>
);
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight text-slate-50">{value}</div>
    </div>
  );
}

function Overlay({ title, subtitle, buttonLabel, onClick }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950/75 p-6 text-center shadow-2xl shadow-black/40 md:p-8">
        <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>
        <Button onClick={onClick} className="mt-6 rounded-2xl bg-amber-500 px-6 py-2 text-slate-950 hover:bg-amber-400">
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
