const btnEl = document.getElementById('btn');
const animeContainerEl = document.querySelector('.anime-container');
const animeImgEl = document.getElementById('anime-img');
const animeNameEl = document.getElementById('anime-name');
const spinnerEl = document.getElementById('spinner');
const categoryEl = document.getElementById('category');
const downloadBtn = document.getElementById('download-btn');
const likeBtn = document.getElementById('like-btn');
const darkModeCheckbox = document.getElementById('dark-mode');

// Fetch Anime Image using a reliable backup API strategy
async function fetchAnimeImage() {
    try {
        btnEl.disabled = true;
        btnEl.innerText = 'Loading...';
        if (spinnerEl) spinnerEl.style.display = 'block';
        if (animeImgEl) animeImgEl.style.opacity = '0.3';

        const category = categoryEl ? categoryEl.value : 'wailu';
        let imageUrl = '';

        try {
            // Primary API: waifu.pics
            const response = await fetch(`https://api.waifu.pics/sfw/${category}`);
            const data = await response.json();
            imageUrl = data.url;
        }
         catch (err) {

            // Fallback API if primary fails or is blocked by CORS/network
            const fallbackResponse = await fetch(`https://nekos.best/api/v2/neko`);
            const fallbackData = await fallbackResponse.json();
            imageUrl = fallbackData.results[0].url;
        }

        if (animeImgEl) {
            animeImgEl.crossOrigin = 'anonymous'; // Helps prevent download/canvas security blocks
            animeImgEl.src = imageUrl;
            animeImgEl.onload = () => {
                animeImgEl.style.opacity = '1';
                if (spinnerEl) spinnerEl.style.display = 'none';
                btnEl.disabled = false;
                btnEl.innerText = 'Get Anime';
            };
            animeImgEl.onerror = () => {
                // Handle broken image load gracefully
                animeImgEl.style.opacity = '1';
                if (spinnerEl) spinnerEl.style.display = 'none';
                btnEl.disabled = false;
                btnEl.innerText = 'Get Anime';
            };
        }

        if (animeNameEl) {
            animeNameEl.innerText = category.charAt(0).toUpperCase() + category.slice(1);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        if (spinnerEl) spinnerEl.style.display = 'none';
        if (animeImgEl) animeImgEl.style.opacity = '1';
        btnEl.disabled = false;
        btnEl.innerText = 'Get Anime';
        if (animeNameEl) animeNameEl.innerText = 'Failed to load. Click again!';
    }
}

if (btnEl) {
    btnEl.addEventListener('click', fetchAnimeImage);
}

// Download Image Logic with fallback for CORS restrictions
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        try {
            const imageUrl = animeImgEl.src;
            const response = await fetch(imageUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `anime-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            // Fallback: open image in a new tab if direct download is blocked by CORS policy
            window.open(animeImgEl.src, '_blank');
        }
    });
}

// Like / Save Favorite Logic
let isLiked = false;
if (likeBtn) {
    likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        likeBtn.innerHTML = isLiked ? '❤️ Saved!' : '❤️ Save Favorite';
        likeBtn.classList.toggle('liked', isLiked);
    });
}

// Dark Mode Toggle Logic & Local Storage
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
}

if (darkModeCheckbox) {
    darkModeCheckbox.addEventListener('change', () => {
        if (darkModeCheckbox.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}