function authorizeButton() {
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

export {authorizeButton, getSpotifyData}