import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38774663-b09d2594b348db9c881b41960';

export async function fetchImages(query, page = 1) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    });

    if (response.status >= 400) {
      throw new Error('API error');
    }

    return response.data;
  } catch (error) {
    throw new Error('Error fetching images:', error);
  }
}
