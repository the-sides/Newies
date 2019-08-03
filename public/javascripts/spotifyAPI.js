
    function getSpotifyData(_token = session_data.token, url) {
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