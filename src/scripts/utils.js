import { getTracks } from './spotifyAPI.js';
import { postFeed, changeBtn } from './ui.js';

function confirmHTTPS(){
    if(-1 === window.location.href.indexOf('https') && -1 === window.location.href.indexOf('localhost')){
        const newUrl = window.location.href
        newUrl.replace('http', 'https')
        window.location.replace('https://newies.herokuapp.com/')
    }
}

/**
 *   checkToken 
 */
function checkToken(cb) {
    let token = window.location.href.indexOf("access_token=");
    if (token !== -1) {
        // Info found in url
        token = window.location.href
            .substring(
                token + 13,
                window.location.href.indexOf('&')
            )
        console.log('From checkToken', token)
        cb(token)
        return token;
    }
    return null;

}

// A checker function. 
function generateVerify(_session_data, cb) {
    if (_session_data.token === -1)
        return false;

    console.log('User Authenticated', _session_data);

    if (_session_data.userData === undefined) {
        console.log('user data not found')
        return false;
    }
    console.log('User data confirmed.\nPulling all playlists...')

    cb()
}

function validateList(playlist, user){
    const ignoreList = ['Newies', 'Discover Weekly Archive', 'Discover Daily']
    if(playlist.owner.id !== user) return false;
    if(ignoreList.includes(playlist.name)) return false;
    return true;
}

/**
 *  
 *  50s is an array of playlists, grouped in sets of 50 or less
 *    each playlist item is just an href which is used to request tracks to the playlist. 
 * 
 *  @param {array} _50s 
 */
async function filterPlaylists(_token, _50s, uid) {
    let trackPromises = [];
    let throttle = 100;
    for (let i = 0; i < _50s.length; i++) {
        if (_50s[i].error) {
            console.error(_50s[i].error)
            continue;
        }

        for (let j = 0; j < _50s[i].items.length; j++) {
            let crnt = _50s[i].items[j]
            if(validateList(crnt, uid)){
                trackPromises.push(getTracks(_token, crnt.tracks.href, crnt.name))
            }
        }

    }
    console.log(trackPromises)

    return await Promise.all(trackPromises)

}
async function filterTracks(tracks, user) {
    let trackBank = []
    tracks.forEach((playlist) => {
        trackBank = trackBank.concat(trackStripper(playlist))

        // Some pseudo code for all you beautiful people out there (aka future jacob)
        // Check each playlist to find the owner.
        //    if one owners && [0]=={{user}}
                //     trackStrip()
        //    else n owners   
                //   if collab trackStrip(collab)
                //   else not collab  skip list
                //   

        // if(playlist.owners[0] === user){
        //     // trackStripper
        // }

    })
    return await trackBank;
}

function trackStripper(list, user = undefined, collab = false) {
    if (list === undefined) 
        throw new Error("Can't strip an undefined list ¯\\_(ツ)_/¯")
    let bufferBank = [];

    function parseSong(song, pName) {
        if(song === null || song.track === null){
            console.log(`This song failed?`, song.track)
            return false;
        }
        
        if(true === song.is_local){
            console.log(`This song is local, ignoring`, song)
            return false
        }

        return {
            title: song.track.name,
            artist: song.track.artists[0].name,
            uri: song.track.uri,
            date: song.added_at,
            playlist: pName,
        }
    }

    // Filter for songs that belong to this user
    if (!collab) {
        list.items.forEach(songItem => {
            bufferBank.push(parseSong(songItem, list.pName))
        })
    }
    else {
        list.items.forEach(songItem => {
            bufferBank.push(parseSong(songItem))
        })
    }

    return bufferBank.filter(truthy => truthy);
    // Future implementation, keep streak with dates to prevent loads
}
function findNewiesPlaylist(listOf50s){

    for(let i=0; i < listOf50s.length; i++ ){
        for(let j=0; j < listOf50s[i].items.length; j++ ){
            if(listOf50s[i].items[j].name === 'Newies'){
                postFeed('Existing Newies playlist found!');
                changeBtn('#generateBtn', 'Update Playlist');
                return listOf50s[i].items[j];
            }
        }
    }

    postFeed('Newies playlist was not found');
    postFeed('One can be generated');

    return null;
}

async function sortTracks(tracks) { 
    let rv = [];
    let saved = 0;
    let i = tracks.length;
    console.log(tracks.length)
    tracks.sort((a, b) => {
        if(a === null || b === null) return 1; 
        return (a.date > b.date) ? 1 : -1
    })

    while(saved < 30 && i > 0){
        i--;
        if(tracks[i] !== undefined)
            saved++;   // For the purpose of ignoring undefined
        rv.push(tracks[i])
    }
    console.log(rv)
    return rv; 
}

export { confirmHTTPS, checkToken, generateVerify, sortTracks, trackStripper, filterPlaylists, filterTracks, findNewiesPlaylist};