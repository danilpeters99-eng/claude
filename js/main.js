/* ─────────────────────────────────────────────────────────
   Glasfaser · Lichtgeschwindigkeit
   3D-Szene (three.js) + Scroll-Choreografie (GSAP) + Interaktion
   ───────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ═══════════════ 1 · GLOSSAR ═══════════════ */
  var GLOSSAR = [
    ["LWL", "Lichtwellenleiter – der Fachbegriff für das Glasfaserkabel: ein Leiter, in dem Licht statt Strom das Signal trägt."],
    ["FTTH", "Fiber to the Home – die Glasfaser endet in der Wohnung bzw. im Büro. Volle Leistung, kein Kupfer auf der letzten Meile."],
    ["FTTB / FTTC", "Fiber to the Building / to the Curb – das Glas endet im Keller bzw. am Kabelverzweiger; der Rest läuft über Kupfer (Ethernet, VDSL)."],
    ["ONT", "Optical Network Termination – das Glasfaser-Modem beim Kunden. Wandelt elektrische Signale in Licht und zurück."],
    ["OLT", "Optical Line Termination – die Gegenstelle im PoP des Anbieters, an der viele hundert ONTs zusammenlaufen."],
    ["PON", "Passive Optical Network – eine Faser wird mit stromlosen Splittern auf 32–128 Teilnehmer aufgeteilt. Standard beim FTTH-Massenausbau."],
    ["P2P / AON", "Punkt-zu-Punkt bzw. Active Optical Network – jeder Kunde bekommt eine eigene Faser mit garantierter Bandbreite. Typisch für Standleitungen."],
    ["Splitter", "Passiver Glaskörper, der ein optisches Signal auf mehrere Fasern aufteilt – ohne Strom und ohne Elektronik."],
    ["Gf-AP / APL", "Glasfaser-Abschlusspunkt bzw. Abschlusspunkt Linientechnik – die Übergabedose im Keller, an der das Netz des Anbieters endet."],
    ["Singlemode", "Faser mit 9 µm Kern: Es passt nur ein Lichtweg hinein, dadurch keine Modendispersion und Reichweiten bis 80 km. Standard für FTTH."],
    ["Multimode", "Faser mit 50 µm Kern: viele Lichtwege gleichzeitig, billigere Sender, aber nur bis ca. 550 m. Typisch für Gebäudeverkabelung."],
    ["Totalreflexion", "Trifft Licht flach genug auf die Grenze zwischen dichterem Kern und dünnerem Mantel, wird es vollständig zurückgeworfen – so bleibt es im Kern."],
    ["Brechzahl (n)", "Maß dafür, wie stark ein Material Licht bremst. Kern n ≈ 1,48, Mantel n ≈ 1,46 – dieser kleine Unterschied genügt für die Totalreflexion."],
    ["Dämpfung", "Signalverlust in dB pro km. Glasfaser: ca. 0,2 dB/km bei 1550 nm – nach 10 km sind noch rund 63 % der Leistung übrig."],
    ["nm / Wellenlänge", "Nanometer, das „Farbmaß“ des Lichts. 1310 nm und 1550 nm sind Infrarot – unsichtbar, aber besonders verlustarm im Glas."],
    ["DWDM", "Dense Wavelength Division Multiplexing – bis zu 96 Wellenlängen („Farben“) teilen sich eine Faser, jede mit eigener Datenrate."],
    ["TDMA", "Time Division Multiple Access – im PON-Upstream bekommt jedes ONT feste Zeitschlitze zugewiesen, damit sich die Signale nicht überlagern."],
    ["NRZ / OOK", "On-Off-Keying: Licht an = 1, Licht aus = 0. Das einfachste optische Modulationsverfahren, genutzt bis 10 Gbit/s."],
    ["PAM4", "Vier Helligkeitsstufen statt zwei – pro Symbol werden 2 Bit übertragen, die Datenrate verdoppelt sich bei gleicher Symbolrate."],
    ["XGS-PON", "PON-Generation mit symmetrisch 10 Gbit/s. Löst GPON (2,5/1,25 Gbit/s) beim Ausbau schrittweise ab."],
    ["Symmetrisch", "Upload genauso schnell wie Download – der große Vorteil gegenüber DSL und Kabel, wichtig für Backups und Videokonferenzen."],
    ["Latenz", "Signallaufzeit. Im Glas ca. 5 µs pro Kilometer; ein FTTH-Anschluss liegt bei 1–5 ms, Satellit (GEO) dagegen bei 600 ms."],
    ["Spleißen", "Dauerhaftes Verschweißen zweier Fasern mit einem Lichtbogen. Verlust unter 0,1 dB, braucht ein Spleißgerät und saubere Schnitte."],
    ["Homes Passed", "Adressen, an denen Glasfaser bis vor die Tür liegt – noch ohne Vertrag. Die Kennzahl für den Ausbaustand."],
    ["Take-up-Rate", "Anteil der erschlossenen Haushalte, die tatsächlich einen Glasfaservertrag gebucht haben. In Deutschland rund 27 %."],
    ["BKZ", "Baukostenzuschuss – einmalige Beteiligung an den Tiefbaukosten, wenn ein Anschluss außerhalb der regulären Ausbauphase gelegt wird."]
  ];

  var glossaryEl = document.getElementById("glossary");
  if (glossaryEl) {
    GLOSSAR.forEach(function (g) {
      var d = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = g[0];
      var dd = document.createElement("dd"); dd.textContent = g[1];
      d.appendChild(dt); d.appendChild(dd); glossaryEl.appendChild(d);
    });
  }

  var POP = {
    ftth: 1, ont: 3, olt: 4, pon: 5, dwdm: 15, totalreflexion: 11, gfap: 8
  };
  var pop = document.getElementById("gpop");
  var popTitle = document.getElementById("gpopTitle");
  var popText = document.getElementById("gpopText");
  var popOpener = null;

  function showPop(btn) {
    var idx = POP[btn.dataset.g];
    if (idx === undefined) return;
    popTitle.textContent = GLOSSAR[idx][0];
    popText.textContent = GLOSSAR[idx][1];
    pop.hidden = false;
    var r = btn.getBoundingClientRect();
    var w = Math.min(320, window.innerWidth - 32);
    pop.style.width = w + "px";
    var left = clamp(r.left, 16, window.innerWidth - w - 16);
    var top = r.bottom + 10;
    if (top + pop.offsetHeight > window.innerHeight - 16) top = Math.max(16, r.top - pop.offsetHeight - 10);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    popOpener = btn;
  }
  function hidePop() { pop.hidden = true; popOpener = null; }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".gl");
    if (btn) { e.preventDefault(); (popOpener === btn) ? hidePop() : showPop(btn); return; }
    if (!e.target.closest("#gpop")) hidePop();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hidePop(); });
  window.addEventListener("scroll", function () { if (popOpener) hidePop(); }, { passive: true });

  /* ═══════════════ 2 · 3D-SZENE ═══════════════ */
  var view = {
    camZ: 7, camY: 0, rotZ: -0.38, rotY: 0, posX: 0, posY: 0,
    peel: 0, glow: 1, spin: 0.0016, visible: 1
  };
  var target = Object.assign({}, view);
  var scene3d = null;

  function build3D() {
    var canvas = document.getElementById("fiber3d");
    if (!canvas || typeof THREE === "undefined") return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050814, 0.035);

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    scene.add(new THREE.AmbientLight(0x4a6ba8, 0.55));
    var key = new THREE.PointLight(0x2ee6ff, 90, 60); key.position.set(-6, 5, 8); scene.add(key);
    var rim = new THREE.PointLight(0xff4fb0, 70, 60); rim.position.set(7, -4, 5); scene.add(rim);
    var warm = new THREE.PointLight(0xffb43c, 40, 50); warm.position.set(0, 6, -6); scene.add(warm);

    var group = new THREE.Group();
    scene.add(group);

    var LEN = 46;
    var SHELLS = [
      { r: 0.30, color: 0x2ee6ff, emissive: 0x2ee6ff, ei: 1.5, op: 1.00, rough: 0.15 }, // Kern
      { r: 0.62, color: 0xbfefff, emissive: 0x6fd8ff, ei: 0.35, op: 0.34, rough: 0.05 }, // Cladding
      { r: 0.86, color: 0x8aa4ff, emissive: 0x3b4fa8, ei: 0.22, op: 0.30, rough: 0.25 }, // Coating
      { r: 1.12, color: 0xff4fb0, emissive: 0x7a1e52, ei: 0.25, op: 0.34, rough: 0.45 }, // Buffer
      { r: 1.45, color: 0xffb43c, emissive: 0x6d4410, ei: 0.18, op: 0.30, rough: 0.6 }   // Mantel
    ];
    var shells = SHELLS.map(function (s, i) {
      var geo = new THREE.CylinderGeometry(s.r, s.r, LEN, i === 0 ? 40 : 56, 1, true);
      var mat = new THREE.MeshStandardMaterial({
        color: s.color, emissive: s.emissive, emissiveIntensity: s.ei,
        roughness: s.rough, metalness: 0.15, transparent: true, opacity: s.op,
        side: THREE.DoubleSide, depthWrite: i === 0
      });
      var m = new THREE.Mesh(geo, mat);
      m.rotation.z = Math.PI / 2;
      m.userData = { baseOp: s.op, baseR: s.r, i: i, baseEi: s.ei };
      group.add(m);
      return m;
    });

    // Lichtpulse im Kern
    var pulseGeo = new THREE.SphereGeometry(0.22, 14, 14);
    var pulses = [];
    for (var p = 0; p < 16; p++) {
      var mat = new THREE.MeshBasicMaterial({
        color: p % 3 === 0 ? 0xffffff : (p % 3 === 1 ? 0x9df3ff : 0xffd0ec),
        transparent: true, opacity: 0.95
      });
      var mesh = new THREE.Mesh(pulseGeo, mat);
      mesh.userData = { t: p / 16, speed: 0.11 + Math.random() * 0.06 };
      group.add(mesh);
      pulses.push(mesh);
    }

    // Staubpartikel für Tiefe
    var starGeo = new THREE.BufferGeometry();
    var N = 900, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0x8fb6ff, size: 0.075, transparent: true, opacity: 0.5, sizeAttenuation: true
    }));
    scene.add(stars);

    var mouse = { x: 0, y: 0 };
    window.addEventListener("pointermove", function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      var e = 1 - Math.pow(0.001, dt); // zeitunabhängiges Lerp

      view.camZ = lerp(view.camZ, target.camZ, e);
      view.camY = lerp(view.camY, target.camY, e);
      view.rotZ = lerp(view.rotZ, target.rotZ, e);
      view.posX = lerp(view.posX, target.posX, e);
      view.posY = lerp(view.posY, target.posY, e);
      view.peel = lerp(view.peel, target.peel, e);
      view.glow = lerp(view.glow, target.glow, e);
      view.visible = lerp(view.visible, target.visible, e);

      camera.position.z = view.camZ;
      camera.position.y = view.camY + mouse.y * -0.35;
      camera.position.x = mouse.x * 0.5;
      camera.lookAt(0, view.camY * 0.4, 0);

      group.rotation.z = view.rotZ;
      group.rotation.x = mouse.y * 0.12;
      if (!reduced) group.rotation.y += target.spin;
      group.position.x = view.posX;
      group.position.y = view.posY;

      // Schichten abisolieren: peel 0..4 = wie viele äußere Schichten offen sind
      shells.forEach(function (m, i) {
        var open = clamp(view.peel - (4 - i), 0, 1);       // 1 = vollständig geöffnet
        var d = m.userData;
        m.material.opacity = d.baseOp * (1 - open) * view.visible;
        m.material.emissiveIntensity = d.baseEi * view.glow;
        var s = 1 + open * 2.6;
        m.scale.set(s, 1, s);
        m.visible = m.material.opacity > 0.008;
      });
      shells[0].material.opacity = view.visible;
      shells[0].visible = view.visible > 0.02;

      var t = clock.getElapsedTime();
      pulses.forEach(function (m, i) {
        var d = m.userData;
        d.t = (d.t + dt * d.speed) % 1;
        m.position.x = (d.t - 0.5) * LEN;
        var wob = Math.sin(t * 2 + i) * 0.05;
        m.position.y = wob; m.position.z = Math.cos(t * 1.7 + i) * 0.05;
        var sc = 0.7 + Math.sin(t * 6 + i) * 0.18;
        m.scale.setScalar(sc * (0.6 + view.glow * 0.5));
        m.material.opacity = 0.95 * view.visible;
        m.visible = view.visible > 0.05;
      });

      stars.rotation.y += 0.0004;
      stars.material.opacity = 0.16 + view.visible * 0.34;

      renderer.render(scene, camera);
    }
    frame();
    return { renderer: renderer, camera: camera, group: group };
  }
  scene3d = build3D();

  /* ═══════════════ 3 · SCROLL-CHOREOGRAFIE ═══════════════ */
  var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  function setView(o) { Object.assign(target, o); }

  var SCENES = {
    hero:           { camZ: 8.5, camY: 0,    rotZ: -0.38, posX: 0,    posY: 0,    peel: 0, glow: 1,   spin: 0.0016, visible: 1 },
    strecke:        { camZ: 16,  camY: 0,    rotZ: -0.06, posX: 0,    posY: -4.6, peel: 0, glow: 0.7, spin: 0.0008, visible: 0.45 },
    medium:         { camZ: 5.2, camY: 0,    rotZ: -0.12, posX: 3.0,  posY: 0,    peel: 0, glow: 1.3, spin: 0.0022, visible: 1 },
    varianten:      { camZ: 13,  camY: 0,    rotZ: 0.42,  posX: 2.5,  posY: 1.5,  peel: 0, glow: 0.5, spin: 0.001,  visible: 0.4 },
    technik:        { camZ: 9,   camY: 0,    rotZ: -0.55, posX: -3,   posY: -1,   peel: 2, glow: 0.8, spin: 0.0018, visible: 0.45 },
    zahlen:         { camZ: 17,  camY: 0,    rotZ: 0.2,   posX: 0,    posY: 2.8,  peel: 0, glow: 0.45, spin: 0.0009, visible: 0.3 },
    rechner:        { camZ: 12,  camY: 0,    rotZ: -0.25, posX: 0,    posY: -2.6, peel: 0, glow: 0.6, spin: 0.0026, visible: 0.35 },
    verfuegbarkeit: { camZ: 20,  camY: 0,    rotZ: 0.6,   posX: -2,   posY: 2,    peel: 0, glow: 0.4, spin: 0.0007, visible: 0.28 },
    kosten:         { camZ: 15,  camY: 0,    rotZ: -0.7,  posX: 2.8,  posY: -1.5, peel: 0, glow: 0.4, spin: 0.001,  visible: 0.25 },
    quiz:           { camZ: 8,   camY: 0,    rotZ: 0.9,   posX: 0,    posY: 3.2,  peel: 3, glow: 0.9, spin: 0.003,  visible: 0.35 },
    glossar:        { camZ: 22,  camY: 0,    rotZ: 0.1,   posX: 0,    posY: -3,   peel: 0, glow: 0.35, spin: 0.0006, visible: 0.22 },
    quellen:        { camZ: 26,  camY: 0,    rotZ: 0.3,   posX: 0,    posY: -4,   peel: 0, glow: 0.3, spin: 0.0005, visible: 0.18 }
  };

  var sections = Array.prototype.slice.call(document.querySelectorAll(".sec"));
  var dotLinks = Array.prototype.slice.call(document.querySelectorAll(".dots a"));

  function activateDot(id) {
    dotLinks.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("href") === "#" + id); });
  }

  sections.forEach(function (sec) {
    var id = sec.id;
    if (hasGSAP) {
      ScrollTrigger.create({
        trigger: sec, start: "top 55%", end: "bottom 45%",
        onEnter: function () { if (SCENES[id]) setView(SCENES[id]); activateDot(id); },
        onEnterBack: function () { if (SCENES[id]) setView(SCENES[id]); activateDot(id); }
      });
    }
  });
  activateDot("hero");

  if (hasGSAP && !reduced) {
    gsap.from(".hero-title .line", { y: 120, opacity: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" });
    gsap.from(".hero-sub, .hero-stats > div, .scroll-cue", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.5, ease: "power3.out" });

    document.querySelectorAll(".sec:not(.hero) .sec-head, .card, .vcard, .mcard, .counter, .crow").forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 30, opacity: 0, duration: 0.7, ease: "power3.out"
      });
    });
  }

  /* ── 3a · Pin: Übertragungsstrecke ── */
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".strecke-svg .node"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".strecke-steps li"));
  var lightPath = document.getElementById("pathLight");
  var pulseDot = document.querySelector(".strecke-svg .path-pulse");
  var pathLen = lightPath ? lightPath.getTotalLength() : 0;

  function setStrecke(prog) {
    var p = clamp(prog, 0, 1);
    if (lightPath) {
      lightPath.style.strokeDasharray = pathLen;
      lightPath.style.strokeDashoffset = pathLen * (1 - p);
    }
    if (pulseDot && pathLen) {
      var pt = lightPath.getPointAtLength(pathLen * p);
      pulseDot.setAttribute("cx", pt.x); pulseDot.setAttribute("cy", pt.y);
      pulseDot.style.opacity = p > 0.01 && p < 0.99 ? 1 : 0;
    }
    var active = Math.min(nodes.length - 1, Math.floor(p * nodes.length * 0.999));
    nodes.forEach(function (n, i) {
      n.classList.toggle("is-on", i === active);
      n.classList.toggle("is-done", i < active);
    });
    steps.forEach(function (s, i) { s.classList.toggle("is-on", i === active); });
  }
  setStrecke(0.04);

  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: "#strecke", start: "top top", end: "+=" + (window.innerHeight * 2.4),
      pin: "#strecke .pin-wrap", pinSpacing: true, scrub: reduced ? false : 0.6,
      onUpdate: function (self) { setStrecke(self.progress); },
      onEnter: function () { setView(SCENES.strecke); activateDot("strecke"); },
      onEnterBack: function () { setView(SCENES.strecke); activateDot("strecke"); }
    });
  }

  /* ── 3b · Pin: Medium / Schichten ── */
  var layerItems = Array.prototype.slice.call(document.querySelectorAll(".layers li"));
  var activeLayer = 4;

  /* Querschnitt (2D-Canvas) */
  var cross = document.getElementById("crossCut");
  var crossCtx = cross ? cross.getContext("2d") : null;
  var CROSS = [
    { r: 0.16, c: "#2EE6FF", name: "Kern", size: "9 µm" },
    { r: 0.34, c: "#BFEFFF", name: "Mantel", size: "125 µm" },
    { r: 0.52, c: "#8AA4FF", name: "Coating", size: "250 µm" },
    { r: 0.74, c: "#FF4FB0", name: "Buffer", size: "900 µm" },
    { r: 1.00, c: "#FFB43C", name: "Außenmantel", size: "2–3 mm" }
  ];
  var crossOpen = [0, 0, 0, 0, 0]; // 0 = geschlossen, 1 = abgezogen

  function drawCross(t) {
    if (!crossCtx) return;
    var W = cross.width, H = cross.height;
    var cx = W / 2, cy = H / 2 - 6, R = Math.min(W, H) * 0.40;
    crossCtx.clearRect(0, 0, W, H);

    for (var i = CROSS.length - 1; i >= 0; i--) {
      var L = CROSS[i], open = crossOpen[i];
      var rad = R * L.r * (1 + open * 1.5);
      var alpha = (1 - open) * (i === activeLayer ? 1 : 0.55);
      if (alpha <= 0.02) continue;

      crossCtx.globalAlpha = alpha * 0.16;
      crossCtx.fillStyle = L.c;
      crossCtx.beginPath(); crossCtx.arc(cx, cy, rad, 0, 6.2832); crossCtx.fill();

      crossCtx.globalAlpha = alpha;
      crossCtx.strokeStyle = L.c;
      crossCtx.lineWidth = i === activeLayer ? 3 : 1.4;
      crossCtx.shadowColor = L.c;
      crossCtx.shadowBlur = i === activeLayer ? 22 : 6;
      crossCtx.beginPath(); crossCtx.arc(cx, cy, rad, 0, 6.2832); crossCtx.stroke();
      crossCtx.shadowBlur = 0;
    }
    crossCtx.globalAlpha = 1;

    // Lichtpunkt im Kern
    var pulse = 0.72 + Math.sin(t / 380) * 0.28;
    var core = R * CROSS[0].r * 0.8;
    var g = crossCtx.createRadialGradient(cx, cy, 0, cx, cy, core * 2.2);
    g.addColorStop(0, "rgba(255,255,255," + (0.85 * pulse).toFixed(3) + ")");
    g.addColorStop(0.4, "rgba(46,230,255," + (0.5 * pulse).toFixed(3) + ")");
    g.addColorStop(1, "rgba(46,230,255,0)");
    crossCtx.fillStyle = g;
    crossCtx.beginPath(); crossCtx.arc(cx, cy, core * 2.2, 0, 6.2832); crossCtx.fill();

    // Beschriftung der aktiven Schicht
    var A = CROSS[activeLayer];
    var radA = R * A.r;
    crossCtx.strokeStyle = "rgba(146,168,214,.5)";
    crossCtx.lineWidth = 1;
    crossCtx.setLineDash([4, 4]);
    crossCtx.beginPath();
    crossCtx.moveTo(cx + radA * 0.7, cy - radA * 0.7);
    crossCtx.lineTo(cx + R * 1.12, cy - R * 0.96);
    crossCtx.stroke();
    crossCtx.setLineDash([]);
    crossCtx.fillStyle = A.c;
    crossCtx.font = "600 16px 'Figtree', sans-serif";
    crossCtx.textAlign = "right";
    crossCtx.fillText(A.name, W - 14, H * 0.14);
    crossCtx.fillStyle = "#97A3BF";
    crossCtx.font = "13px 'JetBrains Mono', monospace";
    crossCtx.fillText(A.size, W - 14, H * 0.14 + 20);
    crossCtx.textAlign = "left";
  }

  if (crossCtx) {
    (function loop(t) {
      for (var i = 0; i < 5; i++) {
        var goal = i > activeLayer ? 1 : 0;
        crossOpen[i] = lerp(crossOpen[i], goal, 0.12);
      }
      drawCross(t);
      requestAnimationFrame(loop);
    })(0);
  }

  function setLayer(l) {
    activeLayer = clamp(Math.round(l), 0, 4);
    layerItems.forEach(function (li) {
      li.classList.toggle("is-on", +li.dataset.layer === activeLayer);
    });
    target.peel = 4 - activeLayer;
  }
  setLayer(4);

  layerItems.forEach(function (li) {
    li.addEventListener("click", function () { setLayer(+li.dataset.layer); });
    li.setAttribute("tabindex", "0");
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLayer(+li.dataset.layer); }
    });
  });

  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: "#medium", start: "top top", end: "+=" + (window.innerHeight * 2.2),
      pin: "#medium .pin-wrap", pinSpacing: true, scrub: reduced ? false : 0.5,
      onUpdate: function (self) { setLayer(4 - self.progress * 4.49); },
      onEnter: function () { setView(SCENES.medium); activateDot("medium"); },
      onEnterBack: function () { setView(SCENES.medium); activateDot("medium"); }
    });
  }

  /* Singlemode / Multimode */
  document.querySelectorAll(".tcard").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".tcard").forEach(function (x) { x.classList.remove("is-on"); });
      b.classList.add("is-on");
      target.spin = b.dataset.mode === "mm" ? 0.006 : 0.0022;
      target.glow = b.dataset.mode === "mm" ? 1.7 : 1.3;
    });
  });

  /* ═══════════════ 4 · FTTx ═══════════════ */
  var fiberPart = document.getElementById("fiberPart");
  document.querySelectorAll(".vcard").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".vcard").forEach(function (x) { x.classList.remove("is-on"); });
      b.classList.add("is-on");
      if (fiberPart) fiberPart.style.width = (+b.dataset.f * 100) + "%";
    });
  });

  /* ═══════════════ 5 · TOTALREFLEXION ═══════════════ */
  var tir = document.getElementById("tirCanvas");
  if (tir) {
    var ctx = tir.getContext("2d");
    var slider = document.getElementById("tirAngle");
    var out = document.getElementById("tirOut");
    var msg = document.getElementById("tirMsg");
    var W = tir.width, H = tir.height;
    var coreTop = 80, coreBot = 180;
    var CRIT = 9.4; // Grenzwinkel zur Faserachse bei n1=1.48 / n2=1.46

    function drawTIR() {
      var ang = +slider.value;
      out.textContent = ang.toFixed(1).replace(".", ",") + "°";
      var guided = ang <= CRIT;

      ctx.clearRect(0, 0, W, H);
      // Mantel
      ctx.fillStyle = "#101a3a"; ctx.fillRect(0, 20, W, H - 40);
      // Kern
      var g = ctx.createLinearGradient(0, coreTop, 0, coreBot);
      g.addColorStop(0, "#123055"); g.addColorStop(0.5, "#0d2246"); g.addColorStop(1, "#123055");
      ctx.fillStyle = g; ctx.fillRect(0, coreTop, W, coreBot - coreTop);
      ctx.strokeStyle = "rgba(191,239,255,.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, coreTop); ctx.lineTo(W, coreTop);
      ctx.moveTo(0, coreBot); ctx.lineTo(W, coreBot); ctx.stroke();

      ctx.fillStyle = "#97A3BF"; ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText("Mantel  n₂ = 1,46", 10, 44);
      ctx.fillText("Kern  n₁ = 1,48", 10, coreTop + 20);

      // Strahl
      var x = 0, y = coreBot - 8, dir = -1;
      var slope = Math.tan(ang * Math.PI / 180) * 6; // Darstellung 6-fach überhöht
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.strokeStyle = guided ? "#2EE6FF" : "#FF7A59";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = guided ? "#2EE6FF" : "#FF7A59"; ctx.shadowBlur = 12;

      var bounces = 0, escaped = false;
      while (x < W && bounces < 40) {
        var limit = dir < 0 ? coreTop : coreBot;
        var dx = Math.abs(limit - y) / (slope || 0.0001);
        var nx = x + dx;
        if (nx > W) { ctx.lineTo(W, y + dir * (W - x) * slope); break; }
        ctx.lineTo(nx, limit);
        if (!guided) {
          // Austritt in den Mantel: Strahl bricht weg
          var ex = nx + 70, ey = limit + dir * 60;
          ctx.lineTo(ex, ey);
          escaped = true; break;
        }
        x = nx; y = limit; dir *= -1; bounces++;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      msg.textContent = guided
        ? "Winkel " + ang.toFixed(1).replace(".", ",") + "° ≤ Grenzwinkel 9,4° → Totalreflexion, das Licht bleibt im Kern. " + bounces + " Reflexionen im gezeigten Ausschnitt (Winkel stark überhöht dargestellt)."
        : "Winkel " + ang.toFixed(1).replace(".", ",") + "° > Grenzwinkel 9,4° → das Licht tritt in den Mantel aus und geht verloren.";
      msg.style.color = guided ? "" : "#FF7A59";
      if (escaped) { /* nur zur Klarheit */ }
    }
    slider.addEventListener("input", drawTIR);
    drawTIR();
  }

  /* ═══════════════ 6 · MODULATIONS-WELLEN ═══════════════ */
  document.querySelectorAll(".wave").forEach(function (cv) {
    var c = cv.getContext("2d"), w = cv.width, h = cv.height, kind = cv.dataset.wave;
    var CY = "#2EE6FF", MG = "#FF4FB0", AM = "#FFB43C";
    c.clearRect(0, 0, w, h);
    c.lineWidth = 2.2; c.lineJoin = "round";

    function baseline() {
      c.strokeStyle = "rgba(146,168,214,.18)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, h - 12); c.lineTo(w, h - 12); c.stroke(); c.lineWidth = 2.2;
    }

    if (kind === "nrz") {
      baseline();
      var bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0];
      c.strokeStyle = CY; c.beginPath();
      bits.forEach(function (b, i) {
        var x0 = (i / bits.length) * w, x1 = ((i + 1) / bits.length) * w;
        var y = b ? 22 : h - 18;
        if (i === 0) c.moveTo(x0, y); else c.lineTo(x0, y);
        c.lineTo(x1, y);
      });
      c.stroke();
    } else if (kind === "pam4") {
      baseline();
      var lv = [3, 1, 2, 0, 3, 2, 1, 3, 0, 2];
      c.strokeStyle = MG; c.beginPath();
      lv.forEach(function (l, i) {
        var x0 = (i / lv.length) * w, x1 = ((i + 1) / lv.length) * w;
        var y = h - 18 - (l / 3) * (h - 42);
        if (i === 0) c.moveTo(x0, y); else c.lineTo(x0, y);
        c.lineTo(x1, y);
      });
      c.stroke();
      c.strokeStyle = "rgba(146,168,214,.2)"; c.lineWidth = 1;
      [0, 1, 2, 3].forEach(function (l) {
        var y = h - 18 - (l / 3) * (h - 42);
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      });
    } else if (kind === "qam") {
      // Konstellationsdiagramm 16-QAM
      c.strokeStyle = "rgba(146,168,214,.25)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w / 2, h - 6); c.moveTo(10, h / 2); c.lineTo(w - 10, h / 2); c.stroke();
      for (var a = 0; a < 4; a++) for (var b2 = 0; b2 < 4; b2++) {
        var px = w / 2 + (a - 1.5) * 26, py = h / 2 + (b2 - 1.5) * 18;
        c.fillStyle = (a + b2) % 2 ? CY : MG;
        c.beginPath(); c.arc(px, py, 3.4, 0, 6.3); c.fill();
      }
      c.fillStyle = "#97A3BF"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("I", w - 16, h / 2 - 6); c.fillText("Q", w / 2 + 6, 14);
    } else if (kind === "wdm") {
      baseline();
      [[CY, 0], [MG, 1], [AM, 2], ["#5CF2A6", 3]].forEach(function (pair) {
        c.strokeStyle = pair[0]; c.beginPath();
        for (var x = 0; x <= w; x += 2) {
          var y = h / 2 + Math.sin((x / w) * Math.PI * (6 + pair[1] * 3)) * (h / 2 - 22) * 0.55 - 6;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      });
    } else if (kind === "tdma") {
      baseline();
      var slots = [CY, MG, AM, CY, "#5CF2A6", MG, CY, AM];
      slots.forEach(function (col, i) {
        var x0 = (i / slots.length) * w + 2, bw = w / slots.length - 4;
        var hh = 16 + (i % 3) * 16;
        c.fillStyle = col; c.globalAlpha = 0.85;
        c.fillRect(x0, h - 18 - hh, bw, hh);
      });
      c.globalAlpha = 1;
      c.fillStyle = "#97A3BF"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("ONT 1   ONT 2   ONT 3 …", 6, 14);
    } else if (kind === "duplex") {
      c.strokeStyle = "rgba(146,168,214,.2)"; c.lineWidth = 10; c.lineCap = "round";
      c.beginPath(); c.moveTo(16, h / 2); c.lineTo(w - 16, h / 2); c.stroke();
      c.lineWidth = 2.4; c.lineCap = "butt";
      c.strokeStyle = CY; c.beginPath();
      for (var x2 = 16; x2 <= w - 16; x2 += 2) {
        var y2 = h / 2 - 12 + Math.sin(x2 / 9) * 5;
        x2 === 16 ? c.moveTo(x2, y2) : c.lineTo(x2, y2);
      }
      c.stroke();
      c.strokeStyle = MG; c.beginPath();
      for (var x3 = 16; x3 <= w - 16; x3 += 2) {
        var y3 = h / 2 + 14 + Math.sin(x3 / 6) * 4;
        x3 === 16 ? c.moveTo(x3, y3) : c.lineTo(x3, y3);
      }
      c.stroke();
      c.fillStyle = "#97A3BF"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("1577 nm ↓", 18, 20); c.fillText("1270 nm ↑", 18, h - 8);
    }
  });

  /* ═══════════════ 7 · DATENRATEN-BALKEN ═══════════════ */
  var TECHS = [
    { n: "Glasfaser", s: "FTTH, XGS-PON", d: 10000, u: 10000, hero: true },
    { n: "Richtfunk", s: "lizenziert, PtP", d: 1000, u: 1000 },
    { n: "Kabel", s: "DOCSIS 3.1", d: 1000, u: 50 },
    { n: "5G", s: "Mobilfunk, geteilt", d: 500, u: 100 },
    { n: "DSL", s: "VDSL 250 Vectoring", d: 250, u: 40 },
    { n: "Satellit", s: "LEO, Starlink", d: 200, u: 20 }
  ];
  function logW(v) { return clamp((Math.log10(v) - 1) / (Math.log10(10000) - 1), 0.02, 1) * 100; }
  function fmt(v) { return v >= 1000 ? (v / 1000) + " Gbit/s" : v + " Mbit/s"; }

  var barsEl = document.getElementById("bars");
  if (barsEl) {
    TECHS.forEach(function (t) {
      var row = document.createElement("div");
      row.className = "bar-row" + (t.hero ? " is-hero" : "");
      row.innerHTML =
        '<div class="name">' + t.n + '<small>' + t.s + '</small></div>' +
        '<div class="track">' +
        '<div class="b down"><span>↓ ' + fmt(t.d) + '</span></div>' +
        '<div class="b up"><span>↑ ' + fmt(t.u) + '</span></div>' +
        '</div>';
      barsEl.appendChild(row);
    });
    var barsShown = false;
    var showBars = function () {
      if (barsShown) return; barsShown = true;
      barsEl.querySelectorAll(".bar-row").forEach(function (row, i) {
        var t = TECHS[i];
        setTimeout(function () {
          row.querySelector(".b.down").style.width = logW(t.d) + "%";
          row.querySelector(".b.up").style.width = logW(t.u) + "%";
        }, i * 90);
      });
    };
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) showBars(); });
    }, { threshold: 0.3 }).observe(barsEl);
  }

  /* ═══════════════ 8 · DOWNLOAD-RECHNER ═══════════════ */
  var calcRows = document.getElementById("calcRows");
  if (calcRows) {
    var sizeRange = document.getElementById("sizeRange");
    var sizeOut = document.getElementById("sizeOut");
    var dir = "down";

    TECHS.forEach(function (t) {
      var r = document.createElement("div");
      r.className = "crow" + (t.hero ? " is-hero" : "");
      r.innerHTML = '<div class="n">' + t.n + '<small>' + t.s + '</small></div>' +
        '<div class="cb"><i></i></div><div class="t">–</div>';
      calcRows.appendChild(r);
    });

    function fmtTime(sec) {
      if (sec < 1) return Math.round(sec * 1000) + " ms";
      if (sec < 90) return sec.toFixed(sec < 10 ? 1 : 0).replace(".", ",") + " s";
      if (sec < 5400) return (sec / 60).toFixed(1).replace(".", ",") + " min";
      if (sec < 86400) return (sec / 3600).toFixed(1).replace(".", ",") + " h";
      return (sec / 86400).toFixed(1).replace(".", ",") + " Tage";
    }
    function gbFromPos(pos) { return 0.1 * Math.pow(5000, pos / 1000); }
    function posFromGb(gb) { return 1000 * Math.log(gb / 0.1) / Math.log(5000); }

    function recalc() {
      var gb = gbFromPos(+sizeRange.value);
      var txt = gb < 1 ? gb.toFixed(2) : (gb < 10 ? gb.toFixed(1) : Math.round(gb).toString());
      sizeOut.textContent = txt.replace(".", ",") + " GB";
      var mbit = gb * 8 * 1024 * 0.94; // Nutzdaten abzüglich Overhead
      var times = TECHS.map(function (t) { return mbit / (dir === "down" ? t.d : t.u); });
      var max = Math.max.apply(null, times);
      calcRows.querySelectorAll(".crow").forEach(function (row, i) {
        row.querySelector("i").style.width = clamp(times[i] / max * 100, 1.5, 100) + "%";
        row.querySelector(".t").textContent = fmtTime(times[i]);
      });
    }
    sizeRange.addEventListener("input", function () {
      document.querySelectorAll(".presets button").forEach(function (b) { b.classList.remove("is-on"); });
      recalc();
    });
    document.querySelectorAll(".presets button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".presets button").forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        sizeRange.value = posFromGb(+b.dataset.gb);
        recalc();
      });
    });
    document.querySelectorAll(".calc-toggle button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".calc-toggle button").forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on"); dir = b.dataset.dir; recalc();
      });
    });
    recalc();
  }

  /* ═══════════════ 9 · ZÄHLER ═══════════════ */
  document.querySelectorAll(".num").forEach(function (el) {
    var done = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        var to = +el.dataset.to, dec = +el.dataset.dec, t0 = performance.now(), dur = 1400;
        (function step(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * eased).toFixed(dec).replace(".", ",");
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 }).observe(el);
  });

  /* ═══════════════ 10 · QUIZ ═══════════════ */
  var QUIZ = [
    {
      q: "Warum bleibt das Licht im Kern der Faser?",
      a: ["Der Mantel ist verspiegelt", "Totalreflexion an der Grenze Kern/Mantel", "Das Licht wird magnetisch geführt", "Der Kern ist ein Vakuum"],
      c: 1,
      e: "Der Kern hat mit n ≈ 1,48 eine höhere Brechzahl als der Mantel (n ≈ 1,46). Flach auftreffendes Licht wird deshalb vollständig zurückgeworfen."
    },
    {
      q: "Was unterscheidet FTTH von FTTC?",
      a: ["FTTH nutzt Multimode-Fasern", "FTTH ist nur für Firmen", "Bei FTTH endet das Glas in der Wohnung, bei FTTC am Kabelverzweiger", "FTTC ist schneller"],
      c: 2,
      e: "Bei FTTC läuft die letzte Meile über Kupfer (VDSL) – damit ist bei rund 250 Mbit/s Schluss. FTTH bringt das Glas bis ins Büro."
    },
    {
      q: "Wie viele Teilnehmer teilen sich im PON typischerweise eine Faser?",
      a: ["2 bis 4", "32 bis 128", "genau 1", "über 1 000"],
      c: 1,
      e: "Ein passiver Splitter teilt das Signal auf 32 bis 128 Teilnehmer auf. Wer eine exklusive Faser braucht, nimmt Punkt-zu-Punkt (P2P)."
    },
    {
      q: "Welche Wellenlänge hat im Glas die geringste Dämpfung?",
      a: ["850 nm", "1310 nm", "1550 nm", "450 nm"],
      c: 2,
      e: "Bei 1550 nm liegt die Dämpfung bei etwa 0,2 dB/km – deshalb wird dieses C-Band für lange Strecken und DWDM genutzt."
    },
    {
      q: "Was ist der größte praktische Nachteil von Glasfaser?",
      a: ["Hohe Latenz", "Störanfällig gegen Elektromagnetik", "Geringe Reichweite", "Teurer, langsamer Tiefbau – Verfügbarkeit hängt an der Adresse"],
      c: 3,
      e: "Technisch ist Glasfaser allen Alternativen überlegen. Der Engpass ist der Bau: Grabungen kosten Zeit und Geld."
    }
  ];

  var quizBox = document.getElementById("quiz-box");
  if (quizBox) {
    var qi = 0, score = 0, answered = false;

    function renderQ() {
      if (qi >= QUIZ.length) {
        quizBox.innerHTML =
          '<div class="q">Geschafft!</div>' +
          '<p class="score">' + score + " / " + QUIZ.length + "</p>" +
          '<p class="expl">' + (score === QUIZ.length ? "Perfekt – bereit für die Präsentation." :
            score >= 3 ? "Solide Grundlage. Ein Blick ins Glossar schadet trotzdem nicht." :
              "Noch mal hochscrollen – die Antworten stehen alle auf dieser Seite.") + "</p>" +
          '<div class="qfoot"><span></span><button class="next" id="qrestart">Noch einmal</button></div>';
        document.getElementById("qrestart").addEventListener("click", function () {
          qi = 0; score = 0; renderQ();
        });
        return;
      }
      var item = QUIZ[qi];
      answered = false;
      quizBox.innerHTML =
        '<div class="q">' + (qi + 1) + ". " + item.q + "</div>" +
        '<div class="opts">' + item.a.map(function (a, i) {
          return '<button data-i="' + i + '">' + a + "</button>";
        }).join("") + "</div>" +
        '<p class="expl" id="qexpl"></p>' +
        '<div class="qfoot"><span>Frage ' + (qi + 1) + " von " + QUIZ.length + " · " + score + " richtig</span>" +
        '<button class="next" id="qnext" disabled>Weiter →</button></div>';

      quizBox.querySelectorAll(".opts button").forEach(function (b) {
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var pick = +b.dataset.i;
          if (pick === item.c) { b.classList.add("ok"); score++; }
          else {
            b.classList.add("bad");
            quizBox.querySelector('.opts button[data-i="' + item.c + '"]').classList.add("ok");
          }
          document.getElementById("qexpl").textContent = item.e;
          document.getElementById("qnext").disabled = false;
          document.getElementById("qnext").focus();
        });
      });
      document.getElementById("qnext").addEventListener("click", function () { qi++; renderQ(); });
    }
    renderQ();
  }

  /* ═══════════════ 11 · NAVIGATION ═══════════════ */
  function sectionOrder() {
    return sections.map(function (s) { return s.id; });
  }
  function currentIndex() {
    var order = sectionOrder(), best = 0, bestD = Infinity;
    sections.forEach(function (s, i) {
      var d = Math.abs(s.getBoundingClientRect().top);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, button")) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key.toLowerCase() !== "f") return;
      if (e.target.matches("input[type=range]")) return;
    }
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown") {
      e.preventDefault();
      var n = sections[Math.min(sections.length - 1, currentIndex() + 1)];
      n.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    } else if (k === "ArrowLeft" || k === "PageUp") {
      e.preventDefault();
      var p2 = sections[Math.max(0, currentIndex() - 1)];
      p2.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    } else if (k.toLowerCase() === "f") {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
      else { document.exitFullscreen && document.exitFullscreen(); }
    }
  });

  if (hasGSAP) { ScrollTrigger.refresh(); window.addEventListener("load", function () { ScrollTrigger.refresh(); }); }
})();
