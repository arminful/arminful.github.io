const musicFileInput = document.getElementById('musicFile');
const fileNameDisplay = document.getElementById('file-name');
const imageFileInput = document.getElementById('imageFile');
const imageNameDisplay = document.getElementById('image-name');
const musicSearchInput = document.getElementById('musicSearch');
const searchResultsDiv = document.getElementById('searchResults');
const songFoundDiv = document.getElementById('songFound');
const selectedSongSpan = document.getElementById('selectedSong');
const selectedSongValue = document.getElementById('selectedSongValue');
const requestForm = document.getElementById('requestForm');
const notification = document.getElementById('notification');
// Preview elements
const musicPreview = document.getElementById('music-preview');
const imagePreview = document.getElementById('image-preview');
// Drag and drop elements
const dropZoneMusic = document.getElementById('dropZoneMusic');
const dropZoneImage = document.getElementById('dropZoneImage');
// Audio player elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const timeline = document.getElementById('timeline');
const progress = document.getElementById('progress');
const buffer = document.getElementById('buffer');
const thumb = document.getElementById('thumb');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const audioTitle = document.getElementById('audio-title');
const audioArtist = document.getElementById('audio-artist');
// Initialize translations
document.addEventListener('DOMContentLoaded', () => {
    // Set default language to English
    if (!localStorage.getItem('selectedLanguage')) {
        localStorage.setItem('selectedLanguage', 'en');
    }
    changeLanguage(localStorage.getItem('selectedLanguage'));
    
    // Initialize audio player event listeners
    initializeAudioPlayer();
});
// Initialize audio player
// Initialize audio player
function initializeAudioPlayer() {
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        togglePlayPause();
    });
    
    // Timeline functionality
    timeline.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        seekAudio(e);
    });
    timeline.addEventListener('mousemove', updateThumbPosition);
    timeline.addEventListener('mouseleave', () => {
        thumb.style.opacity = '0';
    });
    timeline.addEventListener('mouseenter', () => {
        thumb.style.opacity = '1';
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        e.preventDefault(); // Prevent form submission
        updateVolume();
    });
    volumeBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        toggleMute();
    });
    
    // Previous/Next buttons (for demo purposes)
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    });
    
    // Audio events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('progress', updateBuffer);
    audioPlayer.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}
// Format file size helper function
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
// Format time helper function
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
// Toggle play/pause
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}
// Update progress bar
function updateProgress() {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeDisplay.textContent = formatTime(currentTime);
    }
}
// Update duration
function updateDuration() {
    durationDisplay.textContent = formatTime(audioPlayer.duration);
}
// Update buffer bar
function updateBuffer() {
    if (audioPlayer.buffered.length > 0) {
        const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
        const duration = audioPlayer.duration;
        
        if (duration > 0) {
            const bufferPercent = (bufferedEnd / duration) * 100;
            buffer.style.width = `${bufferPercent}%`;
        }
    }
}
// Seek audio
function seekAudio(e) {
    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const seekPercent = offsetX / width;
    
    if (audioPlayer.duration) {
        audioPlayer.currentTime = seekPercent * audioPlayer.duration;
    }
}
// Update thumb position
function updateThumbPosition(e) {
    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const seekPercent = Math.max(0, Math.min(1, offsetX / width));
    
    thumb.style.left = `${seekPercent * 100}%`;
}
// Update volume
function updateVolume() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    
    // Update volume icon
    if (volume === 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 0.5) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}
// Toggle mute
function toggleMute() {
    if (audioPlayer.volume > 0) {
        // Save current volume
        audioPlayer.dataset.prevVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        // Restore previous volume
        const prevVolume = parseFloat(audioPlayer.dataset.prevVolume) || 0.7;
        audioPlayer.volume = prevVolume;
        volumeSlider.value = prevVolume * 100;
        updateVolume();
    }
}
// Handle file selection with validation
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
        if (!validTypes.includes(file.type)) {
            showNotification(translations[currentLanguage].invalidAudioFile, true);
            musicFileInput.value = '';
            fileNameDisplay.classList.add('hidden');
            musicPreview.classList.add('hidden');
            return;
        }
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showNotification(translations[currentLanguage].fileSizeExceeded, true);
            musicFileInput.value = '';
            fileNameDisplay.classList.add('hidden');
            musicPreview.classList.add('hidden');
            return;
        }
        // Display file name
        fileNameDisplay.querySelector('span').textContent = file.name;
        fileNameDisplay.classList.remove('hidden');
        
        // Create music preview
        // Revoke previous URL if exists
        if (audioPlayer.src) {
            URL.revokeObjectURL(audioPlayer.src);
        }
        audioPlayer.src = URL.createObjectURL(file);
        musicPreview.classList.remove('hidden');
        
        // Update music preview info
        document.getElementById('music-file-name').textContent = file.name;
        document.getElementById('music-file-size').textContent = formatFileSize(file.size);
        
        // Update audio player title
        audioTitle.textContent = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
        audioArtist.textContent = "Uploaded File";
        
        // Reset audio player
        resetAudioPlayer();
        
        // Clear song search if any
        selectedSongValue.value = '';
        songFoundDiv.classList.add('hidden');
    } else {
        fileNameDisplay.classList.add('hidden');
        musicPreview.classList.add('hidden');
    }
}
// Handle image selection with validation
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification(translations[currentLanguage].invalidImageFile, true);
            imageFileInput.value = '';
            imageNameDisplay.classList.add('hidden');
            imagePreview.classList.add('hidden');
            return;
        }
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification(translations[currentLanguage].imageSizeExceeded, true);
            imageFileInput.value = '';
            imageNameDisplay.classList.add('hidden');
            imagePreview.classList.add('hidden');
            return;
        }
        // Display file name
        imageNameDisplay.querySelector('span').textContent = file.name;
        imageNameDisplay.classList.remove('hidden');
        
        // Create image preview
        const img = imagePreview.querySelector('img');
        // Revoke previous URL if exists
        if (img.src) {
            URL.revokeObjectURL(img.src);
        }
        img.src = URL.createObjectURL(file);
        imagePreview.classList.remove('hidden');
        
        // Update image preview info
        document.getElementById('image-file-name').textContent = file.name;
        document.getElementById('image-file-size').textContent = formatFileSize(file.size);
    } else {
        imageNameDisplay.classList.add('hidden');
        imagePreview.classList.add('hidden');
    }
}
// Reset audio player
function resetAudioPlayer() {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    progress.style.width = '0%';
    buffer.style.width = '0%';
    currentTimeDisplay.textContent = '0:00';
    durationDisplay.textContent = '0:00';
    volumeSlider.value = 70;
    audioPlayer.volume = 0.7;
    updateVolume();
}
// Remove file function
function removeFile(type) {
    if (type === 'music') {
        musicFileInput.value = '';
        fileNameDisplay.classList.add('hidden');
        
        // Revoke object URL and hide music preview
        if (audioPlayer.src) {
            URL.revokeObjectURL(audioPlayer.src);
            audioPlayer.src = '';
        }
        musicPreview.classList.add('hidden');
        
        // Reset preview info
        document.getElementById('music-file-name').textContent = '-';
        document.getElementById('music-file-size').textContent = '-';
    } else if (type === 'image') {
        imageFileInput.value = '';
        imageNameDisplay.classList.add('hidden');
        
        // Revoke object URL and hide image preview
        const img = imagePreview.querySelector('img');
        if (img.src) {
            URL.revokeObjectURL(img.src);
            img.src = '';
        }
        imagePreview.classList.add('hidden');
        
        // Reset preview info
        document.getElementById('image-file-name').textContent = '-';
        document.getElementById('image-file-size').textContent = '-';
    }
}
// Remove selected song function
function removeSelectedSong() {
    musicSearchInput.value = '';
    selectedSongValue.value = '';
    songFoundDiv.classList.add('hidden');
}
// Drag and drop functionality
let dragCounter = 0;
document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer.types.includes('Files')) {
        dropZoneMusic.classList.add('active');
        dropZoneImage.classList.add('active');
    }
});
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});
document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        dropZoneMusic.classList.remove('active');
        dropZoneImage.classList.remove('active');
    }
});
document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropZoneMusic.classList.remove('active');
    dropZoneImage.classList.remove('active');
});
// Handle music file drop
dropZoneMusic.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZoneMusic.classList.add('drag-over');
});
dropZoneMusic.addEventListener('dragleave', () => {
    dropZoneMusic.classList.remove('drag-over');
});
dropZoneMusic.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZoneMusic.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        // Validate file type
        const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
        if (!validTypes.includes(file.type)) {
            showNotification(translations[currentLanguage].invalidAudioFile, true);
            return;
        }
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showNotification(translations[currentLanguage].fileSizeExceeded, true);
            return;
        }
        // Create a new FileList to assign to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        musicFileInput.files = dataTransfer.files;
        // Update UI
        fileNameDisplay.querySelector('span').textContent = file.name;
        fileNameDisplay.classList.remove('hidden');
        
        // Create music preview
        // Revoke previous URL if exists
        if (audioPlayer.src) {
            URL.revokeObjectURL(audioPlayer.src);
        }
        audioPlayer.src = URL.createObjectURL(file);
        musicPreview.classList.remove('hidden');
        
        // Update music preview info
        document.getElementById('music-file-name').textContent = file.name;
        document.getElementById('music-file-size').textContent = formatFileSize(file.size);
        
        // Update audio player title
        audioTitle.textContent = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
        audioArtist.textContent = "Uploaded File";
        
        // Reset audio player
        resetAudioPlayer();
        
        // Clear song search if any
        selectedSongValue.value = '';
        songFoundDiv.classList.add('hidden');
        
        showNotification(translations[currentLanguage].musicFileUploaded);
    }
});
// Handle image file drop
dropZoneImage.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZoneImage.classList.add('drag-over');
});
dropZoneImage.addEventListener('dragleave', () => {
    dropZoneImage.classList.remove('drag-over');
});
dropZoneImage.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZoneImage.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification(translations[currentLanguage].invalidImageFile, true);
            return;
        }
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification(translations[currentLanguage].imageSizeExceeded, true);
            return;
        }
        // Create a new FileList to assign to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageFileInput.files = dataTransfer.files;
        // Update UI
        imageNameDisplay.querySelector('span').textContent = file.name;
        imageNameDisplay.classList.remove('hidden');
        
        // Create image preview
        const img = imagePreview.querySelector('img');
        // Revoke previous URL if exists
        if (img.src) {
            URL.revokeObjectURL(img.src);
        }
        img.src = URL.createObjectURL(file);
        imagePreview.classList.remove('hidden');
        
        // Update image preview info
        document.getElementById('image-file-name').textContent = file.name;
        document.getElementById('image-file-size').textContent = formatFileSize(file.size);
        
        showNotification(translations[currentLanguage].imageFileUploaded);
    }
});
musicSearchInput.addEventListener('input', function() {
    const term = this.value.toLowerCase().trim();
    if (term.length === 0) {
        searchResultsDiv.style.display = 'none';
        return;
    }
    const filtered = musicLibrary.filter(song => song.toLowerCase().includes(term));
    searchResultsDiv.innerHTML = '';
    if (filtered.length > 0) {
        filtered.forEach(song => {
            const div = document.createElement('div');
            div.className = 'p-3 md:p-4 cursor-pointer hover:bg-dj-primary/20 transition-colors border-b border-slate-700 last:border-b-0';
            div.textContent = song;
            div.addEventListener('click', () => selectSong(song));
            searchResultsDiv.appendChild(div);
        });
        searchResultsDiv.style.display = 'block';
    } else {
        const div = document.createElement('div');
        div.className = 'p-3 md:p-4 text-slate-400';
        div.textContent = translations[currentLanguage].noSongsFound;
        searchResultsDiv.appendChild(div);
        searchResultsDiv.style.display = 'block';
    }
});
function selectSong(song) {
    musicSearchInput.value = song;
    searchResultsDiv.style.display = 'none';
    selectedSongSpan.textContent = song;
    selectedSongValue.value = song;
    songFoundDiv.classList.remove('hidden');
    musicFileInput.value = '';
    fileNameDisplay.classList.add('hidden');
    
    // Hide and revoke music preview when selecting a song from library
    if (audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
        audioPlayer.src = '';
    }
    musicPreview.classList.add('hidden');
    
    // Reset preview info
    document.getElementById('music-file-name').textContent = '-';
    document.getElementById('music-file-size').textContent = '-';
}
document.addEventListener('click', function(e) {
    if (!musicSearchInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
        searchResultsDiv.style.display = 'none';
    }
    // Close language dropdown if clicking outside
    const languageOptions = document.getElementById('languageOptions');
    const languageDropdown = document.querySelector('.language-dropdown');
    if (!languageDropdown.contains(e.target) && !languageOptions.contains(e.target)) {
        languageOptions.classList.remove('show');
    }
});
requestForm.addEventListener('submit', function(e) {
    const phoneInput = document.getElementById('phone');
    const phonePattern = /^\+47\d{8}$/;
    if (!phonePattern.test(phoneInput.value)) {
        e.preventDefault();
        showNotification(translations[currentLanguage].invalidPhone, true);
        return;
    }
    if (!musicFileInput.files[0] && !selectedSongValue.value) {
        e.preventDefault();
        showNotification(translations[currentLanguage].selectMusicOrFile, true);
        return;
    }
});
function showNotification(message, isError = false) {
    const icon = notification.querySelector('i');
    const text = notification.querySelector('span');
    text.textContent = message;
    if (isError) {
        notification.className = 'fixed top-4 right-4 p-3 md:p-4 rounded-xl shadow-2xl bg-red-500/90 text-white transform transition-transform duration-500 z-50 flex items-center';
        icon.className = 'fas fa-exclamation-circle mr-2 md:mr-3 text-lg md:text-xl';
    } else {
        notification.className = 'fixed top-4 right-4 p-3 md:p-4 rounded-xl shadow-2xl bg-green-500/90 text-white transform transition-transform duration-500 z-50 flex items-center';
        icon.className = 'fas fa-check-circle mr-2 md:mr-3 text-lg md:text-xl';
    }
    // Show notification
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
    }, 3000);
}
// Language dropdown functions
function toggleLanguageDropdown() {
    const languageOptions = document.getElementById('languageOptions');
    languageOptions.classList.toggle('show');
}
function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    currentLanguage = lang;

    // Update current language display
    const languageNames = {
        'en': 'English',
        'no': 'Norwegian',
        'fa': 'Persian'
    };
    document.getElementById('currentLanguage').textContent = languageNames[lang];

    // Hide dropdown
    document.getElementById('languageOptions').classList.remove('show');

    // Update all translatable elements
    updateTranslations();

    // Get icons container
    let rtlIcons = document.getElementById('rtl_icons');

    // Set text direction + icon order
    if (lang === 'fa') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');

        // Reverse icon order + spacing
        rtlIcons.classList.add("flex-row-reverse", "space-x-reverse");
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');

        // Reset to normal order
        rtlIcons.classList.remove("flex-row-reverse", "space-x-reverse");
    }
}
