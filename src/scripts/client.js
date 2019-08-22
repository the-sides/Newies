import {checkToken, generateVerify, sortSongs, trackStripper, filterPlaylists, filterTracks, findNewiesPlaylist} from './utils.js'
import {fetchAutho, getSpotifyData, getAllPlaylists, getPlaylistList } from './spotifyAPI.js'
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
                console.log(userdata)
                revealFeed();
                displayUser(userdata);
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
    const pullTracksBtn = document.getElementById('pullTracksBtn');

    function pullTracks(){
        generateVerify(session_data, ()=>{
            // All systems are a go
            getAllPlaylists(session_data.userData.id, session_data.token, session_data.nPlaylists)
            .then((list50s)=>{
                findNewiesPlaylist(list50s).then( (rv) => session_data.newiesList = rv )
                filterPlaylists(session_data.token, list50s)
                .then((trackDump)=>{
                    filterTracks(trackDump, session_data.userData, 'date')
                    .then(formattedTracks => console.log(formattedTracks))
                })
            })
        })
    }

    function generatePlaylist(){
        let existing = findNewiesPlaylist(session_data.userData.id, session_data.token);
        if(existing !== null){
            session_data.newiesList = existing;
        }
    }

    // Event Listeners
    authorizeBtn.addEventListener('mouseup', fetchAutho)
    pullTracksBtn.addEventListener('mouseup', pullTracks)
    generateBtn.addEventListener('mouseup', generatePlaylist)

}

window.addEventListener('DOMContentLoaded', run);