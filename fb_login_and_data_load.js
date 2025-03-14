    


document.addEventListener("DOMContentLoaded", function() {
    const FB_APP_ID = "1917512025368300";
    let fbAccessToken = "";
    let mediaList = [];

    window.fbAsyncInit = function() {
        FB.init({
            appId: FB_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v22.0'
        });
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement("script"); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    function facebookLogin() {
        FB.login(function(response) {
            if (response.authResponse) {
                fbAccessToken = response.authResponse.accessToken;
                alert("Logged in successfully!");
                loadPages();
            } else {
                alert("User cancelled login or did not fully authorize.");
            }
        }, {scope: 'pages_show_list,pages_read_engagement,pages_read_user_content'});
    }

    function loadPages() {
        FB.api('/me/accounts', { access_token: fbAccessToken }, function(response) {
            let pageSelect = document.getElementById("pageSelect");
            pageSelect.innerHTML = "";
            response.data.forEach(page => {
                pageSelect.innerHTML += `<option value="${page.id}">${page.name}</option>`;
            });
        });
    }

    function fetchMedia() {
        let pageId = document.getElementById("pageSelect").value;
        let mediaType = document.getElementById("mediaType").value;
        let startDate = Math.floor(new Date(document.getElementById("startDate").value).getTime() / 1000);
        let endDate = Math.floor(new Date(document.getElementById("endDate").value).getTime() / 1000);

        mediaList = []; // پرانے ڈیٹا کو صاف کریں
        let apiUrl = `/${pageId}/published_posts?fields=id,message,created_time,permalink_url,likes.summary(true),comments.limit(0).summary(true),shares`;

        if (mediaType === "videos") {
            apiUrl = `/${pageId}/videos?fields=id,title,description,created_time,permalink_url,views,likes.summary(true),comments.limit(0).summary(true),shares`;
        } else if (mediaType === "reels") {
            apiUrl = `/${pageId}/reels?fields=id,caption,created_time,permalink_url,views,likes.summary(true),comments.limit(0).summary(true),shares`;
        } else if (mediaType === "photos") {
            apiUrl = `/${pageId}/photos?fields=id,name,created_time,permalink_url,likes.summary(true),comments.limit(0).summary(true),shares`;
        }

        fetchMediaWithPagination(apiUrl);
    }

    function fetchMediaWithPagination(apiUrl) {
        FB.api(apiUrl, { access_token: fbAccessToken }, function(response) {
            if (response && response.data) {
                response.data.forEach(item => {
                    mediaList.push({
                        ...item,
                        comments_count: item.comments ? item.comments.summary.total_count : 0,
                        likes_count: item.likes ? item.likes.summary.total_count : 0,
                        shares_count: item.shares ? item.shares.count : 0
                    });
                });

                if (response.paging && response.paging.next) {
                    let nextUrl = new URL(response.paging.next);
                    let nextPath = nextUrl.pathname + nextUrl.search;
                    fetchMediaWithPagination(nextPath);
                } else {
                    displayMedia(mediaList);
                }
            } else {
                console.error("No media found or error:", response.error || response);
                alert("No media found or error fetching data.");
            }
        });
    }

    function displayMedia(media) {
        let mediaDataContainer = document.getElementById("mediaData");
        mediaDataContainer.innerHTML = "";

        media.forEach((item, index) => {
            let watchLink = `<a href="${item.permalink_url}" target="_blank">View on Facebook</a>`;
            let title = item.title || item.caption || item.name || item.message || "No Title";

            mediaDataContainer.innerHTML += `
                <div class='media-container'>
                    <div class='media-details'>
                        <strong>S.No:</strong> ${index + 1} <br>  
                        <strong>Title:</strong> ${title}<br>
                        <strong>Published On:</strong> ${new Date(item.created_time).toLocaleString()}<br>
                        <strong>Views:</strong> ${item.views || 0}<br>
                        <strong>Likes:</strong> ${item.likes_count || 0}<br>
                        <strong>Comments:</strong> ${item.comments_count || 0}<br>
                        <strong>Shares:</strong> ${item.shares_count || 0}<br>
                        ${watchLink}<br>
                    </div>
                </div>
            `;
        });
    }

    function applySorting() {
        let criteria = document.getElementById("sortCriteria").value;
        let order = document.getElementById("sortOrder").value;

        mediaList.sort((a, b) => {
            let valA = a[criteria] || 0;
            let valB = b[criteria] || 0;
            return order === 'asc' ? valA - valB : valB - valA;
        });

        displayMedia(mediaList);
    }

    document.getElementById("fbLoginBtn").addEventListener("click", facebookLogin);
    document.getElementById("fetchMediaBtn").addEventListener("click", fetchMedia);
    document.getElementById("sortBtn").addEventListener("click", applySorting);
});
