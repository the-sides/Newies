function fetchAutho() {
    // Send user to a Spotify authorization site to redirect with an autho token
    const port = 3001;
    const scopes = [
        'playlist-read-private',
        'user-read-recently-played',
        'user-top-read',
        'playlist-modify-public',
        'playlist-read-collaborative',
    ]
    const url = `http://127.0.0.1:${port}`;

    window.location = "https://accounts.spotify.com/authorize?"
        + "client_id=9ae70c7a06b14e38bc355c0b4e7f8d42&"
        + "redirect_uri="
        + url
        + "&scope="
        + scopes.join('%20')
        + "&response_type=token&state=123";
}
function errorCheckResponse(_result, _probation) {
    // Success
    if (_result.status == 200) {
        if (_probation) console.log(`Retry successful; Attempts: ${2}`)
        return _result;
    }
    // Only reached on a failed attempt
    if (_probation) {
        console.log(_result)
        throw new Error(`Bad Request after ${2} attempts`)
    }
    else {
        console.error('trying again in 2 secs...');
        return false;
    }
}

function getSpotifyData(_token, url, throttleBy = 0, probation = false) {
    return new Promise(function (resolve, reject) {
        let headerss = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _token
        })
        let spotifyRequest = new Request(url, {
            method: 'GET',
            mode: 'cors',
            headers: headerss
        })
        setTimeout(() => {
            fetch(spotifyRequest)
                .then(
                    result => {
                        // errorCheckResponse will return the same result if valid
                        const response = errorCheckResponse(result, probation)

                        if (response === false)  // Keep trying...
                            return getSpotifyData(_token, url, 2000, true)

                        // Success
                        else
                            return response.json();
                    }
                )
                .then(
                    (json) => resolve(json)
                )
                .catch(error => {
                    console.error('Error caught at data fetch');
                    reject(error)
                })
        }, throttleBy)
    })
}

////////////////////////////////////////////////
//      getSpotifyData wrappers
////////////////////////////////////////////////
/**
 *   getTracks(token, href)
 *      Will take the url to a playlist and produce a promise for all the tracks.
 */
async function findNewiesPlaylist(listOf50s){
    const url = '';
    const response = await getSpotifyData(url);
    return null;

}
async function getTracks(_token, href, pName = '') {
    let dataRes = await getSpotifyData(_token, href);
    dataRes['pName'] = pName;
    return dataRes;
}

async function getPlaylistList(_uid, _token, offset = 0, limit = 50) {
    console.log(`requesting playlist at offset ${offset}, limit: ${limit}`)
    const url = `https://api.spotify.com/v1/users/${_uid}/playlists?limit=${limit}&offset=${offset}`;

    return await getSpotifyData(_token, url)
        .catch(err => { console.error('caught in listlist', err); })
}

/*
 * 
 * @param {String} uid 
 * @param {String} token 
 * @param {Number} nPlaylists 
 */
async function getAllPlaylists(uid, token, nPlaylists) {

    // *   ARRAY 
    // *      OF 
    // *        PROMISES!
    // *                       each being a promise for a 50 playlist list 
    // *                            Once a list is achieved, intiate another 
    // *                             to scrape songs.  

    let totalPlaylistLeft = nPlaylists;
    let offset = 0;
    let listRetrievals = []

    for (let i = 0; i < Math.ceil(nPlaylists / 50); i++) {
        const limiter = totalPlaylistLeft < 50 ? totalPlaylistLeft : 50;
        const listOf50 = getPlaylistList(uid, token, offset, limiter);

        totalPlaylistLeft -= 50;
        offset += 50;
        listRetrievals.push(listOf50);

        // Getting rid of this = WIN
        // if(i === 3) break;
    }

    const allLists = await Promise.all(listRetrievals)
        .then(rv => {
            console.log('race over', rv)
            return rv;
        })
        .catch(rv => {
            console.error('One of allLists failed', rv)
        })
    return allLists;
}


export { fetchAutho, getSpotifyData, getPlaylistList, getAllPlaylists, getTracks}