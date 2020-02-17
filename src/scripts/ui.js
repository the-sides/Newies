
function displayUser(user) {
    console.log('User Connected', user.display_name)
    const photoSpot = document.querySelector('figure.userPhoto > img');
    const userNameSpot = document.querySelector('p.userName')
    photoSpot.src = user.images[0].url;
    userNameSpot.textContent = user.display_name;
}

function displayPlaylistCount(total) {
    const playlistElem = document.querySelector('.playlistCount');
    playlistElem.textContent = `Found ${total} playlists`;
}

function initRing(total) {
    return total;
}

function revealFeed() {
    const feed = document.querySelector('.feed');
    feed.classList.remove('feed--hidden');
}

function hideBtn(selector) {
    const elm = document.querySelector(selector);
    elm.classList.add('hidden');
}

function revealBtn(selector) {
    const elm = document.querySelector(selector);
    elm.classList.remove('hidden');
}

function changeBtn(selector, newText) {
    const elm = document.querySelector(selector);
    elm.textContent = newText;
}

function newFeedItem(message){
    let item = document.createElement('li');
    let pMessage = document.createElement('p');

    item.className = 'feedItem';
    pMessage.className = 'feedMessage';
    pMessage.textContent = message;

    item.appendChild(pMessage);
    return item;
}

function postFeed(message){
    const feed = document.querySelector('.feedList');
    const newElm = newFeedItem(message);
    feed.appendChild(newElm);
}

export { displayUser, displayPlaylistCount, initRing, revealFeed, revealBtn, hideBtn, changeBtn, postFeed }