$(() =>{

    // Runs twice, once failing when the page is initially accessed, and 
    let token = window.location.href.indexOf("access_token=");

    // lmao ancient code
    // ? var trackLimit = 20
    const session_data = {
        token: undefined,
        userData: undefined,
        playlistData: undefined,
        trackBank: [],
    }

    if(token !== -1){
        // Info found in url
        token = window.location.href
            .substring(
                token+13,
                window.location.href.indexOf('&') 
            )
        console.log(token)
        session_data.token = token;

        // Start user breakdown
        revealStatus('connected', session_data.token);

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
        if(session_data.token === -1) 
            return false;

        console.log('User Authenticated', session_data.token);

        if(session_data.userData === undefined){
            console.log('waiting for user data')
            return false;
        }
        console.log('User data confirmed.\nPulling all playlists...')

        grabAllPlaylists();
    })

    function renderUserData(userData){
        console.log('rendering', userData)
        const statusElem = document.querySelector('.welcomeStatus');
        const scroller = [...document.querySelectorAll('.contentBeneath')];

        statusElem.textContent = `Welcome ${userData.display_name}`;

        // Show an element
        // I know I know I'm bad. Stolen and weakly implemented from here
        // https://jsfiddle.net/mo0cn97s/
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

        // This is passed into a function that will take the user's id and
        //  fetch a list of playlists to furth compute
        return userData;
    }

    function renderPlaylistSummary(data){
        console.log('fetching playlists from', data)
        const playlistElem = document.querySelector('.playlistCount');
        playlistElem.textContent = `You have ${data.total} playlists`;
        session_data.playlistData = data;
    }

    function getSpotifyData(_token, url){ 
        return new Promise(function(resolve, reject){
            let headerss = new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + _token
            })
            let spotifyRequest = new Request(url,{
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

    
    function revealStatus(stage, token, userData = undefined){
        switch(stage){
            case 'connected': 
                getSpotifyData(token, 'https://api.spotify.com/v1/me/')
                .then(rv => {
                    session_data.userData = rv;
                    return renderUserData(rv)
                })
                .then(userData => revealStatus('playlist summary', token, userData));
                break;
            case 'playlist summary':
                getSpotifyData(token, `https://api.spotify.com/v1/users/${userData.id}/playlists?limit=50`)
                .then(rv => renderPlaylistSummary(rv));
                break;
        }
    }

    async function getSinglePlaylist(url) {
        const startTime = Date.now();
        const trackDump = await getSpotifyData(session_data.token, url)
        .then(playlist => {
            console.log('single playlist', playlist);
            playlist.items.forEach(song =>{
                let dateStreak = 0;
                // console.log('song', song.track.uri, Date.parse(song.added_at));
                bufferBank.push({
                    title: song.track.name,
                    artist: song.track.artists[0].name,
                    uri: song.track.uri,
                    date: song.added_at 
                })
                // console.log('song', bufferBank[bufferBank.length-1])
            })
            // resolve(bufferBank);
            return bufferBank;
            // Array.prototype.push.apply(trackBank, bufferBank);
        })
        console.log('time elapsed for playlist', Date.now() - startTime)
        console.log('await return', trackDump);
        Array.prototype.push.apply(session_data.trackBank, trackDump)
        return true;
    }

    function grabAllPlaylists(){
        if(session_data.playlistData === undefined) 
            return false; 

        let totalPlaylistLeft = session_data.playlistData.total;
        console.log(totalPlaylistLeft)
        
        // First playlistData fetch of 50 playlists was to list 
        // for(let totalPlaylistLeft = session_data.playlistData.total; 
        //         totalPlaylistLeft > 50; 
        //         totalPlaylistLeft--         ){
            for(let i = 0; i < totalPlaylistLeft % 50; i++){
                let playlist_id = session_data.playlistData.items[i].id;
                let url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

                // Instead of returning anything,
                //   this will lopp through a playlist's tracks
                //   saving all tracks to a 
                getSinglePlaylist(url);
            }

        //     totalPlaylistLeft -= 50;

        //     // Find last page of playlists 
        //     if(totalPlaylistLeft < 1){
        //         totalPlaylistLeft *= -1;
        //     }
        // }

        

        // for(let i = 0; i < Math.floor(session_data.playlistData.total / 50); i++){
        //     // Within a specific playlist
        //     // for(let trackIndex = 0;)
        // }

    }
})