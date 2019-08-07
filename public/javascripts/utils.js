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

async function sortSongs(list50s, user, ){
    list50s.forEach((playlist) => {
        // Some pseudo code for all you beautiful people out there (aka future jacob)

        // Check each playlist to find the owner.
        //    if one owners && [0]=={{user}}
                //     trackStrip()
        //    else n owners   
                //   if collab trackStrip(collab)
                //   else not collab  skip list
                //   

        if(playlist.owners[0] === user){
            // trackStripper
        }

    })
}

function trackStripper(list, user) {
    let bufferBank = [];
    list.items.forEach(song => {
        //// let dateStreak = 0;
        // console.log('song', song.track.uri, Date.parse(song.added_at));
        bufferBank.push({
            title: song.track.name,
            artist: song.track.artists[0].name,
            uri: song.track.uri,
            date: song.added_at
        })
        // console.log('song', bufferBank[bufferBank.length-1])
    })
    return bufferBank;
}



export {checkToken, generateVerify, sortSongs, trackStripper};