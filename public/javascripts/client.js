$(() =>{

    // Runs twice, once failing when the page is initially accessed, and 
    var token = window.location.href.indexOf("access_token=");
    var trackLimit = 20
    const data = {
        token: undefined
    }

    if(token !== -1){
        // Info found in url
        token = window.location.href
            .substring(
                token+13,
                window.location.href.indexOf('&') 
            )
        console.log(token)
        data.token = token;

        // Start user breakdown
        revealStatus('connected', data.token);

    }

    $('#authoBtn').click(() => {
        const scopes = [
            'playlist-read-private',
            'user-read-recently-played',
            'user-top-read',
            'playlist-modify-public',
            'playlist-read-collaborative',
        ]
        window.location = "https://accounts.spotify.com/authorize?client_id=9ae70c7a06b14e38bc355c0b4e7f8d42&redirect_uri=http://127.0.0.1:3000" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"
    })

    $("#generateBtn").click(() => {
        if(token === -1) return;
        console.log(token)
    })

    function renderUserData(userData){
        console.log('rendering', userData)
    }

    function getUserData(_token){ 
        return new Promise(function(resolve, reject){
            let headerss = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + _token
            })
            let spotifyRequest = new Request('https://api.spotify.com/v1/me/',{
                method: 'GET',
                mode: 'cors',
                headers: headerss
            })
            
            fetch(spotifyRequest)
            .then(
                result => {return result.json()}
            )
            .then(
                (json) => resolve(json)
            )
            .catch(error => reject(error))
        })
    }

    
    function revealStatus(stage, token){
        switch(stage){
            case 'connected': 
                getUserData(token).then(rv => renderUserData(rv))
                break;
        }
    }
})