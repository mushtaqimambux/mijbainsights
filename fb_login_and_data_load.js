document.addEventListener("DOMContentLoaded", function() {
    const FB_APP_ID = "1917512025368300";
    let fbAccessToken = "";
    let postsList = [];

    window.fbAsyncInit = function() {
        FB.init({
            appId: FB_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v22.0'  // ✅ Updated to v22.0
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

    function fetchPosts() {
        let pageId = document.getElementById("pageSelect").value;
        let startDate = Math.floor(new Date(document.getElementById("startDate").value).getTime() / 1000);
        let endDate = Math.floor(new Date(document.getElementById("endDate").value).getTime() / 1000);

        postsList = []; // پرانے ڈیٹا کو صاف کریں
        fetchPostsWithPagination(`/${pageId}/posts?fields=id,message,created_time,permalink_url,attachments{media_type},likes.summary(true),comments.limit(0).summary(true),shares`);
    }

    function fetchPostsWithPagination(apiUrl) {
        FB.api(apiUrl, { access_token: fbAccessToken }, function(response) {
            if (response && response.data) {
                response.data.forEach(post => {
                    let mediaType = post.attachments ? post.attachments.data[0]?.media_type : "text";
                    postsList.push({
                        ...post,
                        media_type: mediaType,
                        comments_count: post.comments ? post.comments.summary.total_count : 0,
                        shares_count: post.shares ? post.shares.count : 0,
                        likes_count: post.likes ? post.likes.summary.total_count : 0
                    });
                });

                if (response.paging && response.paging.next) {
                    let nextUrl = new URL(response.paging.next);
                    let nextPath = nextUrl.pathname + nextUrl.search;
                    fetchPostsWithPagination(nextPath);
                } else {
                    displayPosts(postsList);
                }
            } else {
                console.error("No posts found or error:", response.error || response);
                alert("No posts found or error fetching data.");
            }
        });
    }

    function displayPosts(posts) {
        let postDataContainer = document.getElementById("postData");
        postDataContainer.innerHTML = "";

        posts.forEach((post, index) => {
            let postLink = `<a href="${post.permalink_url}" target="_blank">View Post</a>`;
            postDataContainer.innerHTML += `
                <div class='post-container'>
                    <div class='post-details'>
                        <strong>S.No:</strong> ${index + 1} <br>
                        <strong>Type:</strong> ${post.media_type} <br>
                        <strong>Message:</strong> ${post.message || "No Message"}<br>
                        <strong>Published On:</strong> ${new Date(post.created_time).toLocaleString()}<br>
                        <strong>Likes:</strong> ${post.likes_count || 0}<br>
                        <strong>Comments:</strong> ${post.comments_count || 0}<br>
                        <strong>Shares:</strong> ${post.shares_count || 0}<br>
                        ${postLink}<br>
                    </div>
                </div>
                <div class='separator'></div>
            `;
        });
    }

    function sortPosts(criteria, order) {
        postsList.sort((a, b) => {
            let valA, valB;
            if (criteria === 'likes') {
                valA = a.likes_count || 0;
                valB = b.likes_count || 0;
            } else if (criteria === 'comments') {
                valA = a.comments_count || 0;
                valB = b.comments_count || 0;
            } else if (criteria === 'shares') {
                valA = a.shares_count || 0;
                valB = b.shares_count || 0;
            } else if (criteria === 'date') {
                valA = new Date(a.created_time).getTime();
                valB = new Date(b.created_time).getTime();
            } else {
                return 0;
            }
            return order === 'asc' ? valA - valB : valB - valA;
        });

        displayPosts(postsList);
    }

    function applySorting() {
        let criteria = document.getElementById("sortCriteria").value;
        let order = document.getElementById("sortOrder").value;
        sortPosts(criteria, order);
    }

    document.getElementById("fbLoginBtn").addEventListener("click", facebookLogin);
    document.getElementById("fetchPostsBtn").addEventListener("click", fetchPosts);
    document.getElementById("sortBtn").addEventListener("click", applySorting);

    let today = new Date();
    let sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    document.getElementById("startDate").value = sevenDaysAgo.toISOString().split('T')[0];
    document.getElementById("endDate").value = today.toISOString().split('T')[0];
});
