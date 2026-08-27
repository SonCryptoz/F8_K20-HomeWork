import { showToast } from "../../components/toaster.js";
import { trackState } from "../../components/popup.js";
import { formatDuration } from "../../utils/format.js";

class PlayerManager {
    constructor() {
        this.audio = new Audio();
        this.queue = [];
        this.originalQueue = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 0; // 0: Không lặp, 1: Lặp toàn bộ danh sách, 2: Lặp 1 bài

        // Xử lý lưu trữ âm lượng (để khôi phục sau khi bật/tắt Mute)
        this.lastVolume = 1;
        this.audio.volume = this.lastVolume;

        this.storageKey = null;
        this.pendingSeek = 0;
        this.lastSavedTime = 0;

        this.dom = {};

        this.icons = {
            play: `<svg viewBox="0 0 16 16" class="fill-black" style="width: 16px; height: 16px; margin-left: 1px;"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>`,
            pause: `<svg viewBox="0 0 16 16" class="fill-black" style="width: 16px; height: 16px;"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`,
            volumeHigh: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/><path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"/></svg>`,
            volumeMuted: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 1 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/><path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.65v-13zM3.193 6.15L8.876 2.86v10.28L3.193 9.85A2.139 2.139 0 0 1 3.193 6.15z"/></svg>`
        };

        this.setupAudioListeners();
    }

    /**
     * Khởi tạo và liên kết các thẻ HTML của Player vào biến cache.
     * Hàm này được gọi 1 lần duy nhất lúc load trang (trong main.js).
     */
    init(userId) {
        if (!userId) return;
        this.storageKey = `spotify_player_state_${userId}`;
        this.loadState();
    }

    // ================= LƯU TRẠNG THÁI PLAYER VÀ KHÔI PHỤC TỪ LOCALSTORAGE =================
    saveState() {
        if (!this.storageKey) return;
        const state = {
            queue: this.queue,
            originalQueue: this.originalQueue,
            currentIndex: this.currentIndex,
            isShuffle: this.isShuffle,
            repeatMode: this.repeatMode,
            volume: this.audio.volume,
            currentTime: this.audio.currentTime
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save player state", e);
        }
    }

    loadState() {
        if (!this.storageKey) return;
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const state = JSON.parse(data);
                this.queue = state.queue || [];
                this.originalQueue = state.originalQueue || [];
                this.currentIndex = state.currentIndex !== undefined ? state.currentIndex : -1;
                this.isShuffle = state.isShuffle || false;
                this.repeatMode = state.repeatMode || 0;
                
                if (state.volume !== undefined) {
                    this.audio.volume = state.volume;
                    this.lastVolume = state.volume > 0 ? state.volume : 0.5;
                    this.updateVolumeUI();
                }
                
                if (state.currentTime) {
                    this.pendingSeek = state.currentTime;
                }
                this.updateControlsUI();

                if (this.queue.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
                    this.loadCurrentTrack(false); 
                }
            }
        } catch (e) {
            console.error("Failed to load player state", e);
        }
    }

    initDOM() {
        this.dom.playBtn = document.getElementById("player-play-btn");
        this.dom.prevBtn = document.getElementById("player-prev-btn");
        this.dom.nextBtn = document.getElementById("player-next-btn");
        this.dom.shuffleBtn = document.getElementById("player-shuffle-btn");
        this.dom.repeatBtn = document.getElementById("player-repeat-btn");
        this.dom.progressBar = document.getElementById("player-progress-bar");
        this.dom.mobileThinProgress = document.getElementById("player-mobile-thin-progress");
        this.dom.timeCurrent = document.getElementById("player-time-current");
        this.dom.timeTotal = document.getElementById("player-time-total");
        this.dom.volumeBtn = document.getElementById("player-volume-btn");
        this.dom.volumeSlider = document.getElementById("player-volume-slider");
        this.dom.songName = document.getElementById("player-song-name");
        this.dom.artistName = document.getElementById("player-artist-name");
        this.dom.thumbnail = document.getElementById("player-thumbnail");
        this.dom.likeBtn = document.getElementById("player-track-like-btn");

        this.setupDOMListeners();
        this.updateVolumeUI();
    }

    /**
     * Lắng nghe các sự kiện hệ thống trực tiếp từ thẻ <audio> 
     * (VD: timeupdate, ended, play, pause, error...)
     */
    setupAudioListeners() {
        this.audio.addEventListener("timeupdate", () => {
            // Lưu trạng thái định kỳ mỗi 2 giây để tối ưu hiệu suất, không lưu liên tục gây lag
            if (Math.abs(this.audio.currentTime - this.lastSavedTime) > 2) {
                this.saveState();
                this.lastSavedTime = this.audio.currentTime;
            }

            if (!this.isDraggingProgress && this.dom.progressBar) {
                const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0;
                this.dom.progressBar.value = percent;
                
                // Cập nhật thanh màu xanh (màu nền) chạy theo thanh trượt
                this.dom.progressBar.style.background = `linear-gradient(to right, #1ed760 ${percent}%, rgba(255, 255, 255, 0.3) ${percent}%)`;
                
                if (this.dom.mobileThinProgress) {
                    this.dom.mobileThinProgress.style.width = `${percent}%`;
                }
            }
            if (this.dom.timeCurrent) {
                this.dom.timeCurrent.innerText = formatDuration(this.audio.currentTime); // Gọi hàm formatDuration (đầu vào là giây)
            }
        });

        this.audio.addEventListener("ended", () => {
            if (this.repeatMode === 2) {
                this.dom.repeatBtn.dataset.tooltip = "Disable repeat"; // Chế độ: Lặp lại 1 bài (Phát lại từ đầu khi kết thúc)
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.next();
            }
        });

        this.audio.addEventListener("play", () => {
            this.isPlaying = true;
            this.updatePlayBtnUI();
        });

        this.audio.addEventListener("pause", () => {
            this.isPlaying = false;
            this.updatePlayBtnUI();
        });

        this.audio.addEventListener("loadedmetadata", () => {
            if (this.dom.timeTotal) {
                this.dom.timeTotal.innerText = formatDuration(this.audio.duration);
            }
            
            // Khôi phục thời gian tua nhạc từ localStorage (nếu có)
            if (this.pendingSeek > 0 && this.audio.duration >= this.pendingSeek) {
                this.audio.currentTime = this.pendingSeek;
                this.pendingSeek = 0; // Xóa sau khi dùng
            }
        });
        
        this.audio.addEventListener("error", (e) => {
            console.error("Audio playback error:", e);
            showToast("Cannot play this track", "error");
            this.next(); // Tự động nhảy sang bài tiếp theo nếu bài hiện tại bị lỗi không phát được
        });
    }

    /**
     * Lắng nghe các sự kiện tương tác từ người dùng trên giao diện Thanh Player 
     * (VD: Click nút Play/Pause, Kéo thả thanh trượt...)
     */
    setupDOMListeners() {
        if (this.dom.playBtn) {
            this.dom.playBtn.addEventListener("click", () => this.togglePlay());
        }
        if (this.dom.prevBtn) {
            this.dom.prevBtn.addEventListener("click", () => this.prev());
        }
        if (this.dom.nextBtn) {
            this.dom.nextBtn.addEventListener("click", () => this.next());
        }
        if (this.dom.shuffleBtn) {
            this.dom.shuffleBtn.addEventListener("click", () => this.toggleShuffle());
        }
        if (this.dom.repeatBtn) {
            this.dom.repeatBtn.addEventListener("click", () => this.toggleRepeat());
        }

        // Xử lý thanh tiến trình (Progress Bar)
        if (this.dom.progressBar) {
            this.dom.progressBar.addEventListener("mousedown", () => {
                this.isDraggingProgress = true;
            });
            this.dom.progressBar.addEventListener("input", (e) => {
                const percent = e.target.value;
                this.dom.progressBar.style.background = `linear-gradient(to right, #1ed760 ${percent}%, rgba(255, 255, 255, 0.3) ${percent}%)`;
                if (this.dom.timeCurrent && this.audio.duration) {
                    this.dom.timeCurrent.innerText = formatDuration((percent / 100) * this.audio.duration);
                }
            });
            this.dom.progressBar.addEventListener("change", (e) => {
                this.isDraggingProgress = false;
                const percent = e.target.value;
                if (this.audio.duration) {
                    this.audio.currentTime = (percent / 100) * this.audio.duration;
                }
            });
        }

        // Xử lý thanh âm lượng (Volume Bar)
        if (this.dom.volumeSlider) {
            this.dom.volumeSlider.addEventListener("input", (e) => {
                const vol = e.target.value / 100;
                this.audio.volume = vol;
                if (vol > 0) this.lastVolume = vol;
                this.updateVolumeUI();
                this.saveState(); // Lưu âm lượng
            });
        }
        if (this.dom.volumeBtn) {
            this.dom.volumeBtn.addEventListener("click", () => {
                if (this.audio.volume > 0) {
                    this.audio.volume = 0;
                } else {
                    this.audio.volume = this.lastVolume > 0 ? this.lastVolume : 1;
                }
                this.updateVolumeUI();
                this.saveState();
            });
        }
    }

    // ================= CÁC HÀM API ĐỂ TÍCH HỢP VỚI CÁC TRANG (TRACK, PLAYLIST, ALBUM) =================
    playQueue(tracks, startIndex = 0) {
        if (!tracks || tracks.length === 0) return;
        
        // Chuẩn hóa dữ liệu bài hát từ nhiều nguồn API khác nhau về 1 format chung
        this.originalQueue = tracks.map(t => this.normalizeTrack(t));
        
        if (this.isShuffle) {
            // Nếu đang bật trộn bài: Giữ nguyên bài đầu tiên ở vị trí số 0, sau đó trộn ngẫu nhiên phần còn lại
            const startTrack = this.originalQueue[startIndex];
            const others = this.originalQueue.filter((_, idx) => idx !== startIndex);
            this.queue = [startTrack, ...this.shuffleArray(others)];
            this.currentIndex = 0;
        } else {
            this.queue = [...this.originalQueue];
            this.currentIndex = startIndex;
        }

        this.loadCurrentTrack();
    }
    
    /**
     * Phát duy nhất 1 bài hát.
     */
    playTrack(track) {
        this.playQueue([track], 0);
    }

    /**
     * Chuẩn hóa Object bài hát về 1 format chung để Player dễ xử lý.
     * (Do API trả về Track, Album, Playlist đôi khi có key khác nhau).
     */
    normalizeTrack(t) {
        return {
            id: t.track_id || t.id,
            title: t.track_title || t.title || t.name,
            artist: t.artist_name || t.artist || "Unknown Artist",
            artistId: t.artist_id || (t.artists && t.artists[0] ? t.artists[0].id : ""),
            albumId: t.album_id || t.albumId || "",
            playlistId: t.playlist_id || t.playlistId || "",
            image: t.track_image_url || t.image_url || t.album_cover_image_url || t.artist_image_url || t.cover_image_url || "",
            audio: t.track_audio_url || t.audio_url || t.preview_url
        };
    }

    /**
     * Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle).
     */
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Nạp bài hát hiện tại vào thẻ <audio> và bắt đầu phát nhạc (tùy chọn).
     */
    loadCurrentTrack(autoPlay = true) {
        if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) return;
        const track = this.queue[this.currentIndex];

        if (!track.audio) {
            // Nếu không có audio và đang autoPlay thì mới báo lỗi và next
            if (autoPlay) {
                showToast("Audio preview not available", "error");
                // Tự động bỏ qua bài bị lỗi sau 1.5 giây
                setTimeout(() => this.next(), 1500);
            }
            return;
        }

        // Pause old track explicitly to prevent event race condition
        if (!this.audio.paused) {
            this.audio.pause();
        }

        this.audio.src = track.audio;
        this.audio.load();
        
        if (autoPlay) {
            // Delay play slightly to let the old pause event clear out
            setTimeout(() => {
                this.audio.play().catch(e => console.error("Playback failed:", e));
            }, 50);
        }

        this.updateTrackUI(track);
        this.saveState(); // Cập nhật lại localStorage khi đổi bài
    }

    /**
     * Cập nhật thông tin bài hát (Tên, Ca sĩ, Ảnh bìa) lên giao diện Player bên góc trái.
     */
    updateTrackUI(track) {
        if (this.dom.songName) {
            this.dom.songName.innerHTML = `<a href="/track?id=${track.id}" data-link class="hover:underline text-white">${track.title}</a>`;
        }
        if (this.dom.artistName) {
            this.dom.artistName.innerHTML = track.artistId 
                ? `<a href="/artist?id=${track.artistId}" data-link class="hover:underline text-sp-text-subdued hover:text-white">${track.artist}</a>` 
                : track.artist;
        }
        if (this.dom.thumbnail) {
            if (track.image) {
                this.dom.thumbnail.innerHTML = `<a href="/track?id=${track.id}" data-link class="block w-full h-full"><img src="${track.image}" class="w-full h-full object-cover" /></a>`;
            } else {
                this.dom.thumbnail.innerHTML = `<a href="/track?id=${track.id}" data-link class="flex items-center justify-center w-full h-full"><svg viewBox="0 0 24 24" style="width: 24px; height: 24px;" class="fill-white/50"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg></a>`;
            }
        }
        
        window.dispatchEvent(new CustomEvent("player-state-changed"));
        
        // Cập nhật thông tin cho Nút Like (Trái tim/Tích xanh) trên thanh Player
        if (this.dom.likeBtn) {
            this.dom.likeBtn.dataset.trackId = track.id;
            this.dom.likeBtn.dataset.trackTitle = track.title;
            this.dom.likeBtn.dataset.trackImage = track.image || "";
            this.dom.likeBtn.classList.remove("hidden");
            
            // Kích hoạt cơ chế đồng bộ UI của Nút Like (giúp nó hiện xanh/trắng chính xác)
            trackState.syncUI(track.id, false);
        }
    }

    /**
     * Thay đổi icon Nút Play / Pause tương ứng với trạng thái nhạc.
     */
    updatePlayBtnUI() {
        if (this.dom.playBtn) {
            this.dom.playBtn.innerHTML = this.isPlaying ? this.icons.pause : this.icons.play;
            this.dom.playBtn.dataset.tooltip = this.isPlaying ? "Pause" : "Play";
        }
        window.dispatchEvent(new CustomEvent("player-state-changed"));
    }

    /**
     * Cập nhật giao diện thanh trượt âm lượng và icon Loa.
     */

    updateControlsUI() {
        if (this.dom.shuffleBtn) {
            if (this.isShuffle) {
                this.dom.shuffleBtn.classList.add("text-sp-bg-base");
                this.dom.shuffleBtn.classList.remove("text-sp-text-subdued");
                this.dom.shuffleBtn.dataset.tooltip = "Disable shuffle";
            } else {
                this.dom.shuffleBtn.classList.remove("text-sp-bg-base");
                this.dom.shuffleBtn.classList.add("text-sp-text-subdued");
                this.dom.shuffleBtn.dataset.tooltip = "Enable shuffle";
            }
        }
        if (this.dom.repeatBtn) {
            if (this.repeatMode === 0) {
                this.dom.repeatBtn.dataset.tooltip = "Enable repeat";
                this.dom.repeatBtn.classList.remove("text-sp-bg-base");
                this.dom.repeatBtn.classList.add("text-sp-text-subdued");
                this.dom.repeatBtn.innerHTML = `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.44 13.256a.75.75 0 0 1 0-1.06l2.328-2.328a.75.75 0 1 1 1.06 1.06L9.81 12h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>`;
            } else if (this.repeatMode === 1) {
                this.dom.repeatBtn.dataset.tooltip = "Enable repeat one";
                this.dom.repeatBtn.classList.add("text-sp-bg-base");
                this.dom.repeatBtn.classList.remove("text-sp-text-subdued");
                this.dom.repeatBtn.innerHTML = `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.44 13.256a.75.75 0 0 1 0-1.06l2.328-2.328a.75.75 0 1 1 1.06 1.06L9.81 12h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>`;
            } else if (this.repeatMode === 2) {
                this.dom.repeatBtn.dataset.tooltip = "Disable repeat";
                this.dom.repeatBtn.classList.add("text-sp-bg-base");
                this.dom.repeatBtn.classList.remove("text-sp-text-subdued");
                this.dom.repeatBtn.innerHTML = `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75zM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5z"></path><path d="m8 1.85.77.694H6.095V1.488q1.046-.077 1.507-.385.474-.308.583-.913h1.32V8H8z"></path></svg>`;
            }
        }
    }

    updateVolumeUI() {
        const vol = this.audio.volume;
        if (this.dom.volumeSlider) {
            this.dom.volumeSlider.value = vol * 100;
            this.dom.volumeSlider.style.background = `linear-gradient(to right, #1ed760 ${vol * 100}%, rgba(255, 255, 255, 0.3) ${vol * 100}%)`;
        }
        if (this.dom.volumeBtn) {
            this.dom.volumeBtn.innerHTML = vol === 0 ? this.icons.volumeMuted : this.icons.volumeHigh;
            this.dom.volumeBtn.dataset.tooltip = vol === 0 ? "Unmute" : "Mute";
            if (vol === 0) {
                this.dom.volumeBtn.classList.add("text-sp-bg-base");
            } else {
                this.dom.volumeBtn.classList.remove("text-sp-bg-base");
            }
        }
    }

    /**
     * Chuyển đổi trạng thái Phát / Tạm dừng nhạc.
     */
    togglePlay() {
        if (this.queue.length === 0) return;
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(e => console.error("Playback failed:", e));
        }
    }

    /**
     * Chuyển sang bài hát tiếp theo trong danh sách.
     */
    next() {
        if (this.queue.length === 0) return;
        
        if (this.repeatMode === 1 && this.currentIndex === this.queue.length - 1) {
            // Chế độ: Lặp danh sách (Khi đến bài cuối cùng thì vòng lại bài đầu tiên)
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
            if (this.currentIndex >= this.queue.length) {
                this.currentIndex = this.queue.length - 1;
                this.audio.pause();
                this.audio.currentTime = 0;
                return; // Đã phát đến cuối danh sách và KHÔNG bật chế độ lặp -> Dừng nhạc
            }
        }
        this.loadCurrentTrack();
    }

    /**
     * Quay lại bài hát trước đó.
     */
    prev() {
        if (this.queue.length === 0) return;
        if (this.audio.currentTime > 3) {
            // Nếu bài hát đã phát được hơn 3 giây -> Bấm Prev sẽ phát lại từ đầu thay vì quay về bài trước
            this.audio.currentTime = 0;
            return;
        }
        this.currentIndex--;
        if (this.currentIndex < 0) {
            if (this.repeatMode === 1) {
                this.dom.repeatBtn.dataset.tooltip = "Enable repeat one";
                this.currentIndex = this.queue.length - 1;
            } else {
                this.currentIndex = 0;
            }
        }
        this.loadCurrentTrack();
    }

    /**
     * Bật / Tắt chế độ trộn bài ngẫu nhiên (Shuffle).
     */
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        if (this.dom.shuffleBtn) {
            if (this.isShuffle) {
                this.dom.shuffleBtn.classList.add("text-sp-bg-base");
                this.dom.shuffleBtn.classList.remove("text-sp-text-subdued");
                this.dom.shuffleBtn.dataset.tooltip = "Disable shuffle";
                
                // Thuật toán trộn bài: Lấy bài hiện tại làm đầu tiên, trộn ngẫu nhiên các bài còn lại
                if (this.queue.length > 0) {
                    const currentTrack = this.queue[this.currentIndex];
                    const others = this.originalQueue.filter(t => t.id !== currentTrack.id);
                    this.queue = [currentTrack, ...this.shuffleArray(others)];
                    this.currentIndex = 0;
                }
                this.saveState(); // Lưu trạng thái Shuffle
            } else {
                this.dom.shuffleBtn.classList.remove("text-sp-bg-base");
                this.dom.shuffleBtn.classList.add("text-sp-text-subdued");
                this.dom.shuffleBtn.dataset.tooltip = "Enable shuffle";
                
                // Khôi phục lại danh sách phát gốc ban đầu (tắt trộn bài)
                if (this.queue.length > 0) {
                    const currentTrack = this.queue[this.currentIndex];
                    this.queue = [...this.originalQueue];
                    this.currentIndex = this.queue.findIndex(t => t.id === currentTrack.id);
                    if (this.currentIndex === -1) this.currentIndex = 0;
                }
                this.saveState(); // Lưu trạng thái Tắt Shuffle
            }
        }
        window.dispatchEvent(new CustomEvent("player-state-changed"));
        window.dispatchEvent(new CustomEvent("player-state-changed"));
    }

    /**
     * Chuyển đổi qua lại giữa 3 chế độ lặp: 
     * 0 (Không lặp) -> 1 (Lặp danh sách) -> 2 (Lặp 1 bài)
     */
    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        if (this.dom.repeatBtn) {
            if (this.repeatMode === 0) {
                this.dom.repeatBtn.dataset.tooltip = "Enable repeat";
                this.dom.repeatBtn.classList.remove("text-sp-bg-base");
                this.dom.repeatBtn.classList.add("text-sp-text-subdued");
                // Đưa icon Repeat về lại màu xám mặc định
                this.dom.repeatBtn.innerHTML = `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.44 13.256a.75.75 0 0 1 0-1.06l2.328-2.328a.75.75 0 1 1 1.06 1.06L9.81 12h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>`;
            } else if (this.repeatMode === 1) {
                this.dom.repeatBtn.dataset.tooltip = "Enable repeat one";
                this.dom.repeatBtn.classList.add("text-sp-bg-base");
                this.dom.repeatBtn.classList.remove("text-sp-text-subdued");
            } else if (this.repeatMode === 2) {
                this.dom.repeatBtn.dataset.tooltip = "Disable repeat";
                this.dom.repeatBtn.classList.add("text-sp-bg-base");
                this.dom.repeatBtn.innerHTML = `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75zM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5z"></path><path d="m8 1.85.77.694H6.095V1.488q1.046-.077 1.507-.385.474-.308.583-.913h1.32V8H8z"></path></svg>`;
            }
            this.saveState(); // Lưu trạng thái Repeat
        }
    }
}

export const player = new PlayerManager();
