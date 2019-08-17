import {checkToken, generateVerify, sortSongs, trackStripper, filterPlaylists, filterTracks} from './utils.js'
import {fetchAutho, getSpotifyData, getAllPlaylists, getPlaylistList} from './spotifyAPI.js'
import {displayUser, displayPlaylistCount, initRing, revealFeed} from './ui.js'

const session_data = {
    token: undefined,
    userData: undefined,
    nPlaylists: 0,
    trackBank: [],
}

function run() {

    checkToken((token)=>{
        if(null !== token){
            session_data.token = token;

            // Establish user data with site and set session_data
            getSpotifyData(token, 'https://api.spotify.com/v1/me/')
            .then(userdata =>{
                session_data.userData = userdata;
                displayUser(userdata.display_name);
                revealFeed();
                getPlaylistList(userdata.id, token).then((listOf50)=>{
                    session_data.nPlaylists = listOf50.total;
                    displayPlaylistCount(listOf50.total);
                    initRing(listOf50.total);
                });
            });
        }
    })

    //* Queries
    const authorizeBtn = document.getElementById('authoBtn');
    const generateBtn = document.getElementById('generateBtn');


    // Event Listeners
    authorizeBtn.addEventListener('mouseup', fetchAutho)
    generateBtn.addEventListener('mouseup', ()=>{
        generateVerify(session_data, ()=>{
            // All systems are a go
            getAllPlaylists(session_data.userData.id, session_data.token, 183)
            .then((list50s)=>{
                filterPlaylists(session_data.token, list50s)
                .then((trackDump)=>{
                    filterTracks(trackDump, session_data.userData, 'date')
                    .then(formattedTracks => console.log(formattedTracks))
                })
            })
        })
    })

}

window.addEventListener('DOMContentLoaded', run);