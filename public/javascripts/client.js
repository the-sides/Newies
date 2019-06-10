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
        const statusElem = document.querySelector('.welcomeStatus');
        const playlistElem = document.querySelector('.playlistCount');
        const scroller = [...document.querySelectorAll('.contentBeneath')];

        statusElem.textContent = `Welcome ${userData.display_name}`;
        playlistElem.textContent = `You have ${userData.display_name} playlists`;

        // Show an element
        const show = function (elem) {

            // Get the natural height of the element
            const getHeight = function () {
                elem.style.display = 'block'; // Make it visible
                var height = elem.scrollHeight + 'px'; // Get it's height
                elem.style.display = ''; //  Hide it again
                return height;
            };

            const height = getHeight(); // Get the natural height
            elem.classList.add('revealed'); // Make the element visible
            elem.style.height = height; // Update the max-height

            // Once the transition is complete, remove the inline max-height so the content can scale responsively
            window.setTimeout(function () {
                elem.style.height = '';
            }, 500);

        };

        show(scroller[0])
        show(scroller[1])
        
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