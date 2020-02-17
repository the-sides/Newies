function fetchAutho() {
    // Send user to a Spotify authorization site to redirect with an autho token
    const scopes = [
        'playlist-read-private',
        'user-read-recently-played',
        'user-top-read',
        'playlist-modify-public',
        'playlist-read-collaborative',
    ]
    const url = window.location.href;

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
    if (_result.status === 200 || _result.status === 201) {
        if (_probation) console.log(`Successful Retry; Attempts: ${2}`)
        return _result;
    }
    // Only reached on a failed attempt
    if (_probation) {
        console.log(_result)
        window.alert('Jacob is a bad coder and couldn\'t prepare for all your playlists. Trying again. Feel free to give up whenever. Idgaf')
        window.location.reload()
        throw new Error(`Bad Request after ${2} attempts`)
    }
    else {
        console.error('trying again in 2 secs...');
        return false;
    }
}

function getSpotifyData(_token, url, throttleBy = 0, probation = false, postData = false) {
    return new Promise(function (resolve, reject) {
        let headerss = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _token
        })

        let spotifyRequest

        if(postData){
            console.log('post')
            spotifyRequest = new Request(url, {
                method: 'POST',
                body: postData,
                mode: 'cors',
                headers: headerss
            })
        }
        else {
            spotifyRequest = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: headerss
            })
        }

        setTimeout(() => {
            fetch(spotifyRequest)
                .then(
                    result => {
                        // errorCheckResponse will return the same result if valid
                        const response = errorCheckResponse(result, probation)

                        if (response === false)  // Keep trying...
                            return getSpotifyData(_token, url, 2000, true, postData)

                        // Success
                        else
                            return response.json();
                    }
                )
                .then(
                    (json) => resolve(json)
                )
                .catch(error => {
                    console.error('Error caught at data fetch', error);
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

async function emptyPlaylist(newies, _token) {
    // Since this is the only DELETE method, I'm just copying most of the getSpotifyData() code

    // Request all tracks currently in playlist. 
    const url = `https://api.spotify.com/v1/playlists/${newies.id}/tracks`
    const tracks = await getTracks(_token, url, newies.name);

    // Delete all found tracks. Same fetch URL is used with different method
    const toDelete = { 'uris': [] };
    tracks.items.forEach(song => {
        toDelete.uris.push(song.track.uri)
    })

    const headerss = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _token
    })
    const spotifyRequest = new Request(url, {
        method: 'DELETE',
        mode: 'cors',
        headers: headerss,
        body: JSON.stringify(toDelete)
    })
    await fetch(spotifyRequest)
        .then(
            (result) => {
                return result.json();
            }
        )
        .then(
            (json) => console.log(json)
        )
        .catch((error) => {
            console.error('Error caught during old track removal', error);
        })

}

async function createPlaylist(_name, uid, token){
    const url = `https://api.spotify.com/v1/users/${uid}/playlists`
    const data = JSON.stringify({
        name : _name,
        description : 'A playlist made by Newies web app.'
    })
    return await getSpotifyData(token, url, 0, false, data )
}

function fillPlaylist(newies, _token, tracks) {
    //   Once again...
    // Since this is the only POST, I'm just copying most of the getSpotifyData() code
    let toPost = { 'uris': [] }
    tracks.forEach(track => {
        toPost.uris.push(track.uri)
    })
    const playlist_id = newies.id;
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`
    const headerss = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _token
    })
    const spotifyRequest = new Request(url, {
        method: 'POST',
        mode: 'cors',
        headers: headerss,
        body: JSON.stringify(toPost)
    })
    fetch(spotifyRequest)
        .then(
            (result) => {
                return result.json();
            }
        )
        .then(
            (json) => console.log(json)
        )
        .catch((error) => {
            console.error('Error caught at data fetch', error);
        })
}



export { fetchAutho, 
    getSpotifyData, 
    getPlaylistList, 
    getAllPlaylists, 
    getTracks, 
    emptyPlaylist, 
    fillPlaylist, 
    createPlaylist }