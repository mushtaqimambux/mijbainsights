document.addEventListener("DOMContentLoaded", function() {
    const FB_APP_ID = "1917512025368300"; // اپنی Facebook App ID لگائیں
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
        }, {scope: 'pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_metadata'});
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
        mediaList = [];
        fetchMediaWithPagination(`/${pageId}/published_posts?fields=id,message,created_time,permalink_url,attachments{media_type,media,url},comments.limit(0).summary(true),shares`);
    }

    function fetchMediaWithPagination(apiUrl) {
        FB.api(apiUrl, { access_token: fbAccessToken }, function(response) {
            if (response && response.data) {
                response.data.forEach(post => {
                    let mediaType = post.attachments?.data[0]?.media_type || "unknown";
                    let mediaUrl = post.attachments?.data[0]?.url || "No Media";
                    mediaList.push({
                        id: post.id,
                        message: post.message || "No Caption",
                        created_time: post.created_time,
                        permalink_url: post.permalink_url,
                        media_type: mediaType,
                        media_url: mediaUrl,
                        comments_count: post.comments ? post.comments.summary.total_count : 0,
                        shares_count: post.shares ? post.shares.count : 0
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
            mediaDataContainer.innerHTML += `
                <div class='media-container'>
                    <div class='media-details'>
                        <strong>S.No:</strong> ${index + 1} <br>  
                        <strong>Type:</strong> ${item.media_type} <br>
                        <strong>Caption:</strong> ${item.message} <br>
                        <strong>Published On:</strong> ${new Date(item.created_time).toLocaleString()}<br>
                        <strong>Comments:</strong> ${item.comments_count || 0}<br>
                        <strong>Shares:</strong> ${item.shares_count || 0}<br>
                        <strong>Media:</strong> <a href="${item.media_url}" target="_blank">View Media</a><br>
                        ${watchLink}<br>
                    </div>
                </div>
                <div class='separator'></div>
            `;
        });
    }

    function sortMedia(criteria, order) {
        mediaList.sort((a, b) => {
            let valA, valB;
            if (criteria === 'date') {
                valA = new Date(a.created_time).getTime();
                valB = new Date(b.created_time).getTime();
            } else if (criteria === 'comments') {
                valA = a.comments_count || 0;
                valB = b.comments_count || 0;
            } else if (criteria === 'shares') {
                valA = a.shares_count || 0;
                valB = b.shares_count || 0;
            } else {
                return 0;
            }
            return order === 'asc' ? valA - valB : valB - valA;
        });
        displayMedia(mediaList);
    }

    function applySorting() {
        let criteria = document.getElementById("sortCriteria").value;
        let order = document.getElementById("sortOrder").value;
        sortMedia(criteria, order);
    }

    document.getElementById("fbLoginBtn").addEventListener("click", facebookLogin);
    document.getElementById("fetchMediaBtn").addEventListener("click", fetchMedia);
    document.getElementById("sortBtn").addEventListener("click", applySorting);
});
