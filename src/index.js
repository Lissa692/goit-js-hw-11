import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';
import { fetchImages } from './pixabay-api';

const gallery = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');

let page = 1;
let currentSearchQuery = '';
let fetchingInProgress = false; // Перевірка наявності активного запиту

const lightbox = new SimpleLightbox('.gallery a');

async function displayImages(images) {
  const cardsMarkup = images
    .map(image => {
      return `
      <a href="${image.largeImageURL}" class="photo-card">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </a>
    `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', cardsMarkup);
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
    const { hits, totalHits } = await fetchImages(searchQuery, page);
    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    displayImages(hits);

    if (hits.length < totalHits) {
      // document.querySelector('.load-more').style.display = 'block';
    }
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    fetchingInProgress = false; // Запит завершено, змінюємо стан на false
  }
}

async function loadMoreImagesOnScroll() {
  if (fetchingInProgress || !isPageBottomReached()) {
    return;
  }

  page++;
  try {
    fetchingInProgress = true; // Позначаємо, що запит активний
    const { hits, totalHits } = await fetchImages(currentSearchQuery, page);
    displayImages(hits);

    // Оновлюємо SimpleLightbox з новими зображеннями
    lightbox.refresh();

    const loadedImagesCount = (page - 1) * 40 + hits.length;
    if (loadedImagesCount >= totalHits) {
      // document.querySelector('.load-more').style.display = 'none';
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

function isPageBottomReached() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  return scrollTop + clientHeight >= scrollHeight - 100; // Можна налаштувати значення, яке підходить для вашого веб-сайту
}

const throttledLoadMoreImages = throttle(loadMoreImagesOnScroll, 1000); // 1000 ms - інтервал тротлінгу

searchForm.addEventListener('submit', handleSearchFormSubmit);
window.addEventListener('scroll', () => {
  if (isPageBottomReached()) {
    throttledLoadMoreImages(); // Викликаємо тротлінговану функцію
  }
});
// const searchForm = document.querySelector('#search-form');
// const gallery = document.querySelector('.gallery');
// const loadMore = document.querySelector('.load-more');
// // loadMore.style.display = 'none';

// const options = {
//   root: null,
//   rootMargin: '400px',
//   threshold: 1.0,
// };

// const maxPages = 13;
// let fetchingInProgress = false; // Перевірка наявності активного запиту
// let currentSearchQuery = '';
// let page = 1;

// const lightbox = new SimpleLightbox('.gallery a');
// const observer = new IntersectionObserver(handleSearchFormSubmit, options);

// function createTemplatePhoto(photos) {
//   const infoAboutPhoto = photos
//     .map(photo => {
//       return `
//         <a href="${photo.largeImageURL}" class="photo-card">
//         <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
//         <div class="info">
//         <p class="info-item"><b>Likes:</b> ${photo.likes}</p>
//         <p class="info-item"><b>Views:</b> ${photo.views}</p>
//         <p class="info-item"><b>Comments:</b> ${photo.comments}</p>
//         <p class="info-item"><b>Downloads:</b> ${photo.downloads}</p>
//         </div>
//         </a>`;
//     })
//     .join('');
//   gallery.insertAdjacentHTML('beforeend', infoAboutPhoto);
//   lightbox.refresh();
// }

// async function handleSearchFormSubmit(event) {
//   event.preventDefault();
//   page = 1;
//   gallery.innerHTML = '';
//   target.hidden = true;

//   const formData = new FormData(event.currentTarget);
//   const searchQuery = formData.get('searchQuery').trim();

//   if (searchQuery === '') {
//     return;
//   }

//   currentSearchQuery = searchQuery;

//   try {
//     fetchingInProgress = true; // Позначаємо, що запит активний
//     const { hits, totalHits } = await getFetchPhoto(searchQuery, page);

//     if (hits.length === 0) {
//       loadMore.style.display = 'none';
//       Notiflix.Notify.failure(
//         'Sorry, there are no images matching your search query. Please try again.'
//       );
//       return;
//     }
//     createTemplatePhoto(hits);

//     if (hits.length < totalHits) {
//     }
//     Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
//     gallery.hidden = false;
//     observer.observe(gallery);
//   } catch (error) {
//     Notiflix.Notify.failure('Error fetching images. Please try again later.');
//     console.error('Error fetching images:', error);
//   } finally {
//     fetchingInProgress = false; // Запит завершено, змінюємо стан на false
//   }
// }
// loadMore.addEventListener('click', loadMoreImages);

// async function loadMoreImages() {
//   if (page > maxPages) {
//     loadMore.style.display = '';
//     return;
//   }
//   page += 1;
//   try {
//     fetchingInProgress = true; // Позначаємо, що запит активний
//     const { hits, totalHits } = await getFetchPhoto(currentSearchQuery, page);
//     // loadMore.disabled = true;
//     createTemplatePhoto(hits);

//     lightbox.refresh();

//     const loadedImagesCount = (page - 1) * 40 + hits.length;
//     if (loadedImagesCount >= totalHits) {
//       observer.unobserve(gallery);
//       //   loadMore.disabled = false;
//       Notiflix.Notify.info(
//         "We're sorry, but you've reached the end of search results."
//       );
//     }
//   } catch (error) {
//     Notiflix.Notify.failure('Error fetching images. Please try again later.');
//     console.error('Error fetching images:', error);
//   } finally {
//     fetchingInProgress = false; // Запит завершено, змінюємо стан на false
//   }
// }
// searchForm.addEventListener('submit', handleSearchFormSubmit);
