function fetchAutho() {
    // Send user to a Spotify authorization site to redirect with an autho token
    const scopes = [
        'playlist-read-private',
        'user-read-recently-played',
        'user-top-read',
        'playlist-modify-public',
        'playlist-read-collaborative',
    ]
    const url = 'http://127.0.0.1:3000'; 

    window.location = "https://accounts.spotify.com/authorize?"
        + "client_id=9ae70c7a06b14e38bc355c0b4e7f8d42&"
        + "redirect_uri=" 
        +  url
        + "&scope=" 
        + scopes.join('%20') 
        + "&response_type=token&state=123";
}

function getSpotifyData(_token, url) {
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

        fetch(spotifyRequest)
            .then(
                result => { return result.json() }
            )
            .then(
                (json) => resolve(json)
            )
            .catch(error => reject(error))
    })
}

async function getPlaylistList(_uid , _token, offset = 0, limit = 50) {
    console.log(`requesting playlist at offset ${offset}, limit: ${limit}`)
    const url = `https://api.spotify.com/v1/users/${_uid}/playlists?limit=${limit}&offset=${offset}`;

    // TODO: Try `return await getSpo...` once things are working. Lose plist.
    return await getSpotifyData(_token, url)
            .then(response => {
                return response;
            })
}


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

    for (let i = 0; i < Math.ceil(nPlaylists / 50) + 1; i++) {
        const limiter = totalPlaylistLeft < 50 ? totalPlaylistLeft : 50;
        const listOf50 = getPlaylistList(uid, token, offset, limiter);

        totalPlaylistLeft -= 50;
        offset += 50;
        listRetrievals.push(listOf50);

        // Getting rid of this = WIN
        if(i === 3) break;
    }

    const allLists = await Promise.all(listRetrievals)
    .then(rv => { 
        console.log('race over', rv) 
        return rv;
    })
    return allLists;
}


export {fetchAutho, getSpotifyData, getPlaylistList, getAllPlaylists}