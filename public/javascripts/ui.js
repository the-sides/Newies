
function introduceUser(display_name) {
    console.log('User Connected', display_name)
    const statusElem = document.querySelector('.welcomeStatus');
    const scroller = [...document.querySelectorAll('.contentBeneath')];

    statusElem.textContent = `Welcome ${display_name}`;

    // Show an element
    // I know I know I'm bad. Stolen and weakly implemented from here
    // https://jsfiddle.net/mo0cn97s/
    const show = function (elem) {

        // Get the natural height of the element
        const getHeight = function () {
            elem.style.display = 'block'; // Make it visible
            var height = elem.scrollHeight + 'px'; // Get it's height
            elem.style.display = ''; //  Hide it again
            return height;
        };

        const height = getHeight(); // Get the natural height
        elem.classList.add('revealed'); // Make the element visible
        elem.style.height = height; // Update the max-height

        // Once the transition is complete, remove the inline max-height so the content can scale responsively
        window.setTimeout(function () {
            elem.style.height = '';
        }, 500);

    };

    show(scroller[0])
    show(scroller[1])

    // This is passed into a function that will take the user's id and
    //  fetch a list of playlists to furth compute
}

function displayPlaylistCount(total) {
    const playlistElem = document.querySelector('.playlistCount');
    playlistElem.textContent = `You have ${total} playlists`;
}

export {introduceUser, displayPlaylistCount}