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

function trackStripper(list, user, collab) {
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


async function grabAllPlaylists() {
    if (session_data.playlistData === undefined)
        return false;

    // * 
    // *   ARRAY 
    // *      OF 
    // *        PROMISES!
    // *                       each being a promise for a 50 playlist list 
    // *                            Once a list is achieved, intiate another 
    // *                             to scrape songs.  

    let totalPlaylistLeft = session_data.playlistData.total;
    let offset = 0;
    let listRetrievals = []

    for (let i = 0; i < Math.ceil(session_data.playlistData.total / 50) + 1; i++) {
        const limiter = totalPlaylistLeft < 50 ? totalPlaylistLeft : 50;
        const listOf50 = getPlaylistList(false, offset, limiter)

        totalPlaylistLeft -= 50;
        offset += 50;
        listRetrievals.push(listOf50);

        if(i === 3) break;
    }
    // console.log('finished calling promises. Am I still the fastest around', listRetrievals);

    const allLists = await Promise.all(listRetrievals)
    .then(rv => { 
        console.log('race over', rv) 
        return rv;
    })
    return allLists;
}

export {checkToken, sortSongs, trackStripper, grabAllPlaylists};