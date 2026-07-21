import * as THREE from 'three';
import { SceneManager } from './src/engine/scene.js';
import { GalaxyGenerator } from './src/engine/galaxy.js';
import { ParticleController } from './src/engine/particles.js';
import { DatabaseOrchestrator } from './src/data/orchestrator.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Core platform layers
    const orchestrator = new DatabaseOrchestrator();
    const sceneManager = new SceneManager('canvas-container');
    const galaxy = new GalaxyGenerator(sceneManager.scene);
    const particleController = new ParticleController(sceneManager.scene, galaxy);

    // 2. DOM Selectors
    const activeNodesCounter = document.getElementById('active-nodes-counter');
    const ingestionRate = document.getElementById('ingestion-rate');
    const threatLvl = document.getElementById('threat-lvl');
    
    const nodeChips = document.querySelectorAll('.node-chip');
    const minimalDbFocus = document.getElementById('minimal-db-focus');
    
    // Sliders
    const simRateSlider = document.getElementById('sim-rate-slider');
    const simGravitySlider = document.getElementById('sim-gravity-slider');
    const simSpeedSlider = document.getElementById('sim-speed-slider');
    
    const valRate = document.getElementById('val-rate');
    const valGravity = document.getElementById('val-gravity');
    const valSpeed = document.getElementById('val-speed');
    
    // Action Triggers
    const btnBurst = document.getElementById('btn-burst');
    const btnThreat = document.getElementById('btn-threat');
    
    // Gauges SVG paths
    const gaugeCpu = document.getElementById('gauge-cpu');
    const gaugeRam = document.getElementById('gauge-ram');
    const gaugeLatency = document.getElementById('gauge-latency');
    const gaugeCache = document.getElementById('gauge-cache');
    
    const txtCpu = document.getElementById('txt-cpu');
    const txtRam = document.getElementById('txt-ram');
    const txtLatency = document.getElementById('txt-latency');
    const txtCache = document.getElementById('txt-cache');
    
    // AI panel & overwatch
    const aiChatContainer = document.getElementById('ai-chat-container');
    const suggestionsBox = document.getElementById('suggestions-box');
    const terminalFeed = document.getElementById('terminal-feed');
    const btnClearTerminal = document.getElementById('btn-clear-terminal');
    
    const anomProp = document.getElementById('anom-prop');
    const failProb = document.getElementById('fail-prob');
    const threatBlip = document.getElementById('threat-blip');
    const threatIndicatorBottom = document.getElementById('threat-indicator-bottom');
    const globalSearch = document.getElementById('global-search');

    // Camera Switchers
    const btnEnvGalaxy = document.getElementById('btn-env-galaxy');
    const btnEnvConst = document.getElementById('btn-env-constellation');
    const btnEnvVortex = document.getElementById('btn-env-vortex');
    const btnCamSpin = document.getElementById('btn-cam-spin');
    const btnCamAlign = document.getElementById('btn-cam-align');

    // 3. States & Configurations
    let clock = new THREE.Clock();
    let logCount = 0;
    const maxLogs = 50;
    
    if (threatIndicatorBottom) threatIndicatorBottom.style.opacity = '0.3';

    // 4. GSAP Immersive Smooth Camera Focus Alignment
    function animateCameraToNode(targetPos) {
        if (window.gsap) {
            sceneManager.autoRotate = false;
            if (btnCamSpin) btnCamSpin.classList.remove('active');

            gsap.to(sceneManager.controls.target, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: 1.6,
                ease: "power3.out",
                onUpdate: () => sceneManager.controls.update()
            });

            gsap.to(sceneManager.camera.position, {
                x: targetPos.x,
                y: targetPos.y + 40,
                z: targetPos.z + 65,
                duration: 1.8,
                ease: "power3.out"
            });
        } else {
            sceneManager.controls.target.copy(targetPos);
            sceneManager.camera.position.set(targetPos.x, targetPos.y + 40, targetPos.z + 65);
            sceneManager.controls.update();
        }

        // Trigger flash in central neural core light
        sceneManager.coreLight.color.setHex(0x8b5cf6);
        setTimeout(() => {
            sceneManager.coreLight.color.setHex(0x06b6d4);
        }, 900);
    }

    // Node Tree selectors (Legacy layout)
    if (nodeChips.length > 0) {
        nodeChips.forEach((chip) => {
            chip.addEventListener('click', () => {
                nodeChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const dbId = chip.getAttribute('data-db');
                orchestrator.setActiveDatabase(dbId);
                galaxy.setActiveDatabase(dbId);

                const pos = galaxy.getNodePosition(dbId);
                animateCameraToNode(pos);

                const categoryHeader = chip.closest('.tree-category').querySelector('.category-header');
                const catType = categoryHeader.getAttribute('data-category');
                const diagnosis = orchestrator.getAiDiagnosis(catType);
                
                triggerAiMessage(`Aligned neural focus onto database planet [${chip.textContent.toUpperCase()}]. Active diagnostic check: "${diagnosis}"`);
            });
        });
    }

    // Minimal Select Dropdown focus (Page 1)
    if (minimalDbFocus) {
        minimalDbFocus.addEventListener('change', () => {
            const dbId = minimalDbFocus.value;
            orchestrator.setActiveDatabase(dbId);
            galaxy.setActiveDatabase(dbId);

            const pos = galaxy.getNodePosition(dbId);
            animateCameraToNode(pos);
        });
    }

    // 5. Semantic Search Engine
    if (globalSearch) {
        globalSearch.addEventListener('keyup', () => {
            const query = globalSearch.value.toLowerCase().trim();
            nodeChips.forEach((chip) => {
                const name = chip.textContent.toLowerCase();
                if (name.includes(query)) {
                    chip.style.display = 'block';
                    if (query !== '') {
                        chip.style.borderColor = 'var(--color-violet)';
                        chip.style.boxShadow = 'var(--glow-violet)';
                    } else {
                        chip.style.borderColor = '';
                        chip.style.boxShadow = '';
                    }
                } else {
                    chip.style.display = 'none';
                }
            });
        });
    }

    // 6. Sliders Bindings
    if (simRateSlider) {
        simRateSlider.addEventListener('input', () => {
            const val = parseInt(simRateSlider.value);
            if (valRate) valRate.textContent = `${val}x`;
            orchestrator.setBurstMultiplier(val);
        });
    }

    if (simGravitySlider) {
        simGravitySlider.addEventListener('input', () => {
            const val = parseInt(simGravitySlider.value) / 10;
            if (valGravity) valGravity.textContent = `${val.toFixed(1)}x`;
            
            const scale = 0.5 + val * 0.5;
            galaxy.coreContainer.scale.set(scale, scale, scale);
        });
    }

    if (simSpeedSlider) {
        simSpeedSlider.addEventListener('input', () => {
            const val = parseInt(simSpeedSlider.value);
            if (valSpeed) valSpeed.textContent = `${val}%`;
        });
    }

    // 7. Action Injections
    if (btnBurst) {
        btnBurst.addEventListener('click', () => {
            const burstCount = 140;
            triggerAiMessage("CRITICAL ACTION: Triggered universal transaction ingestion burst. Multi-cloud data highways active.");

            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    const mockEv = orchestrator.createSingleEvent();
                    const speed = simSpeedSlider ? parseInt(simSpeedSlider.value) : 100;
                    const speedMod = speed / 100;
                    mockEv.speed *= (1.5 * speedMod);
                    particleController.spawnParticle(mockEv);
                    appendTerminalLog(mockEv.message, mockEv.type);

                    // Periodically spawn visual organic shockwaves on towers
                    if (i % 6 === 0) {
                        const nodesKeys = Object.keys(galaxy.nodesList);
                        if (nodesKeys.length > 0) {
                            const dbId = nodesKeys[mockEv.nodeIndex % nodesKeys.length];
                            galaxy.spawnShockwave(dbId);
                        }
                    }
                }, i * 14);
            }
        });
    }

    if (btnThreat) {
        btnThreat.addEventListener('click', () => {
            orchestrator.setThreatLevel(75);
            if (threatLvl) {
                threatLvl.textContent = "81.42% INCIDENT";
                threatLvl.className = "val red-text";
            }

            if (anomProp) {
                anomProp.textContent = "CRITICAL SQL EXFILTRATION ATTEMPT";
                anomProp.className = "val red-text";
            }
            if (failProb) {
                failProb.textContent = "41.20% INCIDENT";
                failProb.className = "val red-text";
            }

            if (threatBlip) threatBlip.style.display = "block";
            if (threatIndicatorBottom) {
                threatIndicatorBottom.style.opacity = "1.0";
                threatIndicatorBottom.querySelector('.ind-dot').classList.add('pulsing-violet');
            }

            // Transition concentric security defense walls to flashing Coral Red warning state!
            galaxy.setThreatState(true);

            triggerAiMessage("INFRARED WARNING: Detected suspicious brute-force injection payload routing to relational sector. Firewall alert triggered.");

            const spikes = 50;
            for (let i = 0; i < spikes; i++) {
                setTimeout(() => {
                    const threatEv = orchestrator.createThreatAnomalyEvent();
                    particleController.spawnParticle(threatEv);
                    appendTerminalLog(threatEv.message, threatEv.type);
                }, i * 35);
            }
        });
    }

    // Suggestion chips
    if (suggestionsBox) {
        suggestionsBox.addEventListener('click', (e) => {
            if (e.target.classList.contains('sug-btn')) {
                const action = e.target.getAttribute('data-action');
                if (action === 'scale') {
                    triggerAiMessage("Autopilot: Scaled Redis caching replica layers to 3 active cluster points. Latency index reduced.");
                }
                else if (action === 'index') {
                    triggerAiMessage("Autopilot: Initiating automated indexing consolidation. Mapped database clusters successfully.");
                }
                else {
                    triggerAiMessage("Self-Healing active: Successfully quarantined suspicious traffic packets. Restored cluster firewalls. Threat levels cleared.");
                    
                    orchestrator.setThreatLevel(0);
                    if (threatLvl) {
                        threatLvl.textContent = "0.00%";
                        threatLvl.className = "val";
                    }
                    if (anomProp) {
                        anomProp.textContent = "ZERO DETECTED";
                        anomProp.className = "val";
                    }
                    if (failProb) {
                        failProb.textContent = "0.02%";
                        failProb.className = "val violet-text";
                    }
                    
                    if (threatBlip) threatBlip.style.display = "none";
                    if (threatIndicatorBottom) {
                        threatIndicatorBottom.style.opacity = "0.3";
                        threatIndicatorBottom.querySelector('.ind-dot').classList.remove('pulsing-violet');
                    }

                    // Reset concentric security shields back to stable green!
                    galaxy.setThreatState(false);
                }
            }
        });
    }

    if (btnClearTerminal) {
        btnClearTerminal.addEventListener('click', () => {
            terminalFeed.innerHTML = '';
            logCount = 0;
        });
    }

    // 8. Camera View Modes
    if (btnEnvGalaxy) {
        const camBtns = [btnEnvGalaxy, btnEnvConst, btnEnvVortex];
        camBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    camBtns.forEach(b => { if (b) b.classList.remove('active'); });
                    btn.classList.add('active');

                    const view = btn.getAttribute('data-env');
                    galaxy.setViewMode(view);
                    particleController.clearAll();
                });
            }
        });
    }

    if (btnCamSpin) {
        btnCamSpin.addEventListener('click', () => {
            const active = btnCamSpin.classList.toggle('active');
            sceneManager.setAutoRotate(active);
        });
        btnCamSpin.classList.add('active');
    }

    if (btnCamAlign) {
        btnCamAlign.addEventListener('click', () => {
            sceneManager.resetCamera();
        });
    }

    // 9. Telemetry Updates
    function updateHUDTelemetry(metrics) {
        const maxOffset = 238.7;

        // CPU
        if (gaugeCpu) {
            const cpuOffset = maxOffset - (metrics.cpu / 100) * maxOffset;
            gaugeCpu.style.strokeDashoffset = cpuOffset;
            txtCpu.textContent = `${metrics.cpu}%`;
        }

        // Memory Heat
        if (gaugeRam) {
            const ramOffset = maxOffset - (metrics.ram / 100) * maxOffset;
            gaugeRam.style.strokeDashoffset = ramOffset;
            txtRam.textContent = `${metrics.ram}%`;
        }

        // Latency
        if (gaugeLatency) {
            const normLatency = Math.min(100, (metrics.latency / 4.0) * 100);
            const latOffset = maxOffset - (normLatency / 100) * maxOffset;
            gaugeLatency.style.strokeDashoffset = latOffset;
            txtLatency.textContent = `${metrics.latency}ms`;
        }

        // Cache
        if (gaugeCache) {
            const cacheOffset = maxOffset - (metrics.cache / 100) * maxOffset;
            gaugeCache.style.strokeDashoffset = cacheOffset;
            txtCache.textContent = `${metrics.cache}%`;
        }

        // Ingestion rate
        if (ingestionRate) {
            const iops = Math.round(metrics.cpu * 328);
            ingestionRate.textContent = `${iops.toLocaleString()} ev/s`;
        }
    }

    function appendTerminalLog(msg, type) {
        if (!terminalFeed) return;
        const cLine = document.createElement('div');
        cLine.className = `c-line ${type}`;

        const timestamp = new Date().toLocaleTimeString().split(' ')[0];
        cLine.textContent = `[${timestamp}] ${msg}`;

        terminalFeed.appendChild(cLine);
        terminalFeed.scrollTop = terminalFeed.scrollHeight;

        logCount++;
        if (logCount > maxLogs) {
            terminalFeed.removeChild(terminalFeed.firstChild);
            logCount--;
        }
    }

    function triggerAiMessage(text) {
        if (!aiChatContainer) return;
        const msg = document.createElement('div');
        msg.className = "chat-msg";

        msg.innerHTML = `
            <span class="sender violet-text">✦ PLATFORM COPILOT</span>
            <p class="content">${text}</p>
        `;
        aiChatContainer.appendChild(msg);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
    }

    // AI periodic scans
    let lastDiagTime = 0;
    function runAiDiagnostics(time) {
        if (!aiChatContainer) return;
        if (time - lastDiagTime > 15) {
            lastDiagTime = time;
            const categories = ['relational', 'nosql', 'realtime', 'vector', 'warehouse'];
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            const diag = orchestrator.getAiDiagnosis(randomCat);
            triggerAiMessage(`Autonomous telemetry sweep: "${diag}"`);
        }
    }

    // 10. Main platform anim loop
    let spawnTimer = 0;

    function animate(time) {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);
        const sysTime = time * 0.001;

        // update simulated metrics
        const metrics = orchestrator.tick(delta);
        updateHUDTelemetry(metrics);

        // update threejs objects
        sceneManager.update(delta);
        galaxy.update(delta);

        // update moving particles
        particleController.update(delta);

        // spawn particles
        spawnTimer += delta;
        const speed = simSpeedSlider ? parseInt(simSpeedSlider.value) : 100;
        const speedMod = speed / 100;
        const multiplier = orchestrator.burstMultiplier;
        const spawnFrequency = 1.0 / (8 * multiplier * speedMod);

        if (spawnTimer >= spawnFrequency) {
            spawnTimer = 0;
            const events = orchestrator.generateEvents();
            events.forEach((ev) => {
                particleController.spawnParticle(ev);
                appendTerminalLog(ev.message, ev.type);

                // Trigger beautiful expanding organic shockwaves upon database ingestion events!
                const nodesKeys = Object.keys(galaxy.nodesList);
                if (nodesKeys.length > 0) {
                    const dbId = nodesKeys[ev.nodeIndex % nodesKeys.length];
                    galaxy.spawnShockwave(dbId);
                }
            });
        }

        // periodic copilot updates
        runAiDiagnostics(sysTime);
    }

    requestAnimationFrame(animate);
});
