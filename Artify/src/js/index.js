import { createApi } from 'unsplash-js';

document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;

// Set the background color
body.style.backgroundColor = '#add8e6'; // Use the hex color code for light blue

  // Add the blur container
  const blurContainer = document.createElement('div');
  blurContainer.classList.add('blur-container');
  body.appendChild(blurContainer);

  const main = document.querySelector('#main');
  const modal = document.getElementById('myModal');
  const modalContent = document.getElementById('modal-content');
  const favoritesContainer = document.getElementById('favorites');

  const unsplash = createApi({
    accessKey: '_ayTQBYr79Lz6vGYq0XZkoiEHzuCNjBjjP29A6XL_OM'
  });

  let photos = [];
  let currentCategory = 'cyberpunk';

  function openModal(photo) {
    console.log('Open modal called:', photo);
    modalContent.innerHTML = `
      <span class="close" onclick="closeModal()">&times;</span>
      <p style="color: white; text-align: center; font-weight: bold;">Artist: ${photo.user.name}</p>
      <p style="color: white; text-align: center; font-weight: bold;">Tags: ${photo.tags.map(tag => tag.title).join(', ')}</p>
      <p style="color: white; text-align: center; font-weight: bold;">Description: ${photo.description || 'Not available'}</p>
      <p style="color: white; text-align: center; font-weight: bold;">Views: ${photo.views}</p>
      <p style="color: white; text-align: center; font-weight: bold;">Downloads: ${photo.downloads}</p>
      <p style="color: white; text-align: center; font-weight: bold;">Published On: ${new Date(photo.created_at).toLocaleDateString()}</p>
    `;
    modal.style.display = 'block';
    modal.addEventListener('click', closeModal);
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.removeEventListener('click', closeModal);
  }

  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || {};
  }

  function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  function isFavorite(photoId) {
    const favorites = getFavorites();
    return favorites[currentCategory] && favorites[currentCategory].includes(photoId);
  }

  function toggleFavorite(photoId) {
    const favorites = getFavorites();
    if (!favorites[currentCategory]) {
      favorites[currentCategory] = [];
    }

    const categoryFavorites = favorites[currentCategory];

    if (categoryFavorites.includes(photoId)) {
      // Remove from favorites
      const updatedFavorites = categoryFavorites.filter((id) => id !== photoId);
      favorites[currentCategory] = updatedFavorites;
    } else {
      // Add to favorites
      categoryFavorites.push(photoId);
    }

    saveFavorites(favorites);
  }

  function updateFavoriteButton(button, photoId) {
    const isCurrentlyFavorite = isFavorite(photoId);
    button.innerHTML = isCurrentlyFavorite ? '❤️' : '🤍';
    button.dataset.favorite = isCurrentlyFavorite ? 'false' : 'true';
  }

  function displayFavorites() {
    favoritesContainer.innerHTML = '<h2>Favorites</h2>';

    const favorites = getFavorites();

    for (const category in favorites) {
      favorites[category].forEach((favoriteId) => {
        const favoritePhoto = photos.find((photo) => photo.id === favoriteId);
        if (favoritePhoto) {
          favoritesContainer.innerHTML += `
            <div class="favorite-image-container">
              <img src="${favoritePhoto.urls.thumb}" alt="${favoritePhoto.alt_description}" />
              <div class="favorite-details">
                <p>Artist: ${favoritePhoto.user.name}</p>
                <p>Tags: ${favoritePhoto.tags.map(tag => tag.title).join(', ')}</p>
                <button class="remove-favorite-button" data-id="${favoritePhoto.id}">Remove from Favorites</button>
              </div>
            </div>
          `;
        }
      });
    }

    const removeFavoriteButtons = document.querySelectorAll('.remove-favorite-button');
    removeFavoriteButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const photoId = button.dataset.id;

        toggleFavorite(photoId);
        displayFavorites();
      });
    });
  }

  function initPage(category) {
    currentCategory = category;
    loadDefaultImages(category);
    displayFavorites();
  }

  function loadDefaultImages(category) {
    unsplash.search
      .getPhotos({
        query: category,
        page: 1,
        perPage: 12,
        orientation: 'portrait'
      })
      .then((result) => {
        if (result.type === 'success') {
          photos = result.response.results.map((photo) => ({ ...photo, category }));

          const getUrls = photos.map((photo, index) => {
            return `
              <div id="image-${index}" class="image-container">
                <img src="${photo.urls.small}" alt="${photo.alt_description}" />
                <button class="favorite-button" data-index="${index}" data-id="${photo.id}" data-favorite="${isFavorite(photo.id) ? 'true' : 'false'}">
                  ${isFavorite(photo.id) ? '❤️' : '🤍'}
                </button>
              </div>
            `;
          });

          main.innerHTML = getUrls.join('');

          main.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'IMG') {
              const index = parseInt(target.closest('.image-container').id.split('-')[1]);
              openModal(photos[index]);
            } else if (target.classList.contains('favorite-button')) {
              const photoId = target.dataset.id;

              toggleFavorite(photoId);
              updateFavoriteButton(target, photoId);
              displayFavorites();
            }
          });
        }
      });
  }

  function handleNavClick(category) {
    initPage(category);
  }

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const category = event.target.innerText.toLowerCase();
      handleNavClick(category);
    });
  });

  document.getElementById('favorites-link').addEventListener('click', (event) => {
    event.preventDefault();
    displayFavorites();
  });

  initPage('cyberpunk');
});
