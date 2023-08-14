import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38774663-b09d2594b348db9c881b41960';

export async function getFetchPhoto(query, page = 1) {
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

    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}
// export async function getFetchPhoto(searchQuery, page = 1) {
//   try {
//     const data = await axios.get(`${BASE_URL}`, {
//       params: {
//         key: API_KEY,
//         q: searchQuery,
//         image_type: photo,
//         orientation: horizontal,
//         safesearch: true,
//         page: page,
//         per_page: 40,
//       },
//     });
//     return data;
//   } catch (error) {
//     console.log(error.message);
//   }
// }
