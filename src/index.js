import './css/styles.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = '35861532-f4480698535ddfd2cf92b517e';
const BASE_URL = 'https://pixabay.com/api/';
let searchQuery = '';
let pageQuery = 1;

const refs = {
    searchForm: document.getElementById('search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more-btn'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onFormSubmit(e) {
    e.preventDefault();

    searchQuery = e.target.elements.searchQuery.value;
    pageQuery = 1;
    refs.gallery.innerHTML = '';
    getFirstGallary(pageQuery, searchQuery);
};

async function fetchData(page, query) {
    const resp = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`);
    console.log(resp);
    return resp.data;
};

async function getFirstGallary(page, query) {
    try {
        const data = await fetchData(page, query);

        if (data.hits.length > 0) {
            Notify.success(`Hooray! We found ${data.totalHits} images.`)
            renderGallary(data.hits);
            
            refs.loadMoreBtn.classList.remove('is-hidden');
        } else {
            Notify.failure("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        Notify.failure(`${error}`);
    };
};

function renderGallary(data) {
    const markup = data.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => 
        `<div class="photo-card">
            <a class="gallery__link" href="${largeImageURL}">
                <img class="preview-img" src="${webformatURL}" alt="${tags}" loading="lazy" width=300 />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>
                    ${likes}
                </p>
                <p class="info-item">
                    <b>Views</b>
                    ${views}
                </p>
                <p class="info-item">
                    <b>Comments</b>
                    ${comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b>
                    ${downloads}
                </p>
            </div>
        </div>`
    ).join('');

    refs.gallery.insertAdjacentHTML('beforeend', markup);
    new SimpleLightbox('.gallery a', {
        captionDelay: 250,
        captionsData: "alt",
        scrollZoom: false,
    });
    refs.loadMoreBtn.disabled = false;
};

async function onLoadMore(e) {
    refs.loadMoreBtn.disabled = true;
    pageQuery += 1;
    try {
        const data = await fetchData(pageQuery, searchQuery);
        const maxPages = Math.ceil(data.totalHits / data.hits.length);

        if (pageQuery < maxPages) {
            renderGallary(data.hits);
        } else if (pageQuery = maxPages) {
            refs.loadMoreBtn.classList.add('is-hidden');
            Notify.failure("Hooray! We found totalHits images.");
        }
    }
    catch (error) {
        Notify.failure(`${error}`);
    };
};