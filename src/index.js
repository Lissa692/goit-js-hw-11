import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import OnlyScroll from 'only-scrollbar';
import { getFetchPhoto } from './pixabay-api';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
loadMore.style.display = 'none';

const maxPages = 13;
let fetchingInProgress = false; // Перевірка наявності активного запиту
let currentSearchQuery = '';
let page = 1;

const lightbox = new SimpleLightbox('.gallery a');

function createTemplatePhoto(photos) {
  const infoAboutPhoto = photos
    .map(photo => {
      return `
        <a href="${photo.largeImageURL}" class="photo-card">
        <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
        <div class="info">
        <p class="info-item"><b>Likes:</b> ${photo.likes}</p>
        <p class="info-item"><b>Views:</b> ${photo.views}</p>
        <p class="info-item"><b>Comments:</b> ${photo.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${photo.downloads}</p>
        </div>
        </a>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', infoAboutPhoto);
  lightbox.refresh();
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();
  page = 1;
  gallery.innerHTML = '';

  const formData = new FormData(event.currentTarget);
  const searchQuery = formData.get('searchQuery').trim();

  if (searchQuery === '') {
    return;
  }

  currentSearchQuery = searchQuery;

  try {
    fetchingInProgress = true; // Позначаємо, що запит активний
    const { hits, totalHits } = await getFetchPhoto(searchQuery, page);

    if (hits.length === 0) {
      loadMore.style.display = 'none';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    createTemplatePhoto(hits);
    if (hits.length === 40) {
      loadMore.style.display = 'block';
    }
    if (hits.length < totalHits) {
    }
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    fetchingInProgress = false; // Запит завершено, змінюємо стан на false
  }
}
loadMore.addEventListener('click', loadMoreImages);

async function loadMoreImages() {
  if (page > maxPages) {
    loadMore.style.display = 'none';
    return;
  }
  page += 1;
  try {
    fetchingInProgress = true; // Позначаємо, що запит активний
    const { hits, totalHits } = await getFetchPhoto(currentSearchQuery, page);
    // loadMore.disabled = true;
    createTemplatePhoto(hits);

    // Оновлюємо SimpleLightbox з новими зображеннями
    lightbox.refresh();

    const loadedImagesCount = (page - 1) * 40 + hits.length;
    if (loadedImagesCount >= totalHits) {
      loadMore.style.display = 'none';
      //   loadMore.disabled = false;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    fetchingInProgress = false; // Запит завершено, змінюємо стан на false
  }
}
searchForm.addEventListener('submit', handleSearchFormSubmit);
