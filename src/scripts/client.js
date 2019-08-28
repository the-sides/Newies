import {checkToken, generateVerify, sortTracks, trackStripper, filterPlaylists, filterTracks, findNewiesPlaylist} from './utils.js'
import {fetchAutho, getSpotifyData, getAllPlaylists, getPlaylistList } from './spotifyAPI.js'
import {displayUser, displayPlaylistCount, initRing, revealFeed} from './ui.js'

const session_data = {
    token: undefined,
    userData: undefined,
    nPlaylists: 0,
    trackBank: [],
    newiesList: undefined,
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
        // Toggle app logo
        // document.querySelector('.App-logo--hidden').classList.remove('App-logo--hidden')
        generateVerify(session_data, ()=>{
            // All systems are a go
            getAllPlaylists(session_data.userData.id, session_data.token, session_data.nPlaylists)
            .then((list50s)=>{
                findNewiesPlaylist(list50s).then( (rv) => session_data.newiesList = rv )
                filterPlaylists(session_data.token, list50s, session_data.userData.id)
                .then((trackDump)=>{
                    filterTracks(trackDump, session_data.userData, 'date')
                    .then(formattedTracks => session_data.trackBank = formattedTracks)
                })
            })
        })
    }

    function generatePlaylist(){
        // * Newies playlist must be made
        if(!session_data.newiesList){

        }
        // * By this point, playlist should be known
        console.log('Sorting tracks...')
        sortTracks(session_data.trackBank)
            .then(latest => console.log(latest));

        // fillPlaylist(session_data.newiesList, latest);
    }

    // Event Listeners
    authorizeBtn.addEventListener('mouseup', fetchAutho)
    pullTracksBtn.addEventListener('mouseup', pullTracks)
    generateBtn.addEventListener('mouseup', generatePlaylist)

}

window.addEventListener('DOMContentLoaded', run);