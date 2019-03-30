$(() =>{

    // Runs twice, once failing when the page is initially accessed, and 
    var token = window.location.href.indexOf("access_token=");
    var trackLimit = 20
    console.log("Boom, let's get these songs ", token+13)
    if(token !== -1){
        token = window.location.href
            .substring(
                token+13,
                window.location.href.indexOf('&') 
            )
        console.log(token)
    }

    $('#authoBtn').click(() => {
        const scopes = [
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-read-collaborative',
        ]
        window.location = "https://accounts.spotify.com/authorize?client_id=9ae70c7a06b14e38bc355c0b4e7f8d42&redirect_uri=http://127.0.0.1:3000" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"
    })

    $("#generateBtn").click(() => {
        if(token === -1) return;
        console.log(token)
    })
})