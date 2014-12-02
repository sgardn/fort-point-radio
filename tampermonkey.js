// ==UserScript==
// @name       Auto-play youtube links in a hipchat room
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @match      https://meyouhealth.hipchat.com/chat
// @copyright  Scott Gardner
// ==/UserScript==
console.log("running tampermonkey");
var mostRecentlyOpenedYoutubeLink = '';
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
$('#roster .list').append('<div id="video_player"></div>');

var currentlyWatchingVideoId = null;
var watchedVideos = [];
var toWatch = [];
var player;

function onYouTubeIframeAPIReady(videoId) {
    player = new YT.Player('video_player', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            onReady: function(event) {                        
                event.target.playVideo(); 
            },
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        // play the most recent song in the list, provided we haven't already watched it
        watchFirstMovieInToWatchList();
    }
}

var getIdOfLowestVideoOnPage = function() {
//    return $('.linkImage').last().attr('href').split('=')[1];
    var links = $('a');
    var filtered = links.filter(function(i){ 
        return links[i].href.indexOf("youtube") != -1;
    });
    return filtered[filtered.length-1].href.split('=')[1];
}

var addVideoToQueueInterval;

var watchFirstMovieInToWatchList = function() {
    if (toWatch.length) {
        var videoIdToWatch = toWatch.shift();
        watchedVideos.push(videoIdToWatch);
        player.loadVideoById({ videoId: videoIdToWatch });
        console.log('NOW WATCHING: ' + videoIdToWatch);
    } else {
        console.log('nothing new to watch!');
        window.setTimeout(watchFirstMovieInToWatchList, 2000);
    }
}

var addLowestVideoToArray = function() {
    var id = getIdOfLowestVideoOnPage();
    if (toWatch.indexOf(id) === -1 && watchedVideos.indexOf(id) === -1) {
        toWatch.push(id);
    } else {
        console.log('video ' + id + ' already watched, or already in the queue');
    }
}

window.setTimeout(function(){
    $('#sidebar').css('width', '642px');
    $('#main_chat').css('width', ($('#main_chat').width() - 433) + 'px');
    var initialVideoId = getIdOfLowestVideoOnPage();
    onYouTubeIframeAPIReady(initialVideoId);
    watchedVideos.push(initialVideoId);
    console.log('NOW WATCHING: ' + initialVideoId);
    addVideoToQueueInterval = window.setInterval(addLowestVideoToArray, 2000);
}, 5000);