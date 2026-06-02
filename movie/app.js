/* -------------------------------------------------------------
 * Antigravity Premium Screen Recorder Core Engine (app.js)
 * Implements native MediaRecorder and getDisplayMedia APIs.
 * Supports dual-audio track mixing (System Audio + Microphone),
 * precise elapsed timer, dynamically estimated record size, 
 * webm container generation, and full-spectrum error handling.
 * ------------------------------------------------------------- */

class AntigravityScreenRecorder {
    constructor() {
        // Core Web APIs States
        this.screenStream = null;
        this.micStream = null;
        this.mixedStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.audioContext = null;
        
        // Timer and Specs States
        this.startTime = null;
        this.elapsedSeconds = 0;
        this.timerInterval = null;
        this.estimatedSizeInterval = null;
        this.currentStatus = 'idle'; // idle, ready, recording, paused

        // DOM Elements Caching
        this.initDOMElements();
        // Event Binding
        this.bindEvents();
    }

    initDOMElements() {
        // Control buttons
        this.btnPrepare = document.getElementById('btn-prepare-stream');
        this.btnStart = document.getElementById('btn-start-record');
        this.btnPause = document.getElementById('btn-pause-record');
        this.btnStop = document.getElementById('btn-stop-record');
        this.btnReset = document.getElementById('btn-reset');
        
        // Displays and Panels
        this.viewport = document.getElementById('recording-viewport');
        this.videoPreview = document.getElementById('preview-video');
        this.idlePlaceholder = document.getElementById('viewport-idle-state');
        this.statusFloatingOverlay = document.getElementById('status-floating-overlay');
        this.statusBadge = document.getElementById('status-badge');
        this.timerDisplay = document.getElementById('recording-timer');
        this.infoCard = document.getElementById('rec-info-card');
        this.statsResolution = document.getElementById('stat-resolution');
        this.statsFps = document.getElementById('stat-fps');
        this.statsSize = document.getElementById('stat-size');
        this.downloadPanel = document.getElementById('download-panel');
        this.downloadLink = document.getElementById('link-download');
        
        // Settings Selectors
        this.selectQuality = document.getElementById('video-quality');
        this.selectFps = document.getElementById('video-fps');
        this.toggleMic = document.getElementById('toggle-mic');
        this.toggleSysAudio = document.getElementById('toggle-system-audio');
        
        // Error Banner
        this.errorBanner = document.getElementById('error-banner');
        this.errorMessage = document.getElementById('error-message');
        this.btnCloseError = document.getElementById('btn-close-error');
    }

    bindEvents() {
        // Recording flow action bindings
        this.btnPrepare.addEventListener('click', () => this.prepareCaptureStream());
        this.btnStart.addEventListener('click', () => this.startRecording());
        this.btnPause.addEventListener('click', () => this.togglePauseRecording());
        this.btnStop.addEventListener('click', () => this.stopRecording());
        this.btnReset.addEventListener('click', () => this.resetRecorder());
        this.btnCloseError.addEventListener('click', () => this.hideError());
        
        // Stop stream prematurely if the user clicks "Stop Sharing" on the browser native bar
        window.addEventListener('beforeunload', () => this.stopAllTracks());
    }

    /**
     * 1. 캡처 스트림 확보 (getDisplayMedia & getUserMedia)
     */
    async prepareCaptureStream() {
        this.hideError();
        this.stopAllTracks();
        
        const idealResolution = this.selectQuality.value;
        const targetFps = parseInt(this.selectFps.value) || 30;
        const wantMic = this.toggleMic.checked;
        const wantSysAudio = this.toggleSysAudio.checked;

        // Constraint spec matching
        let displayConstraints = {
            video: {
                frameRate: { ideal: targetFps }
            },
            audio: wantSysAudio ? true : false
        };

        if (idealResolution === 'max') {
            displayConstraints.video.width = { ideal: 1920 };
            displayConstraints.video.height = { ideal: 1080 };
        } else if (idealResolution === 'high') {
            displayConstraints.video.width = { ideal: 1280 };
            displayConstraints.video.height = { ideal: 720 };
        }

        try {
            // A. Get Display Stream (Screen Capture)
            this.screenStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);
            
            // B. Prepare Audio Mixing (System Audio + Microphone Audio)
            const audioTracks = [];
            const screenAudioTracks = this.screenStream.getAudioTracks();
            
            // Microphone stream acquisition
            if (wantMic) {
                try {
                    this.micStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    const micAudioTracks = this.micStream.getAudioTracks();
                    if (micAudioTracks.length > 0) {
                        audioTracks.push(micAudioTracks[0]);
                    }
                } catch (micErr) {
                    console.warn('[Recorder] 마이크 권한 거부 또는 오디오 입력 장치 없음.', micErr);
                    this.showError('마이크 권한을 획득할 수 없어, 목소리 제외 화면 전용으로만 준비를 계속합니다.');
                }
            }

            // C. Mix audio if multiple sources exist (Context mixing)
            if (screenAudioTracks.length > 0 && audioTracks.length > 0) {
                // Mix system audio track & microphone track into one stream node to prevent audio lag
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const mixedAudioDest = this.audioContext.createMediaStreamDestination();
                
                const sysSource = this.audioContext.createMediaStreamSource(new MediaStream([screenAudioTracks[0]]));
                const micSource = this.audioContext.createMediaStreamSource(new MediaStream([audioTracks[0]]));
                
                sysSource.connect(mixedAudioDest);
                micSource.connect(mixedAudioDest);
                
                const mixedAudioTrack = mixedAudioDest.stream.getAudioTracks()[0];
                this.mixedStream = new MediaStream([
                    this.screenStream.getVideoTracks()[0],
                    mixedAudioTrack
                ]);
            } else if (screenAudioTracks.length > 0) {
                // Only system audio
                this.mixedStream = new MediaStream([
                    this.screenStream.getVideoTracks()[0],
                    screenAudioTracks[0]
                ]);
            } else if (audioTracks.length > 0) {
                // Only mic audio
                this.mixedStream = new MediaStream([
                    this.screenStream.getVideoTracks()[0],
                    audioTracks[0]
                ]);
            } else {
                // No audio, pure video stream
                this.mixedStream = new MediaStream([
                    this.screenStream.getVideoTracks()[0]
                ]);
            }

            // D. Feed Video Preview Object
            this.videoPreview.srcObject = this.mixedStream;
            this.videoPreview.muted = true; // Preview muted to prevent acoustic feedback loop
            this.videoPreview.classList.remove('hidden');
            this.idlePlaceholder.classList.add('hidden');
            
            // Adjust UI States
            this.currentStatus = 'ready';
            this.updateUIStatus();
            
            // Dynamically show specs
            const videoTrack = this.screenStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            this.statsResolution.innerHTML = `<i class="fa-solid fa-expand"></i> 해상도: ${settings.width || '1280'} x ${settings.height || '720'}`;
            this.statsFps.innerHTML = `<i class="fa-solid fa-gauge-high"></i> 프레임: ${settings.frameRate ? Math.round(settings.frameRate) : targetFps} FPS`;
            this.statsSize.innerHTML = `<i class="fa-solid fa-hard-drive"></i> 추정 용량: 0.0 MB`;

            // Detect native "Stop Sharing" click
            videoTrack.onended = () => {
                console.log('[Recorder] 사용자가 브라우저 UI에서 공유 중단을 클릭함.');
                this.stopRecording();
                this.resetRecorder();
            };

        } catch (err) {
            console.error('[Recorder] 스트림 준비 과정 예외 발생:', err);
            if (err.name === 'NotAllowedError') {
                this.showError('화면 공유 권한이 거부되었거나 사용자가 선택 취소하였습니다.');
            } else {
                this.showError(`스트림 준비 중 실패: ${err.message || err}`);
            }
            this.resetRecorder();
        }
    }

    /**
     * 2. 화면 녹화 시작 (Start MediaRecorder)
     */
    startRecording() {
        if (this.currentStatus !== 'ready' || !this.mixedStream) {
            this.showError('먼저 [화면 선택 및 준비] 과정을 완료해 주세요.');
            return;
        }

        this.recordedChunks = [];
        
        // Select mimeType codec automatically based on compatibility
        const supportedTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4'
        ];

        let chosenMime = '';
        for (const type of supportedTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                chosenMime = type;
                break;
            }
        }

        console.log(`[Recorder] 최적의 호환 코덱 선택: ${chosenMime}`);
        
        try {
            this.mediaRecorder = new MediaRecorder(this.mixedStream, { mimeType: chosenMime });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };

            // Start recording and capture chunks every 1 second (1000ms timeslices)
            this.mediaRecorder.start(1000);
            
            // Set Timers
            this.startTime = Date.now();
            this.elapsedSeconds = 0;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this.estimatedSizeInterval = setInterval(() => this.updateEstimatedSize(), 2000);
            
            // Adjust UI States
            this.currentStatus = 'recording';
            this.updateUIStatus();
            this.hideError();

        } catch (recorderErr) {
            console.error('[Recorder] MediaRecorder 객체 생성 및 구동 실패:', recorderErr);
            this.showError(`녹화 가동 중 장애: ${recorderErr.message || recorderErr}`);
            this.resetRecorder();
        }
    }

    /**
     * 3. 일시정지 / 재개 토글 (Pause / Resume)
     */
    togglePauseRecording() {
        if (!this.mediaRecorder || this.currentStatus !== 'recording' && this.currentStatus !== 'paused') return;

        if (this.currentStatus === 'recording') {
            this.mediaRecorder.pause();
            clearInterval(this.timerInterval);
            clearInterval(this.estimatedSizeInterval);
            this.currentStatus = 'paused';
        } else {
            this.mediaRecorder.resume();
            this.startTime = Date.now() - (this.elapsedSeconds * 1000);
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this.estimatedSizeInterval = setInterval(() => this.updateEstimatedSize(), 2000);
            this.currentStatus = 'recording';
        }
        this.updateUIStatus();
    }

    /**
     * 4. 녹화 수동 종료 (Stop Stream & Trigger blob generation)
     */
    stopRecording() {
        if (!this.mediaRecorder || (this.currentStatus !== 'recording' && this.currentStatus !== 'paused')) return;

        try {
            this.mediaRecorder.stop();
        } catch (err) {
            console.error('[Recorder] MediaRecorder stop 예외 무시:', err);
        }

        // Clean up stream timers immediately
        clearInterval(this.timerInterval);
        clearInterval(this.estimatedSizeInterval);
        this.stopAllTracks();
    }

    /**
     * 5. 녹화 중지 처리 콜백 (Assemble Blob and Create Download URL)
     */
    handleRecordingStop() {
        if (this.recordedChunks.length === 0) {
            this.showError('저장된 녹화 비디오 조각이 존재하지 않습니다. 녹화 대상을 확인해 주세요.');
            this.resetRecorder();
            return;
        }

        // Assemble chunks
        const blob = new Blob(this.recordedChunks, { type: this.recordedChunks[0].type });
        const videoUrl = URL.createObjectURL(blob);
        
        // Show video playback preview on completion
        this.videoPreview.srcObject = null;
        this.videoPreview.src = videoUrl;
        this.videoPreview.controls = true;
        this.videoPreview.muted = false; // Enable audio playback for verification
        
        // Setup final download timestamp-based file name
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        
        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const finalFileName = `Screen_Record_${year}${month}${date}_${hour}${min}.${extension}`;
        
        this.downloadLink.href = videoUrl;
        this.downloadLink.download = finalFileName;
        this.downloadLink.innerHTML = `<i class="fa-solid fa-download"></i> 녹화 영상 다운로드 (${extension.toUpperCase()})`;
        
        // Show download panel
        this.downloadPanel.classList.remove('hidden');
        
        this.currentStatus = 'idle';
        this.updateUIStatus();
    }

    /**
     * 6. 타이머 및 추정 크기 연산자
     */
    updateTimer() {
        this.elapsedSeconds++;
        const hrs = String(Math.floor(this.elapsedSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((this.elapsedSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
        this.timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
    }

    updateEstimatedSize() {
        // High quality (720p/30fps) uses roughly 0.45MB per second, Full HD uses about 0.85MB per second.
        const idealResolution = this.selectQuality.value;
        const targetFps = parseInt(this.selectFps.value) || 30;
        
        let multiplier = 0.35; // Base Standard
        if (idealResolution === 'max') {
            multiplier = 0.85 * (targetFps / 30);
        } else if (idealResolution === 'high') {
            multiplier = 0.48 * (targetFps / 30);
        }

        const estBytes = this.elapsedSeconds * multiplier;
        this.statsSize.innerHTML = `<i class="fa-solid fa-hard-drive"></i> 추정 용량: ${estBytes.toFixed(1)} MB`;
    }

    /**
     * 7. 리셋 기능 및 리소스 자원 클리닝
     */
    resetRecorder() {
        this.stopAllTracks();
        clearInterval(this.timerInterval);
        clearInterval(this.estimatedSizeInterval);
        
        this.recordedChunks = [];
        this.currentStatus = 'idle';
        this.elapsedSeconds = 0;
        
        // Clean Video Source Object
        this.videoPreview.srcObject = null;
        this.videoPreview.src = '';
        this.videoPreview.controls = false;
        this.videoPreview.classList.add('hidden');
        this.idlePlaceholder.classList.remove('hidden');
        
        // Reset metrics
        this.timerDisplay.textContent = '00:00:00';
        this.statsResolution.innerHTML = `<i class="fa-solid fa-expand"></i> 해상도: -`;
        this.statsFps.innerHTML = `<i class="fa-solid fa-gauge-high"></i> 프레임: -`;
        this.statsSize.innerHTML = `<i class="fa-solid fa-hard-drive"></i> 추정 용량: 0 MB`;
        
        this.downloadPanel.classList.add('hidden');
        this.updateUIStatus();
    }

    stopAllTracks() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        if (this.mixedStream) {
            this.mixedStream.getTracks().forEach(track => track.stop());
            this.mixedStream = null;
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    /**
     * 8. UI 상태 전환 머신
     */
    updateUIStatus() {
        // Reset classes
        this.viewport.className = 'preview-viewport';
        this.infoCard.className = 'rec-info-panel';
        this.statusFloatingOverlay.classList.add('hidden');
        this.statusBadge.className = 'status-indicator';
        
        // Base actions setup
        this.btnPrepare.classList.add('hidden');
        this.btnStart.classList.add('hidden');
        this.btnPause.classList.add('hidden');
        this.btnStop.classList.add('hidden');
        this.btnReset.classList.add('hidden');

        // Setting input active status lock
        const settingsActive = (this.currentStatus === 'idle');
        this.selectQuality.disabled = !settingsActive;
        this.selectFps.disabled = !settingsActive;
        this.toggleMic.disabled = !settingsActive;
        this.toggleSysAudio.disabled = !settingsActive;

        switch (this.currentStatus) {
            case 'idle':
                this.btnPrepare.classList.remove('hidden');
                this.statusBadge.classList.add('idle');
                this.statusBadge.textContent = '● 대기 중';
                break;
                
            case 'ready':
                this.viewport.classList.add('ready-glow');
                this.btnStart.classList.remove('hidden');
                this.btnReset.classList.remove('hidden');
                this.statusBadge.classList.add('ready');
                this.statusBadge.textContent = '● 준비 완료';
                break;
                
            case 'recording':
                this.viewport.classList.add('recording-glow');
                this.infoCard.classList.add('recording');
                this.statusFloatingOverlay.classList.remove('hidden');
                
                this.btnPause.innerHTML = `<i class="fa-solid fa-pause"></i> 일시정지`;
                this.btnPause.className = 'btn btn-warn';
                
                this.btnPause.classList.remove('hidden');
                this.btnStop.classList.remove('hidden');
                
                this.statusBadge.classList.add('recording');
                this.statusBadge.textContent = '● 녹화 중';
                break;
                
            case 'paused':
                this.viewport.classList.add('recording-glow');
                this.infoCard.classList.add('recording');
                
                this.btnPause.innerHTML = `<i class="fa-solid fa-play"></i> 녹화 재개`;
                this.btnPause.className = 'btn btn-primary';
                
                this.btnPause.classList.remove('hidden');
                this.btnStop.classList.remove('hidden');
                
                this.statusBadge.classList.add('paused');
                this.statusBadge.textContent = '● 일시정지';
                break;
        }
    }

    /**
     * 9. 에러 배포 시스템
     */
    showError(msg) {
        this.errorMessage.textContent = msg;
        this.errorBanner.classList.remove('hidden');
        // Hide automatically after 8 seconds
        setTimeout(() => this.hideError(), 8000);
    }

    hideError() {
        this.errorBanner.classList.add('hidden');
    }
}

// Instantiate Premium Recorder on Load
window.addEventListener('DOMContentLoaded', () => {
    window.AntigravityRecorderApp = new AntigravityScreenRecorder();
});
