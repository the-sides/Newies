import {getTracks} from './spotifyAPI.js';
/**
 *   checkToken 
 */
function checkToken(cb){
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


/**
 *  
 *  50s is an array of playlists, grouped in sets of 50 or less
 *    each playlist item is just an href which is used to request tracks to the playlist. 
 * 
 *  @param {array} _50s 
 */
async function filterPlaylists(_token, _50s){
    let trackPromises = [];
    let throttle = 100;
    for(let i = 0; i < _50s.length; i++){
        if(_50s[i].error) continue;

        // Throttle sets of 50 to prevent API lockout.
        // setTimeout(()=>{
            for(let j = 0; j < _50s[i].items.length; j++){
                if(_50s[i].items[j].collaborative === false){
                    trackPromises.push(getTracks(_token, _50s[i].items[j].tracks.href))
                }
            }

        // },0)
        // if(i === 2) break
    }
    console.log(trackPromises)

    return await Promise.all(trackPromises)

}

async function sortSongs(tracks, user, sortBy ){
    // if(!!true) return false;
    let trackBank = []
    tracks.forEach((playlist) => {
        // Some pseudo code for all you beautiful people out there (aka future jacob)
        
        trackBank = trackBank.concat(trackStripper(playlist))

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
    console.log(trackBank)
}

function trackStripper(list, user = undefined, collab = false) {
    let bufferBank = [];
    let i = 0;
    function parseSong(song){
        return {
            title: song.track.name,
            artist: song.track.artists[0].name,
            uri: song.track.uri,
            date: song.added_at
        }
    }
    console.log(list)
    if(!collab){
        list.items.forEach(song => {
            bufferBank.push(parseSong(song))
        })
    }
    else{
        list.items.forEach(song => {
            if(++i === 1) console.log(song)
            bufferBank.push(parseSong(song))
        })
        // Filter for songs that belong to this user
    }
    return bufferBank;
    // Future implementation, keep streak with dates to prevent loads
}



export {checkToken, generateVerify, sortSongs, trackStripper, filterPlaylists};