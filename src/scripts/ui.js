
function displayUser(user) {
    console.log('User Connected', user.display_name)
    const photoSpot = document.querySelector('figure.userPhoto > img');
    photoSpot.src = user.images[0].url;
}

function displayPlaylistCount(total) {
    const playlistElem = document.querySelector('.playlistCount');
    playlistElem.textContent = `You have ${total} playlists`;
}

function initRing(total) {
    return total;
}

function revealFeed() {
    const feed = document.querySelector('.feed');
    feed.classList.remove('feed--hidden');
}
export { displayUser, displayPlaylistCount, initRing, revealFeed }