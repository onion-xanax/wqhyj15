document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progress = document.getElementById('progress');
    const volume = document.getElementById('volume');
    const downloadBtn = document.getElementById('download');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    const gifImage = document.getElementById('gifImage');

    if (gifImage) {
        gifImage.onerror = function () {
            this.style.display = 'none';
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'gif-image';
            fallbackDiv.style.background = 'linear-gradient(135deg, #ffb6c1, #ff8da1)';
            fallbackDiv.style.display = 'flex';
            fallbackDiv.style.alignItems = 'center';
            fallbackDiv.style.justifyContent = 'center';
            fallbackDiv.style.fontSize = '3rem';
            fallbackDiv.style.color = 'white';
            fallbackDiv.textContent = '✨';
            this.parentNode.appendChild(fallbackDiv);
        };
    }

    let audioContext = null;
    let analyser = null;
    let source = null;
    let isPlaying = false;
    let animationId = null;
    let isSeeking = false;

    audio.addEventListener('error', () => {
        alert('Файл music.mp3 не найден');
    });

    function initAudioContext() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    function draw() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 15;

        for (let i = 0; i < bufferLength; i += 3) {
            const value = dataArray[i];
            const angle = (i / bufferLength) * Math.PI * 2;
            const length = (value / 255) * maxRadius;

            const x1 = centerX + Math.cos(angle) * 12;
            const y1 = centerY + Math.sin(angle) * 12;
            const x2 = centerX + Math.cos(angle) * (12 + length);
            const y2 = centerY + Math.sin(angle) * (12 + length);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = `rgba(180, 65, 120, ${value / 255})`;
            ctx.shadowColor = '#b34180';
            ctx.shadowBlur = 10;
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 200, 210, 0.9)';
        ctx.shadowColor = '#b34180';
        ctx.shadowBlur = 15;
        ctx.fill();

        animationId = requestAnimationFrame(draw);
    }

    function stopVisualization() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 200, 210, 0.9)';
        ctx.shadowColor = '#b34180';
        ctx.shadowBlur = 15;
        ctx.fill();
    }

    playPauseBtn.addEventListener('click', async () => {
        if (!audioContext) {
            initAudioContext();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        if (isPlaying) {
            audio.pause();
            stopVisualization();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            try {
                await audio.play();
                if (!animationId) draw();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } catch (e) {
                alert('Ошибка воспроизведения');
            }
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('loadedmetadata', () => {
        progress.max = audio.duration;
        progress.value = 0;
        progress.step = 0.1;
    });

    audio.addEventListener('timeupdate', () => {
        if (!isSeeking && audio.duration) {
            progress.value = audio.currentTime;
        }
    });

    progress.addEventListener('touchstart', () => {
        isSeeking = true;
    });

    progress.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = progress.value;
        }
    });

    progress.addEventListener('touchend', () => {
        isSeeking = false;
    });

    volume.addEventListener('input', () => {
        audio.volume = volume.value;
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = 'music.mp3';
        link.download = 'Монеточка - Твое имя.mp3';
        link.click();
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        stopVisualization();
        progress.value = 0;
    });

    window.addEventListener('load', () => {
        audio.volume = volume.value;
        stopVisualization();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target === progress || e.target === volume) {
            e.stopPropagation();
        }
    }, { passive: false });
});