import {checkToken, sortSongs, trackStripper, grabAllPlaylists} from './utils.js'
import {authorizeButton, getSpotifyData} from './spotifyAPI.js'
import {introduceUser, displayPlaylistCount} from './ui.js'

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
    checkToken((token)=>{
        if(null !== token){
            session_data.token = token;
            revealStatus('connected', token);
        }
    })

    //* Queries
    const authorizeBtn = document.getElementById('authoBtn');
    const generateBtn = document.getElementById('generateBtn');


    function generateVerify(cb) {
        if (session_data.token === -1)
            return false;

        console.log('User Authenticated', session_data.token);

        if (session_data.userData === undefined) {
            console.log('waiting for user data')
            return false;
        }
        console.log('User data confirmed.\nPulling all playlists...')

        cb()
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
                        return introduceUser(rv)
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
    generateBtn.addEventListener('mouseup', ()=>{
        generateVerify(()=>{
            // All systems are a go
            grabAllPlaylists().then((list50s)=>{
                sortSongs(list50s, session_data.userData, 'date')
            })
        })
    })

}

window.addEventListener('DOMContentLoaded', run);