
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
function postFeed(message){
    let newElm = document.createElement('div');
    newElm.className = 'feedItem';

}
export { displayUser, displayPlaylistCount, initRing, revealFeed }