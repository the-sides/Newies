// lmao ancient code
// ? var trackLimit = 20
const session_data = {
    token: undefined,
    userData: undefined,
    playlistData: undefined,
    trackBank: [],
}

function run() {

    // Runs twice, once failing when the page is initially accessed, and 
    let token = window.location.href.indexOf("access_token=");


    if (token !== -1) {
        // Info found in url
        token = window.location.href
            .substring(
                token + 13,
                window.location.href.indexOf('&')
            )
        console.log(token)
        session_data.token = token;

        // Start user breakdown
        revealStatus('connected', session_data.token);

    }

    //* Queries
    const authorizeBtn = document.getElementById('authoBtn');
    const generateBtn = document.getElementById('generateBtn');

    function authorizeButton() {
        const scopes = [
            'playlist-read-private',
            'user-read-recently-played',
            'user-top-read',
            'playlist-modify-public',
            'playlist-read-collaborative',
        ]
        window.location = "https://accounts.spotify.com/authorize?client_id=9ae70c7a06b14e38bc355c0b4e7f8d42&redirect_uri=http://127.0.0.1:3000" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"
    }

    function generateButton() {
        if (session_data.token === -1)
            return false;

        console.log('User Authenticated', session_data.token);

        if (session_data.userData === undefined) {
            console.log('waiting for user data')
            return false;
        }
        console.log('User data confirmed.\nPulling all playlists...')

        grabAllPlaylists()
        //// .then(
        ////     function(response){
        ////         console.log('FINAL REPORT. length and then parma ', 
        ////             session_data.trackBank.length, response)
        ////     }
        //// );
    }

    function renderUserData(userData) {
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

    function displayPlaylistCount(data) {
        console.log('fetching playlists from', data)
        const playlistElem = document.querySelector('.playlistCount');
        playlistElem.textContent = `You have ${data.total} playlists`;
    }

    async function getPlaylistList(renderPlz = false, offset = 0, limit = 50, uid = session_data.userData.id, token = session_data.token) {
        console.log(`calling for offset ${offset}, limit: ${limit}`)
        const url = `https://api.spotify.com/v1/users/${uid}/playlists?limit=${limit}&offset=${offset}`;
        const plist = await getSpotifyData(token, url)
            .then(response => {
                if (renderPlz)
                    displayPlaylistCount(response)
                session_data.playlistData = response;
                return response;
            }
            );
        return plist;
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


    function revealStatus(stage, token, userData = undefined) {
        switch (stage) {
            case 'connected':
                getSpotifyData(token, 'https://api.spotify.com/v1/me/')
                    .then(rv => {
                        session_data.userData = rv;
                        return renderUserData(rv)
                    })
                    .then(userData => revealStatus('playlist summary', token, userData));
                break;
            case 'playlist summary':
                getPlaylistList(true);
                break;
        }
    }

    async function getSinglePlaylist(url) {
        const startTime = Date.now();
        const trackDump = await getSpotifyData(session_data.token, url)
            .then(playlist => {
                let bufferBank = [];
                // console.log('single playlist', playlist);
                if(playlist.items === undefined) {
                    console.log(playlist)
                    return [];
                }
                playlist.items.forEach(song => {
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
                // resolve(bufferBank);
                return bufferBank;
            })
        console.log('time elapsed for playlist', Date.now() - startTime)
        // console.log('await return', trackDump);
        Array.prototype.push.apply(session_data.trackBank, trackDump)
        return trackDump;
    }

    async function grabAllPlaylists() {
        if (session_data.playlistData === undefined)
            return false;

        let totalPlaylistLeft = session_data.playlistData.total;
        console.log(totalPlaylistLeft)

        // First playlistData fetch of 50 playlists was to list 
        // for(let totalPlaylistLeft = session_data.playlistData.total; 
        //         totalPlaylistLeft > 50; 
        //         totalPlaylistLeft--         ){

        // * 
        // *   ARRAY 
        // *      OF 
        // *        PROMISES!
        // *                       each being a promise for a 50 playlist list 
        // *                            Once a list is achieved, intiate another 
        // *                             to scrape songs.  

        let listRetrievals = []
        // There will be 1 for every 50 songs.


        let offset = 0;

        for (let i = 0; i < Math.ceil(session_data.playlistData.total / 50) + 1; i++) {
            // while(!fni)
            let url;

            // Instead of returning anything,
            //   this will lopp through a playlist's tracks
            //   saving all tracks to a session_data key
            console.log('pre-op playlist get list | Offset: ', offset);
            // console.log(Math.ceil(session_data.playlistData.total / 50))
            // * You're now working with a new list of playlists, in increments of <= 50

            const listPromise = new Promise(function (resolve, reject) {
                console.log('searching at offset', offset);
                const limiter = totalPlaylistLeft < 50 ? totalPlaylistLeft : 50;
                return getPlaylistList(false, offset, limiter)
                    .then(newList => {
                        console.log(newList)
                        let playlistRetrieval = [];
                        for (let j = 0; (j < 50) && (j < totalPlaylistLeft); j++) {
                            const playlist_id = newList.items[j].id;
                            const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
                           

                            if('the_sides' !== newList.items[j].owner.display_name){
                                console.log(`#${i*50 + j}!!! NOT MY PLAYLIST !!! `, newList.items[j].name)
                                continue;
                            }
                            else console.log(`#${i*50 + j}pulling playlist: `, newList.items[j].name);

                            // Returns promise for playlist tracks
                            getSinglePlaylist(url).then(tracks=>{
                                console.log(`NEW TRACKS ${tracks.length}`)
                                resolve(tracks)
                            })
                            // playlistRetrieval.push(
                                // .then(tracks => {
                                //     // To prevent playlist not owned by user.
                                //     if(tracks === null) 
                                //         return 'other'; // Just breaks resolve callback

                                //     Array.prototype.push.apply(session_data.trackBank, tracks);
                                //     //// console.log('tracks', tracks)
                                // })
                            // )
                        }
                        // console.log(`Playlist Retrieval | Offset, ${offset} `, playlistRetrieval)
                        // return playlistRetrieval;  
                    })
                    // .then(playlistPromises => {
                    //     Promise.all(playlistPromises).then(status=>{
                    //         console.log(`Offset: ${offset} complete`, status)
                    //         // resolve(`Offset: ${offset} complete`)
                    //     })
                    // })
            })  // End Of Promise


            // const listPromise = 
            totalPlaylistLeft -= 50;
            offset += 50;
            listRetrievals.push(listPromise);
            // TODO: REMOVE THIS AND MAKE WORKING FOR ALL PLAYLISTS
            if(i === 3) break;
        }
        console.log('finished calling promises. Am I still the fastest around', listRetrievals);

        Promise.all(listRetrievals)
        .then(rv => { 
            console.log('race over', rv) 
            console.log(session_data.trackBank)
        })
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

    // Event Listeners
    authorizeBtn.addEventListener('mouseup', authorizeButton)
    generateBtn.addEventListener('mouseup', generateButton)

}

window.addEventListener('DOMContentLoaded', run);