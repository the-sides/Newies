// lmao ancient code
// ? var trackLimit = 20
const session_data = {
    token: undefined,
    userData: undefined,
    playlistData: undefined,
    trackBank: [],
}

function run() {

    // Runs twice, once failing when the page is initially accessed, and 
    let token = window.location.href.indexOf("access_token=");


    if (token !== -1) {
        // Info found in url
        token = window.location.href
            .substring(
                token + 13,
                window.location.href.indexOf('&')
            )
        console.log(token)
        session_data.token = token;

        // Start user breakdown
        revealStatus('connected', session_data.token);

    }

    //* Queries
    const authorizeBtn = document.getElementById('authoBtn');
    const generateBtn = document.getElementById('generateBtn');


    function generateButton() {
        if (session_data.token === -1)
            return false;

        console.log('User Authenticated', session_data.token);

        if (session_data.userData === undefined) {
            console.log('waiting for user data')
            return false;
        }
        console.log('User data confirmed.\nPulling all playlists...')

        grabAllPlaylists()
        .then((response) => {
            // renderStatus('all playlists', response);
            sortSongs(response);
            }
        );
    }

    function renderUserData(userData) {
        console.log('rendering', userData)
        const statusElem = document.querySelector('.welcomeStatus');
        const scroller = [...document.querySelectorAll('.contentBeneath')];

        statusElem.textContent = `Welcome ${userData.display_name}`;

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
        return userData;
    }

    function displayPlaylistCount(data) {
        console.log('fetching playlists from', data)
        const playlistElem = document.querySelector('.playlistCount');
        playlistElem.textContent = `You have ${data.total} playlists`;
    }

    async function getPlaylistList(renderPlz = false, offset = 0, limit = 50, uid = session_data.userData.id, token = session_data.token) {
        console.log(`calling for offset ${offset}, limit: ${limit}`)
        const url = `https://api.spotify.com/v1/users/${uid}/playlists?limit=${limit}&offset=${offset}`;
        const plist = await getSpotifyData(token, url)
            .then(response => {
                if (renderPlz)
                    displayPlaylistCount(response)
                session_data.playlistData = response;
                return response;
            }
            );
        return plist;
    }



    function revealStatus(stage, token, userData = undefined) {
        switch (stage) {
            case 'connected':
                getSpotifyData(token, 'https://api.spotify.com/v1/me/')
                    .then(rv => {
                        session_data.userData = rv;
                        return renderUserData(rv)
                    })
                    .then(userData => revealStatus('playlist summary', token, userData));
                break;
            case 'playlist summary':
                getPlaylistList(true);
                break;
        }
    }




    // Event Listeners
    authorizeBtn.addEventListener('mouseup', authorizeButton)
    generateBtn.addEventListener('mouseup', generateButton)

}

window.addEventListener('DOMContentLoaded', run);