/* ═══════════════════════════════════════════════════════════
   Glasfaser für Teach:In — interaktives Plakat
   3D-Netzraum (three.js) · Klickpunkte im Raum · Popup-Inhalte
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var de = function (n, d) { return n.toFixed(d).replace(".", ","); };

  /* ════════ STATIONEN IM RAUM ════════ */
  var STATIONS = [
    { key: "ont",      t: 0.12, side: -1, color: 0x2EE6FF, hex: "#2EE6FF", name: "Router + ONT",  sub: "Teach:In · 0 m",        m: 0 },
    { key: "gfap",     t: 0.27, side:  1, color: 0x5CF2A6, hex: "#5CF2A6", name: "Gf-AP",         sub: "Hausanschluss · 20 m",  m: 20 },
    { key: "nvt",      t: 0.43, side: -1, color: 0x8AA4FF, hex: "#8AA4FF", name: "Netzverteiler", sub: "Gehweg · 300 m",        m: 300 },
    { key: "splitter", t: 0.58, side:  1, color: 0xFF4FB0, hex: "#FF4FB0", name: "Splitter",      sub: "passiv 1:32 · 2 km",    m: 2000 },
    { key: "olt",      t: 0.75, side: -1, color: 0xFFB43C, hex: "#FFB43C", name: "PoP mit OLT",   sub: "Vermittlung · 12 km",   m: 12000 },
    { key: "backbone", t: 0.93, side:  1, color: 0xFF7A59, hex: "#FF7A59", name: "Backbone",      sub: "DE-CIX · 20 km+",       m: 20000 }
  ];

  var MODALS = {
    ont:            ["Station 01 · Kundenseite", "Router und ONT"],
    gfap:           ["Station 02 · Gebäude", "Der Hausanschluss"],
    nvt:            ["Station 03 · Verteilnetz", "Der Netzverteiler"],
    splitter:       ["Station 04 · Verteilnetz", "Der passive Splitter"],
    olt:            ["Station 05 · Vermittlung", "PoP mit OLT"],
    backbone:       ["Station 06 · Weitverkehr", "Backbone und DWDM"],
    medium:         ["01 · Medium", "Ein Haar aus Glas"],
    varianten:      ["02 · Varianten", "Wie weit reicht das Glas?"],
    technik:        ["03 · Funktionsweise", "Licht, das nicht entkommt"],
    zahlen:         ["04 · Kennzahlen", "Raten, Frequenzen, Bandbreiten"],
    bilanz:         ["05 · Bewertung", "Vor- und Nachteile"],
    verfuegbarkeit: ["06 · Verfügbarkeit", "Wo liegt schon Glas?"],
    kosten:         ["07 · Kosten", "Was kostet der Anschluss?"],
    rechner:        ["08 · Interaktiv", "Wie lange dauert die Übertragung?"],
    quiz:           ["09 · Plenum", "Kurzes Quiz"],
    glossar:        ["10 · Glossar", "Grundbegriffe"],
    quellen:        ["Belege", "Quellen und Stand"]
  };

  var stage = 0, modalOpen = false;
  var TRAVEL = 0.82;   // Anteil des Scrollwegs für die Fahrt durch den Korridor

  /* ════════ 3D-RAUM ════════ */
  var cam = { z: 14, y: 0.3, pitch: 0 };
  var travelEnd = -120;
  var scene3d = null;

  function buildRoom() {
    var canvas = document.getElementById("scene");
    if (!canvas || typeof THREE === "undefined") return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x04060f, 1);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060f, 0.0165);

    var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 600);
    camera.position.set(0, 0.3, 14);

    /* — Raumbegrenzung: Boden, Decke, zwei Wände — */
    function grid(size, div, c1, c2, op) {
      var g = new THREE.GridHelper(size, div, c1, c2);
      g.material.transparent = true;
      g.material.opacity = op;
      g.material.depthWrite = false;
      return g;
    }
    var FLOOR_Y = -3.4, CEIL_Y = 5.6, WALL_X = 13.5, ROOM_Z = -140;

    var floor = grid(400, 100, 0x2EE6FF, 0x1b3a68, 0.42);
    floor.position.set(0, FLOOR_Y, ROOM_Z); scene.add(floor);

    var ceil = grid(400, 100, 0x1b3a6b, 0x122a4e, 0.12);
    ceil.position.set(0, CEIL_Y, ROOM_Z);
    scene.add(ceil);

    var left = grid(400, 56, 0x1e3f73, 0x142a52, 0.16);
    left.rotation.z = Math.PI / 2; left.position.set(-WALL_X, 1, ROOM_Z); scene.add(left);

    var right = grid(400, 56, 0x1e3f73, 0x142a52, 0.16);
    right.rotation.z = Math.PI / 2; right.position.set(WALL_X, 1, ROOM_Z); scene.add(right);

    /* — Licht — */
    scene.add(new THREE.AmbientLight(0x3f5a91, 0.7));

    /* — Die Faser als Tube durch den Raum — */
    // Die Faser läuft seitlich an der rechten Wand entlang, nicht durch die Kameraachse
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.6, -1.9, 15),
      new THREE.Vector3(3.1, -0.9, 1),
      new THREE.Vector3(2.5, 0.2, -26),
      new THREE.Vector3(3.3, -0.3, -60),
      new THREE.Vector3(2.6, 0.6, -100),
      new THREE.Vector3(3.0, 0.1, -150)
    ]);

    var core = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 260, 0.085, 10, false),
      new THREE.MeshBasicMaterial({ color: 0xa9e4ff })
    );
    scene.add(core);

    var sheath = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 200, 0.3, 14, false),
      new THREE.MeshStandardMaterial({
        color: 0x14334d, emissive: 0x0a2136, emissiveIntensity: 0.3,
        roughness: 0.3, metalness: 0.35, transparent: true, opacity: 0.2, side: THREE.DoubleSide
      })
    );
    scene.add(sheath);

    /* — Lichtpulse in der Faser — */
    var pulseGeo = new THREE.SphereGeometry(0.19, 12, 12);
    var pulses = [];
    for (var i = 0; i < 22; i++) {
      var m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({
        color: i % 4 === 0 ? 0xffffff : (i % 4 === 1 ? 0x9df3ff : (i % 4 === 2 ? 0xffd6ee : 0xcfe6ff)),
        transparent: true, opacity: 0.95
      }));
      m.userData = { t: i / 22, sp: 0.055 + Math.random() * 0.03 };
      scene.add(m);
      pulses.push(m);
    }

    /* — Stationen: Schrank, Lichtsäule, Stichleitung — */
    var beamMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false });
    STATIONS.forEach(function (s, i) {
      var p = curve.getPointAt(s.t);
      s.cablePos = p.clone();
      // Schränke stehen an den Wänden, der Gang in der Mitte bleibt frei
      var cx = s.side > 0 ? p.x + 3.1 + i * 0.2 : -4.9 - i * 0.2;
      var cz = p.z;

      var lamp = new THREE.PointLight(s.color, 22, 34);
      lamp.position.set(cx, FLOOR_Y + 2.4, cz);
      scene.add(lamp);

      var box = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 2.2, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x0b1024, roughness: 0.6, metalness: 0.4 })
      );
      box.position.set(cx, FLOOR_Y + 1.1, cz);
      scene.add(box);

      var edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(box.geometry),
        new THREE.LineBasicMaterial({ color: s.color, transparent: true, opacity: 0.85 })
      );
      edges.position.copy(box.position);
      scene.add(edges);
      s.edges = edges;

      var face = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.16),
        new THREE.MeshBasicMaterial({ color: s.color })
      );
      face.position.set(cx, FLOOR_Y + 1.75, cz + 0.44);
      scene.add(face);

      var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.42, 9.4, 10, 1, true), beamMat.clone());
      beam.material.color = new THREE.Color(s.color);
      beam.position.set(cx, FLOOR_Y + 4.7, cz);
      scene.add(beam);

      var pad = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.5, 28),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(cx, FLOOR_Y + 0.02, cz);
      scene.add(pad);

      var stub = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p.x, p.y, p.z),
          new THREE.Vector3(cx, FLOOR_Y + 2.2, cz)
        ]),
        new THREE.LineBasicMaterial({ color: s.color, transparent: true, opacity: 0.55 })
      );
      scene.add(stub);

      s.anchor = new THREE.Vector3(cx, FLOOR_Y + 2.9 + i * 0.3, cz);
    });

    travelEnd = STATIONS[STATIONS.length - 1].anchor.z + 7;

    /* — Staub für Tiefenstaffelung — */
    var N = 1400, pos = new Float32Array(N * 3);
    for (var k = 0; k < N; k++) {
      pos[k * 3] = (Math.random() - 0.5) * 26;
      pos[k * 3 + 1] = FLOOR_Y + Math.random() * 9;
      pos[k * 3 + 2] = 16 - Math.random() * 200;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0x9dc0ff, size: 0.055, transparent: true, opacity: 0.55, sizeAttenuation: true, depthWrite: false
    }));
    scene.add(dust);

    /* — Unscharfe Lichtflecken dicht vor der Kamera (starke Parallaxe) — */
    var bc = document.createElement("canvas"); bc.width = bc.height = 128;
    var bg = bc.getContext("2d");
    var rg = bg.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(1, "rgba(255,255,255,0)");
    bg.fillStyle = rg; bg.fillRect(0, 0, 128, 128);
    var bokehTex = new THREE.CanvasTexture(bc);
    var bokeh = [];
    var BC = [0x2EE6FF, 0xFF4FB0, 0xFFB43C, 0x5CF2A6, 0x8AA4FF];
    for (var b = 0; b < 7; b++) {
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: bokehTex, color: BC[b % BC.length], transparent: true,
        opacity: 0.05 + Math.random() * 0.05, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      sp.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, 2 + Math.random() * 7);
      var sc = 2.5 + Math.random() * 5;
      sp.scale.set(sc, sc, 1);
      scene.add(sp);
      bokeh.push(sp);
    }

    /* — Maus-Parallaxe — */
    var mouse = { x: 0, y: 0 }, mx = 0, my = 0;
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
    var look = new THREE.Vector3();

    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      var e = 1 - Math.pow(0.0008, dt);
      var t = clock.getElapsedTime();

      mx = lerp(mx, mouse.x, e * 0.7);
      my = lerp(my, mouse.y, e * 0.7);

      camera.position.x = lerp(camera.position.x, mx * 2.2, e);
      camera.position.y = lerp(camera.position.y, cam.y - my * 1.1, e);
      camera.position.z = lerp(camera.position.z, cam.z, e);
      look.set(mx * 1.4, cam.y + cam.pitch - my * 0.9, camera.position.z - 24);
      camera.lookAt(look);

      if (!reduced) {
        pulses.forEach(function (m) {
          var d = m.userData;
          d.t = (d.t + dt * d.sp) % 1;
          var p = curve.getPointAt(1 - d.t);
          m.position.copy(p);
          var s = 0.72 + Math.sin(t * 7 + d.t * 20) * 0.22;
          m.scale.setScalar(s);
        });
        STATIONS.forEach(function (s, i) {
          s.edges.material.opacity = 0.62 + Math.sin(t * 1.6 + i) * 0.22;
        });
        dust.rotation.z += dt * 0.006;
      }

      bokeh.forEach(function (sp, i) {
        sp.position.y += Math.sin(t * 0.4 + i) * dt * 0.25;
      });

      renderer.render(scene, camera);
      placeHotspots(camera);
    }
    frame();
    return { camera: camera, scene: scene, renderer: renderer };
  }

  /* ════════ KLICKPUNKTE IM RAUM ════════ */
  var hotLayer = document.getElementById("hotspots");
  var hotEls = [];
  var projV = (typeof THREE !== "undefined") ? new THREE.Vector3() : null;

  STATIONS.forEach(function (s) {
    var b = document.createElement("button");
    b.className = "hs";
    b.style.setProperty("--c", s.hex);
    b.dataset.modal = s.key;
    b.innerHTML = '<span class="ring"></span><span class="hs-txt"><b></b><em></em></span>';
    b.querySelector("b").textContent = s.name;
    b.querySelector("em").textContent = s.sub;
    hotLayer.appendChild(b);
    hotEls.push(b);
    s.el = b;
  });

  function placeHotspots(camera) {
    if (!projV) return;
    var W = window.innerWidth, H = window.innerHeight;
    var cand = [];

    for (var i = 0; i < STATIONS.length; i++) {
      var s = STATIONS[i];
      if (!s.anchor || !s.el) continue;
      projV.copy(s.anchor).project(camera);
      var dist = camera.position.distanceTo(s.anchor);
      var x = (projV.x * 0.5 + 0.5) * W;
      var y = (-projV.y * 0.5 + 0.5) * H;
      var ok = projV.z <= 1 && dist < 96 && x > -60 && x < W + 60 && y > 84 && y < H - 40;
      cand.push({ s: s, x: x, y: y, d: dist, ok: ok });
    }

    // Näher gelegene Punkte gewinnen; dahinterliegende weichen nach oben aus
    cand.sort(function (a, b) { return a.d - b.d; });
    var taken = [];
    function collides(c) {
      for (var j = 0; j < taken.length; j++) {
        if (Math.abs(taken[j].x - c.x) < 150 && Math.abs(taken[j].y - c.y) < 46) return true;
      }
      return false;
    }
    cand.forEach(function (c) {
      if (!c.ok) return;
      var tries = 0;
      while (collides(c) && tries < 3) { c.y -= 48; tries++; }
      if (collides(c) || c.y < 96) { c.ok = false; return; }
      taken.push(c);
    });

    cand.forEach(function (c) {
      var sc = clamp(1.28 - c.d / 90, 0.66, 1.06);
      var el = c.s.el;
      el.style.transform = "translate(-50%, -50%) translate(" + c.x.toFixed(1) + "px," + c.y.toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
      el.style.opacity = c.ok ? clamp(1.3 - c.d / 88, 0.42, 1).toFixed(2) : "0";
      el.style.pointerEvents = (c.ok && stage === 0 && !modalOpen) ? "auto" : "none";
    });
  }

  scene3d = buildRoom();

  /* ════════ STATIONSLEISTE ════════ */
  var railEl = document.getElementById("rail");
  function travelFrac(z) { return clamp((14 - z) / (14 - travelEnd), 0, 1); }

  if (railEl) {
    STATIONS.forEach(function (s) {
      if (!s.anchor) return;
      s.frac = travelFrac(s.anchor.z);
      var b = document.createElement("button");
      b.className = "tick";
      b.style.top = (s.frac * 100).toFixed(1) + "%";
      b.style.setProperty("--c", s.hex);
      b.innerHTML = '<i></i><span></span>';
      b.querySelector("span").textContent = s.name;
      b.title = s.name + " — " + s.sub;
      b.addEventListener("click", function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: max * s.frac * TRAVEL, behavior: reduced ? "auto" : "smooth" });
      });
      railEl.appendChild(b);
      s.tick = b;
    });
  }


  /* ════════ BÜHNENWECHSEL ════════ */
  var stages = [document.getElementById("stage0"), document.getElementById("stage1")];
  var navBtns = Array.prototype.slice.call(document.querySelectorAll(".stage-nav button"));
  var posterShown = false;

  function setStage(n) {
    if (n === stage) return;
    stage = n;
    stages.forEach(function (el, i) { el.classList.toggle("is-on", i === n); });
    navBtns.forEach(function (b, i) { b.classList.toggle("is-on", i === n); });
    hotLayer.style.opacity = n === 0 ? "1" : "0";
    if (n === 1 && !posterShown) {
      posterShown = true;
      stages[1].classList.add("revealed");
    }
  }

  var intro = document.querySelector(".room-intro");
  var depthDot = document.getElementById("depthDot");
  var depthNow = document.getElementById("depthNow");

  function fmtDist(m) {
    if (m < 1000) return Math.round(m / 10) * 10 + " m";
    return de(m / 1000, m < 10000 ? 1 : 0) + " km";
  }
  function distanceAt(z) {
    var A = STATIONS;
    if (!A[0].anchor) return "0 m";
    if (z >= A[0].anchor.z) return "0 m";
    for (var i = 0; i < A.length - 1; i++) {
      var z0 = A[i].anchor.z, z1 = A[i + 1].anchor.z;
      if (z <= z0 && z > z1) {
        var f = (z0 - z) / (z0 - z1);
        return fmtDist(A[i].m + f * (A[i + 1].m - A[i].m));
      }
    }
    return fmtDist(A[A.length - 1].m);
  }

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    var a = clamp(p / TRAVEL, 0, 1);                              // Fahrt durch den Korridor
    var c = smooth(clamp((p - TRAVEL) / (1 - TRAVEL), 0, 1));     // Rückzug für das Plakat
    var travelZ = lerp(14, travelEnd, a);

    cam.z = travelZ + c * 9;
    cam.y = lerp(0.3, 1.1, smooth(a)) + c * 3.6;
    cam.pitch = -c * 1.7;

    // Titelblock macht nach dem Start Platz für den Raum
    if (intro) {
      var o = clamp(1 - a / 0.2, 0, 1);
      intro.style.opacity = o.toFixed(2);
      intro.style.pointerEvents = o > 0.15 ? "auto" : "none";
      intro.style.transform = "translateY(" + (-(1 - o) * 26).toFixed(1) + "px)";
    }

    if (depthDot) depthDot.style.top = (a * 100).toFixed(1) + "%";
    if (depthNow) depthNow.textContent = distanceAt(travelZ);

    // Erreichte Station auf der Leiste hervorheben
    var cur = -1;
    STATIONS.forEach(function (s, i) { if (s.frac !== undefined && a >= s.frac - 0.03) cur = i; });
    STATIONS.forEach(function (s, i) { if (s.tick) s.tick.classList.toggle("is-on", i === cur); });

    setStage(p < TRAVEL - 0.03 ? 0 : 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  function scrollToStage(n) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: n === 0 ? 0 : max, behavior: reduced ? "auto" : "smooth" });
  }
  navBtns.forEach(function (b) {
    b.addEventListener("click", function () { scrollToStage(+b.dataset.stage); });
  });

  /* ════════ MODAL ════════ */
  var wrap = document.getElementById("modalWrap");
  var mBody = document.getElementById("modalBody");
  var mTitle = document.getElementById("modalTitle");
  var mEyebrow = document.getElementById("modalEyebrow");
  var lastFocus = null;

  function openModal(key) {
    var tpl = document.querySelector('template[data-t="' + key + '"]');
    if (!tpl) return;
    var meta = MODALS[key] || ["", key];
    mEyebrow.textContent = meta[0];
    mTitle.textContent = meta[1];
    mBody.textContent = "";
    mBody.appendChild(tpl.content.cloneNode(true));
    wrap.hidden = false;
    modalOpen = true;
    document.body.classList.add("locked");
    lastFocus = document.activeElement;
    document.getElementById("modalX").focus();
    if (WIDGETS[key]) WIDGETS[key](mBody);
  }

  function closeModal() {
    if (!modalOpen) return;
    wrap.hidden = true;
    modalOpen = false;
    crossRunning = false;
    document.body.classList.remove("locked");
    mBody.textContent = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-modal]");
    if (trigger) { e.preventDefault(); openModal(trigger.dataset.modal); return; }
    if (e.target.id === "modalBg" || e.target.id === "modalX") closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOpen) { closeModal(); return; }
    if (modalOpen) return;
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); scrollToStage(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); scrollToStage(0); }
    else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
      else { document.exitFullscreen && document.exitFullscreen(); }
    }
  });

  /* ════════ DATEN ════════ */
  var TECHS = [
    { n: "Glasfaser", s: "FTTH, XGS-PON", d: 10000, u: 10000, hero: true },
    { n: "Richtfunk", s: "lizenziert, PtP", d: 1000, u: 1000 },
    { n: "Kabel", s: "DOCSIS 3.1", d: 1000, u: 50 },
    { n: "5G", s: "Mobilfunk, geteilt", d: 500, u: 100 },
    { n: "DSL", s: "VDSL 250 Vectoring", d: 250, u: 40 },
    { n: "Satellit", s: "LEO, Starlink", d: 200, u: 20 }
  ];

  var GLOSSAR = [
    ["LWL", "Lichtwellenleiter — der Fachbegriff für das Glasfaserkabel: ein Leiter, in dem Licht statt Strom das Signal trägt."],
    ["FTTH", "Fiber to the Home — die Glasfaser endet in der Wohnung oder im Büro. Kein Kupfer auf der letzten Meile."],
    ["FTTB / FTTC", "Fiber to the Building beziehungsweise to the Curb — das Glas endet im Keller oder am Kabelverzweiger, der Rest läuft über Kupfer."],
    ["ONT", "Optical Network Termination — das Glasfaser-Modem beim Kunden. Wandelt elektrische Signale in Licht und zurück."],
    ["OLT", "Optical Line Termination — die Gegenstelle im PoP des Anbieters, an der viele hundert ONTs zusammenlaufen."],
    ["PON", "Passive Optical Network — eine Faser wird mit stromlosen Splittern auf 32 bis 128 Teilnehmer aufgeteilt."],
    ["P2P / AON", "Punkt zu Punkt beziehungsweise Active Optical Network — jeder Kunde bekommt eine eigene Faser mit garantierter Bandbreite."],
    ["Splitter", "Passiver Glaskörper, der ein optisches Signal auf mehrere Fasern aufteilt, ohne Strom und ohne Elektronik."],
    ["Gf-AP / APL", "Glasfaser-Abschlusspunkt beziehungsweise Abschlusspunkt Linientechnik — die Übergabedose im Keller."],
    ["Singlemode", "Faser mit 9 µm Kern: nur ein Lichtweg, dadurch keine Modendispersion und Reichweiten bis 80 km."],
    ["Multimode", "Faser mit 50 µm Kern: viele Lichtwege, billigere Sender, aber nur bis etwa 550 m."],
    ["Totalreflexion", "Trifft Licht flach genug auf die Grenze zwischen dichterem Kern und dünnerem Mantel, wird es vollständig zurückgeworfen."],
    ["Brechzahl (n)", "Maß dafür, wie stark ein Material Licht bremst. Kern n ≈ 1,48, Mantel n ≈ 1,46."],
    ["Dämpfung", "Signalverlust in Dezibel pro Kilometer. Bei 1550 nm rund 0,2 dB/km."],
    ["nm / Wellenlänge", "Nanometer, das Farbmaß des Lichts. 1310 nm und 1550 nm liegen im Infrarot."],
    ["DWDM", "Dense Wavelength Division Multiplexing — bis zu 96 Wellenlängen teilen sich eine Faser."],
    ["TDMA", "Time Division Multiple Access — im PON-Upstream bekommt jedes ONT feste Zeitschlitze."],
    ["NRZ / OOK", "On-Off-Keying: Licht an ist 1, Licht aus ist 0. Das einfachste optische Modulationsverfahren."],
    ["PAM4", "Vier Helligkeitsstufen statt zwei, also 2 Bit pro Symbol. Verdoppelt die Rate bei gleicher Symbolrate."],
    ["XGS-PON", "PON-Generation mit symmetrisch 10 Gbit/s. Löst GPON schrittweise ab."],
    ["Symmetrisch", "Upload genauso schnell wie Download — der große Vorteil gegenüber DSL und Kabel."],
    ["Latenz", "Signallaufzeit. Im Glas etwa 5 µs pro Kilometer, ein FTTH-Anschluss liegt bei 1 bis 5 ms."],
    ["Spleißen", "Dauerhaftes Verschweißen zweier Fasern im Lichtbogen, Verlust unter 0,1 dB."],
    ["Homes Passed", "Adressen, an denen Glasfaser bis vor die Tür liegt, noch ohne Vertrag."],
    ["Take-up-Rate", "Anteil der erschlossenen Haushalte mit tatsächlich gebuchtem Vertrag. In Deutschland rund 27 %."],
    ["BKZ", "Baukostenzuschuss — einmalige Beteiligung an den Tiefbaukosten außerhalb der regulären Ausbauphase."]
  ];

  var QUIZ = [
    { q: "Warum bleibt das Licht im Kern der Faser?",
      a: ["Der Mantel ist verspiegelt", "Totalreflexion an der Grenze Kern zu Mantel", "Das Licht wird magnetisch geführt", "Der Kern ist ein Vakuum"], c: 1,
      e: "Der Kern hat mit n ≈ 1,48 eine höhere Brechzahl als der Mantel mit n ≈ 1,46. Flach auftreffendes Licht wird deshalb vollständig zurückgeworfen." },
    { q: "Was unterscheidet FTTH von FTTC?",
      a: ["FTTH nutzt Multimode-Fasern", "FTTH gibt es nur für Firmen", "Bei FTTH endet das Glas im Büro, bei FTTC am Kabelverzweiger", "FTTC ist schneller"], c: 2,
      e: "Bei FTTC läuft die letzte Meile über Kupfer, damit ist bei rund 250 Mbit/s Schluss. FTTH bringt das Glas bis ins Gebäude." },
    { q: "Wie viele Teilnehmer teilen sich im PON typischerweise eine Faser?",
      a: ["2 bis 4", "32 bis 128", "genau einer", "über 1 000"], c: 1,
      e: "Ein passiver Splitter teilt das Signal auf 32 bis 128 Teilnehmer auf. Wer eine exklusive Faser braucht, nimmt Punkt zu Punkt." },
    { q: "Welche Wellenlänge hat im Glas die geringste Dämpfung?",
      a: ["850 nm", "1310 nm", "1550 nm", "450 nm"], c: 2,
      e: "Bei 1550 nm liegt die Dämpfung bei etwa 0,2 dB/km. Deshalb nutzt man dieses C-Band für lange Strecken und DWDM." },
    { q: "Was ist der größte praktische Nachteil von Glasfaser?",
      a: ["Hohe Latenz", "Störanfällig gegen Elektromagnetik", "Geringe Reichweite", "Teurer, langsamer Tiefbau — die Verfügbarkeit hängt an der Adresse"], c: 3,
      e: "Technisch ist Glasfaser allen Alternativen überlegen. Der Engpass ist der Bau: Grabungen kosten Zeit und Geld." }
  ];

  /* ════════ WIDGETS ════════ */
  var crossRunning = false;

  var WIDGETS = {

    /* — Querschnitt und Schichten — */
    medium: function (root) {
      var cross = root.querySelector("#crossCut");
      var ctx = cross.getContext("2d");
      var items = Array.prototype.slice.call(root.querySelectorAll(".layers li"));
      var active = 4;
      var open = [0, 0, 0, 0, 0];
      var RINGS = [
        { r: 0.15, c: "#2EE6FF", n: "Kern", s: "9 µm" },
        { r: 0.33, c: "#BFEFFF", n: "Mantel", s: "125 µm" },
        { r: 0.51, c: "#8AA4FF", n: "Coating", s: "250 µm" },
        { r: 0.73, c: "#FF4FB0", n: "Buffer", s: "900 µm" },
        { r: 1.00, c: "#FFB43C", n: "Außenmantel", s: "2–3 mm" }
      ];

      function setActive(l) {
        active = clamp(Math.round(l), 0, 4);
        items.forEach(function (li) { li.classList.toggle("is-on", +li.dataset.layer === active); });
      }
      items.forEach(function (li) {
        li.tabIndex = 0;
        li.addEventListener("click", function () { setActive(+li.dataset.layer); });
        li.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setActive(+li.dataset.layer); }
        });
      });
      setActive(4);

      function draw(t) {
        var W = cross.width, H = cross.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.40;
        ctx.clearRect(0, 0, W, H);
        for (var i = RINGS.length - 1; i >= 0; i--) {
          var L = RINGS[i], o = open[i];
          var rad = R * L.r * (1 + o * 1.6);
          var alpha = (1 - o) * (i === active ? 1 : 0.5);
          if (alpha <= 0.02) continue;
          ctx.globalAlpha = alpha * 0.15; ctx.fillStyle = L.c;
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = alpha; ctx.strokeStyle = L.c;
          ctx.lineWidth = i === active ? 3 : 1.4;
          ctx.shadowColor = L.c; ctx.shadowBlur = i === active ? 20 : 5;
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.stroke();
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        var puls = 0.7 + Math.sin(t / 360) * 0.3;
        var cr = R * RINGS[0].r * 2;
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        g.addColorStop(0, "rgba(255,255,255," + (0.85 * puls).toFixed(3) + ")");
        g.addColorStop(0.4, "rgba(46,230,255," + (0.45 * puls).toFixed(3) + ")");
        g.addColorStop(1, "rgba(46,230,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.2832); ctx.fill();

        var A = RINGS[active];
        ctx.fillStyle = A.c; ctx.textAlign = "right";
        ctx.font = "600 17px Figtree, sans-serif"; ctx.fillText(A.n, W - 16, 30);
        ctx.fillStyle = "#8E9BB8"; ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillText(A.s, W - 16, 50);
        ctx.textAlign = "left";
      }

      crossRunning = true;
      (function loop(t) {
        if (!crossRunning) return;
        for (var i = 0; i < 5; i++) open[i] = lerp(open[i], i > active ? 1 : 0, 0.13);
        draw(t);
        requestAnimationFrame(loop);
      })(0);

      root.querySelectorAll(".pick-opt").forEach(function (b) {
        b.addEventListener("click", function () {
          root.querySelectorAll(".pick-opt").forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on");
          RINGS[0].r = b.dataset.mode === "mm" ? 0.22 : 0.15;
          RINGS[0].s = b.dataset.mode === "mm" ? "50 µm" : "9 µm";
        });
      });
    },

    /* — FTTx-Balken — */
    varianten: function (root) {
      var fib = root.querySelector("#fiberPart");
      root.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () {
          root.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on");
          fib.style.width = (+b.dataset.f * 100) + "%";
        });
      });
    },

    /* — Totalreflexion und Modulationsverfahren — */
    technik: function (root) {
      var cv = root.querySelector("#tirCanvas");
      var ctx = cv.getContext("2d");
      var slider = root.querySelector("#tirAngle");
      var out = root.querySelector("#tirOut");
      var msg = root.querySelector("#tirMsg");
      var W = cv.width, H = cv.height, top = 70, bot = 170, CRIT = 9.4;

      function drawTIR() {
        var ang = +slider.value, guided = ang <= CRIT;
        out.textContent = de(ang, 1) + "°";
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0d1733"; ctx.fillRect(0, 16, W, H - 32);
        var g = ctx.createLinearGradient(0, top, 0, bot);
        g.addColorStop(0, "#123055"); g.addColorStop(0.5, "#0c2044"); g.addColorStop(1, "#123055");
        ctx.fillStyle = g; ctx.fillRect(0, top, W, bot - top);
        ctx.strokeStyle = "rgba(191,239,255,.5)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(W, top); ctx.moveTo(0, bot); ctx.lineTo(W, bot); ctx.stroke();
        ctx.fillStyle = "#8E9BB8"; ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillText("Mantel  n₂ = 1,46", 12, 40);
        ctx.fillText("Kern  n₁ = 1,48", 12, top + 20);

        var x = 0, y = bot - 8, dir = -1, slope = Math.tan(ang * Math.PI / 180) * 6, bounces = 0;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.strokeStyle = guided ? "#2EE6FF" : "#FF7A59";
        ctx.lineWidth = 2.4; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12;
        while (x < W && bounces < 40) {
          var limit = dir < 0 ? top : bot;
          var nx = x + Math.abs(limit - y) / (slope || 0.0001);
          if (nx > W) { ctx.lineTo(W, y + dir * (W - x) * slope); break; }
          ctx.lineTo(nx, limit);
          if (!guided) { ctx.lineTo(nx + 70, limit + dir * 55); break; }
          x = nx; y = limit; dir *= -1; bounces++;
        }
        ctx.stroke(); ctx.shadowBlur = 0;

        msg.textContent = guided
          ? de(ang, 1) + "° liegt unter dem Grenzwinkel von 9,4°. Das Licht bleibt im Kern, hier mit " + bounces + " Reflexionen. Der Winkel ist zur Sichtbarkeit sechsfach überhöht gezeichnet."
          : de(ang, 1) + "° liegt über dem Grenzwinkel von 9,4°. Das Licht tritt in den Mantel aus und geht verloren.";
        msg.style.color = guided ? "" : "#FF7A59";
      }
      slider.addEventListener("input", drawTIR);
      drawTIR();

      root.querySelectorAll(".wave").forEach(drawWave);
    },

    /* — Datenraten — */
    zahlen: function (root) {
      var host = root.querySelector("#bars");
      function logW(v) { return clamp((Math.log10(v) - 1) / 3, 0.02, 1) * 100; }
      function fmt(v) { return v >= 1000 ? (v / 1000) + " Gbit/s" : v + " Mbit/s"; }
      TECHS.forEach(function (t, i) {
        var row = document.createElement("div");
        row.className = "bar-row" + (t.hero ? " is-hero" : "");
        row.innerHTML = '<div class="name">' + t.n + "<small>" + t.s + "</small></div>" +
          '<div class="track"><div class="b down"><span>↓ ' + fmt(t.d) + '</span></div>' +
          '<div class="b up"><span>↑ ' + fmt(t.u) + "</span></div></div>";
        host.appendChild(row);
        setTimeout(function () {
          row.querySelector(".b.down").style.width = logW(t.d) + "%";
          row.querySelector(".b.up").style.width = logW(t.u) + "%";
        }, 60 + i * 80);
      });
    },

    /* — Zähler — */
    verfuegbarkeit: function (root) {
      root.querySelectorAll(".num").forEach(function (el, i) {
        var to = +el.dataset.to, dec = +el.dataset.dec, t0 = performance.now() + i * 90, dur = 1200;
        (function step(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          el.textContent = de(to * (1 - Math.pow(1 - p, 3)), dec);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    },

    /* — Download-Rechner — */
    rechner: function (root) {
      var rows = root.querySelector("#calcRows");
      var range = root.querySelector("#sizeRange");
      var out = root.querySelector("#sizeOut");
      var dir = "down";

      TECHS.forEach(function (t) {
        var r = document.createElement("div");
        r.className = "crow" + (t.hero ? " is-hero" : "");
        r.innerHTML = '<div class="n">' + t.n + "<small>" + t.s + '</small></div><div class="cb"><i></i></div><div class="t">–</div>';
        rows.appendChild(r);
      });

      function gbFromPos(p) { return 0.1 * Math.pow(5000, p / 1000); }
      function posFromGb(gb) { return 1000 * Math.log(gb / 0.1) / Math.log(5000); }
      function fmtTime(s) {
        if (s < 1) return Math.round(s * 1000) + " ms";
        if (s < 90) return de(s, s < 10 ? 1 : 0) + " s";
        if (s < 5400) return de(s / 60, 1) + " min";
        if (s < 86400) return de(s / 3600, 1) + " h";
        return de(s / 86400, 1) + " Tage";
      }
      function recalc() {
        var gb = gbFromPos(+range.value);
        out.textContent = de(gb, gb < 1 ? 2 : (gb < 10 ? 1 : 0)) + " GB";
        var mbit = gb * 8 * 1024 * 0.94;
        var times = TECHS.map(function (t) { return mbit / (dir === "down" ? t.d : t.u); });
        var max = Math.max.apply(null, times);
        rows.querySelectorAll(".crow").forEach(function (row, i) {
          row.querySelector("i").style.width = clamp(times[i] / max * 100, 1.5, 100) + "%";
          row.querySelector(".t").textContent = fmtTime(times[i]);
        });
      }
      range.addEventListener("input", function () {
        root.querySelectorAll(".presets button").forEach(function (b) { b.classList.remove("is-on"); });
        recalc();
      });
      root.querySelectorAll(".presets button").forEach(function (b) {
        b.addEventListener("click", function () {
          root.querySelectorAll(".presets button").forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on");
          range.value = posFromGb(+b.dataset.gb);
          recalc();
        });
      });
      root.querySelectorAll(".dir-toggle button").forEach(function (b) {
        b.addEventListener("click", function () {
          root.querySelectorAll(".dir-toggle button").forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on"); dir = b.dataset.dir; recalc();
        });
      });
      recalc();
    },

    /* — Quiz — */
    quiz: function (root) {
      var box = root.querySelector("#quizBox");
      var qi = 0, score = 0, locked = false;

      function render() {
        if (qi >= QUIZ.length) {
          box.innerHTML = '<div class="q">Geschafft.</div><p class="score">' + score + " / " + QUIZ.length + "</p>" +
            '<p class="expl">' + (score === QUIZ.length ? "Alles richtig — bereit für die Präsentation."
              : score >= 3 ? "Solide Grundlage. Ein Blick ins Glossar schadet trotzdem nicht."
              : "Die Antworten stehen alle auf diesem Plakat.") + "</p>" +
            '<div class="qfoot"><span></span><button class="qnext" data-act="restart">Noch einmal</button></div>';
          box.querySelector("[data-act]").addEventListener("click", function () { qi = 0; score = 0; render(); });
          return;
        }
        var item = QUIZ[qi];
        locked = false;
        box.innerHTML = '<div class="q">' + (qi + 1) + ". " + item.q + '</div><div class="opts">' +
          item.a.map(function (a, i) { return '<button data-i="' + i + '">' + a + "</button>"; }).join("") +
          '</div><p class="expl"></p><div class="qfoot"><span>Frage ' + (qi + 1) + " von " + QUIZ.length +
          " · " + score + ' richtig</span><button class="qnext" disabled>Weiter</button></div>';

        var next = box.querySelector(".qnext");
        box.querySelectorAll(".opts button").forEach(function (b) {
          b.addEventListener("click", function () {
            if (locked) return;
            locked = true;
            var pick = +b.dataset.i;
            if (pick === item.c) { b.classList.add("ok"); score++; }
            else { b.classList.add("bad"); box.querySelector('.opts button[data-i="' + item.c + '"]').classList.add("ok"); }
            box.querySelector(".expl").textContent = item.e;
            next.disabled = false;
            next.focus();
          });
        });
        next.addEventListener("click", function () { qi++; render(); });
      }
      render();
    },

    /* — Glossar — */
    glossar: function (root) {
      var dl = root.querySelector("#glossary");
      GLOSSAR.forEach(function (g) {
        var d = document.createElement("div");
        var dt = document.createElement("dt"); dt.textContent = g[0];
        var dd = document.createElement("dd"); dd.textContent = g[1];
        d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
      });
      var search = root.querySelector("#glossSearch");
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        dl.querySelectorAll("div").forEach(function (d) {
          d.hidden = q !== "" && d.textContent.toLowerCase().indexOf(q) === -1;
        });
      });
    }
  };

  /* — Modulationsgrafiken — */
  function drawWave(cv) {
    var c = cv.getContext("2d"), w = cv.width, h = cv.height, kind = cv.dataset.wave;
    var CY = "#2EE6FF", MG = "#FF4FB0", AM = "#FFB43C", MT = "#5CF2A6";
    c.clearRect(0, 0, w, h);
    c.lineWidth = 2.2; c.lineJoin = "round";

    if (kind === "nrz") {
      var bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0];
      c.strokeStyle = CY; c.beginPath();
      bits.forEach(function (b, i) {
        var x0 = i / bits.length * w, x1 = (i + 1) / bits.length * w, y = b ? 18 : h - 16;
        i === 0 ? c.moveTo(x0, y) : c.lineTo(x0, y);
        c.lineTo(x1, y);
      });
      c.stroke();
    } else if (kind === "pam4") {
      var lv = [3, 1, 2, 0, 3, 2, 1, 3, 0, 2];
      c.strokeStyle = "rgba(140,164,214,.2)"; c.lineWidth = 1;
      [0, 1, 2, 3].forEach(function (l) {
        var y = h - 16 - l / 3 * (h - 34);
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      });
      c.lineWidth = 2.2; c.strokeStyle = MG; c.beginPath();
      lv.forEach(function (l, i) {
        var x0 = i / lv.length * w, x1 = (i + 1) / lv.length * w, y = h - 16 - l / 3 * (h - 34);
        i === 0 ? c.moveTo(x0, y) : c.lineTo(x0, y);
        c.lineTo(x1, y);
      });
      c.stroke();
    } else if (kind === "qam") {
      c.strokeStyle = "rgba(140,164,214,.25)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w / 2, h - 6); c.moveTo(12, h / 2); c.lineTo(w - 12, h / 2); c.stroke();
      for (var a = 0; a < 4; a++) for (var b2 = 0; b2 < 4; b2++) {
        c.fillStyle = (a + b2) % 2 ? CY : MG;
        c.beginPath(); c.arc(w / 2 + (a - 1.5) * 24, h / 2 + (b2 - 1.5) * 15, 3.2, 0, 6.3); c.fill();
      }
      c.fillStyle = "#8E9BB8"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("I", w - 16, h / 2 - 6); c.fillText("Q", w / 2 + 6, 14);
    } else if (kind === "wdm") {
      [[CY, 0], [MG, 1], [AM, 2], [MT, 3]].forEach(function (pr) {
        c.strokeStyle = pr[0]; c.beginPath();
        for (var x = 0; x <= w; x += 2) {
          var y = h / 2 + Math.sin(x / w * Math.PI * (6 + pr[1] * 3)) * (h / 2 - 18) * 0.5;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      });
    } else if (kind === "tdma") {
      var slots = [CY, MG, AM, CY, MT, MG, CY, AM];
      c.globalAlpha = 0.85;
      slots.forEach(function (col, i) {
        var x0 = i / slots.length * w + 2, bw = w / slots.length - 4, hh = 14 + (i % 3) * 14;
        c.fillStyle = col; c.fillRect(x0, h - 14 - hh, bw, hh);
      });
      c.globalAlpha = 1;
      c.fillStyle = "#8E9BB8"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("ONT 1   ONT 2   ONT 3 …", 6, 13);
    } else if (kind === "duplex") {
      c.strokeStyle = "rgba(140,164,214,.2)"; c.lineWidth = 9; c.lineCap = "round";
      c.beginPath(); c.moveTo(14, h / 2); c.lineTo(w - 14, h / 2); c.stroke();
      c.lineWidth = 2.2; c.lineCap = "butt";
      [[CY, -11, 9, 5], [MG, 12, 6, 4]].forEach(function (cfg) {
        c.strokeStyle = cfg[0]; c.beginPath();
        for (var x = 14; x <= w - 14; x += 2) {
          var y = h / 2 + cfg[1] + Math.sin(x / cfg[2]) * cfg[3];
          x === 14 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      });
      c.fillStyle = "#8E9BB8"; c.font = "10px 'JetBrains Mono', monospace";
      c.fillText("1577 nm ↓", 16, 16); c.fillText("1270 nm ↑", 16, h - 6);
    }
  }
})();
