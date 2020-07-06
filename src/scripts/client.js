import {confirmHTTPS, checkToken, generateVerify, sortTracks, trackStripper, filterPlaylists, filterTracks, findNewiesPlaylist} from './utils.js'
import {fetchAutho, getSpotifyData, getAllPlaylists, getPlaylistList, emptyPlaylist, fillPlaylist, createPlaylist } from './spotifyAPI.js'
import {displayUser, displayPlaylistCount, initRing, revealFeed, hideBtn, revealBtn, postFeed} from './ui.js'

const session_data = {
    token: undefined,
    userData: undefined,
    nPlaylists: 0,
    trackBank: [],
    newiesList: undefined,
}

function run() {
    
    confirmHTTPS()

    checkToken((token)=>{
        if(null !== token){
            session_data.token = token;

            // Establish user data with site and set session_data
            getSpotifyData(token, 'https://api.spotify.com/v1/me/')
            .then(userdata =>{
                session_data.userData = userdata;
                console.log(userdata)
                revealFeed();
                hideBtn('#authoBtn');
                revealBtn('#pullTracksBtn')
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
        hideBtn('#pullTracksBtn')
        generateVerify(session_data, ()=>{
            // All systems are a go
            getAllPlaylists(session_data.userData.id, session_data.token, session_data.nPlaylists)
            .then((list50s)=>{
                postFeed('All playlists pulled');

                session_data.newiesList = findNewiesPlaylist(list50s)


                postFeed('Pulling tracks...');
                filterPlaylists(session_data.token, list50s, session_data.userData.id)
                .then((trackDump)=>{
                    filterTracks(trackDump, session_data.userData, 'date')
                    .then(formattedTracks => {
                        session_data.trackBank = formattedTracks;
                        postFeed("All tracks received");
                        revealBtn('#generateBtn')
                    })
                })
            })
        })
    }

    async function generatePlaylist(){
        // * Newies playlist must be made
        // let newPlaylist = false
        if(session_data.newiesList === null){
            session_data.newiesList = await createPlaylist('Newies', session_data.userData.id, session_data.token)
            console.log('new list', session_data.newiesList)
            postFeed('Created "Newies" playlist')
        }

        // * By this point, playlist should be known
        else {
            await emptyPlaylist(session_data.newiesList, session_data.token)
            postFeed('Emptied "Newies" playlist')
        }



        postFeed('Filling "Newies" playlist')
        sortTracks(session_data.trackBank)
            .then(latest => {
                // Split into chunks of 100
                const chunks = latest.reduce((resultArray, item, index) => { 
                    const chunkIndex = Math.floor(index/100)
                  
                    if(!resultArray[chunkIndex]) {
                      resultArray[chunkIndex] = [] // start a new chunk
                    }
                  
                    resultArray[chunkIndex].push(item)
                  
                    return resultArray
                  }, [])
                chunks.forEach(chunk => {
                    fillPlaylist(session_data.newiesList, session_data.token, chunk);
                })
            });

        
        postFeed('Your "Newies" playlist is live')
    }

    // Event Listeners
    authorizeBtn.addEventListener('mouseup', fetchAutho)
    pullTracksBtn.addEventListener('mouseup', pullTracks)
    generateBtn.addEventListener('mouseup', generatePlaylist)

}

window.addEventListener('DOMContentLoaded', run);