
 document.addEventListener("DOMContentLoaded", function() {
     const FB_APP_ID = "1917512025368300";
     let fbAccessToken = "";
     let videosList = [];
 
     window.fbAsyncInit = function() {
         FB.init({
             appId: FB_APP_ID,
             cookie: true,
             xfbml: true,
             version: 'v18.0'
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
 
     function fetchVideos() {
     let pageId = document.getElementById("pageSelect").value;
     let startDate = Math.floor(new Date(document.getElementById("startDate").value).getTime() / 1000);
     let endDate = Math.floor(new Date(document.getElementById("endDate").value).getTime() / 1000);
 
     videosList = []; // پرانے ڈیٹا کو صاف کریں
     fetchVideosWithPagination(`/${pageId}/videos?fields=id,title,description,created_time,permalink_url,views,comments.limit(0).summary(true),shares&since=${startDate}&until=${endDate}`);
 }


function fetchVideosWithPagination(apiUrl) {
    FB.api(apiUrl, { access_token: fbAccessToken }, function(response) {
        if (response && response.data) {
            response.data.forEach(video => {
                videosList.push({
                    ...video,
                    comments_count: video.comments ? video.comments.summary.total_count : 0,
                    shares_count: video.shares ? video.shares.count : 0  // ✅ Shares شامل کر دیا گیا
                });
            });

            // **اگر next page موجود ہو تو اسے بھی کال کریں**
            if (response.paging && response.paging.next) {
                fetchVideosWithPagination(response.paging.next); // ✅ مزید سادگی
            } else {
                // **جب تمام ڈیٹا مل جائے تو اسے ڈسپلے کریں**
                displayVideos(videosList);
            }
        } else {
            console.error("No videos found or error:", response.error || response);
            alert("No videos found or error fetching data.");
        }
    });
}

 
 function displayVideos(videos) {
    let tableBody = document.getElementById("videosTableBody");
    tableBody.innerHTML = ""; // پرانے ڈیٹا کو صاف کریں

    videos.forEach(video => {
        let row = `
            <tr>
                <td>${video.id}</td>
                <td>${video.title || 'N/A'}</td>
                <td>${video.description || 'N/A'}</td>
                <td>${new Date(video.created_time).toLocaleString()}</td>
                <td><a href="${video.permalink_url}" target="_blank">View</a></td>
                <td>${video.views || 0}</td>
                <td>${video.comments_count}</td>
                <td>${video.shares_count || 0}</td>  <!-- ✅ Shares count added here -->
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
     /*
     function displayVideos(videos) {
         let videoDataContainer = document.getElementById("videoData");
         videoDataContainer.innerHTML = "";
 @@ -100,63 +123,63 @@
             `;
         });
     }
 
 */
     function sortVideos(criteria, order) {
         videosList.sort((a, b) => {
             let valA, valB;
             if (criteria === 'views') {
                 valA = a.views || 0;
                 valB = b.views || 0;
             } else if (criteria === 'date') {
                 valA = new Date(a.created_time).getTime();
                 valB = new Date(b.created_time).getTime();
             } else if (criteria === 'comments') {
                 valA = a.comments_count || 0;
                 valB = b.comments_count || 0;
             } else {
                 return 0;
             }
             return order === 'asc' ? valA - valB : valB - valA;
         });
 
         displayVideos(videosList);
     }
 
     function applySorting() {
         let criteria = document.getElementById("sortCriteria").value;
         let order = document.getElementById("sortOrder").value;
         sortVideos(criteria, order);
     }
 
     document.getElementById("fbLoginBtn").addEventListener("click", facebookLogin);
     document.getElementById("fetchVideosBtn").addEventListener("click", fetchVideos);
     document.getElementById("sortBtn").addEventListener("click", applySorting);
 
     let today = new Date();
     let sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(today.getDate() - 7);
 
     document.getElementById("startDate").value = sevenDaysAgo.toISOString().split('T')[0];
     document.getElementById("endDate").value = today.toISOString().split('T')[0];
 });
 
 
 
 
     window.fbAsyncInit = function() {
         FB.init({
             appId: '1917512025368300', // اپنا App ID لگائیں
             cookie: true,
             xfbml: true,
             version: 'v18.0'
         });
         console.log("Facebook SDK Loaded!");
     };
 
     (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) { return; }
         js = d.createElement(s); js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
