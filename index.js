var engagementData = Array();
var outputData = Array();
var engagementCount = 0;
var videoCount;
var uploadsListId;
var columnTitles = "";
var publishedDate = Array();
var numberOfTimePeriods = 4;

// To use a different date range, modify the ONE_MONTH_IN_MILLISECONDS
// variable to a different millisecond delta as desired.
var today = new Date();
var ONE_MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;
var lastMonth = new Date(today.getTime() - ONE_MONTH_IN_MILLISECONDS);

(function() {
  // Retrieve your client ID from the Google APIs Console at
  // https://cloud.google.com/console#/project.
  // var OAUTH2_CLIENT_ID = "############-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com"
  var OAUTH2_CLIENT_ID = "567642739825-0dgv7kgkq807hbsfajiug9nkn41l87t6.apps.googleusercontent.com"
  var OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  // Keeps track of the currently authenticated user's YouTube user ID.
  var channelId;

  // For information about the Google Chart Tools API, see
  // https://developers.google.com/chart/interactive/docs/quick_start
  google.load('visualization', '1.0', {'packages': ['corechart']});

  // The Google APIs JS client invokes this callback automatically after loading.
  // See http://code.google.com/p/google-api-javascript-client/wiki/Authentication
  window.onJSClientLoad = function() {
    gapi.auth.init(function() {
      window.setTimeout(checkAuth, 1);
    });
  };

  // Attempt the immediate OAuth 2 client flow as soon as the page loads.
  // If the currently logged-in Google Account has previously authorized
  // OAUTH2_CLIENT_ID, then it will succeed with no user intervention.
  // Otherwise, it will fail and the user interface that prompts for
  // authorization will need to be displayed.
  function checkAuth() {
    gapi.auth.authorize({
      client_id: OAUTH2_CLIENT_ID,
      scope: OAUTH2_SCOPES,
      immediate: true
    }, handleAuthResult);
  }

  // Handle the result of a gapi.auth.authorize() call.
  function handleAuthResult(authResult) {
    if (authResult) {
      // Auth was successful. Hide auth prompts and show things
      // that should be visible after auth succeeds.
      $('.pre-auth').hide();
      $('.post-auth').show();

      loadAPIClientInterfaces();
    } else {
      // Auth was unsuccessful. Show things related to prompting for auth
      // and hide the things that should be visible after auth succeeds.
      $('.post-auth').hide();
      $('.pre-auth').show();

      // Make the #login-link clickable. Attempt a non-immediate OAuth 2 client
      // flow. The current function will be called when that flow completes.
      $('#login-link').click(function() {
        gapi.auth.authorize({
          client_id: OAUTH2_CLIENT_ID,
          scope: OAUTH2_SCOPES,
          immediate: false
        }, handleAuthResult);
      });
    }
  }

  // Load the client interface for the YouTube Analytics and Data APIs, which
  // is required to use the Google APIs JS client. More info is available at
  // http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
  function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
      gapi.client.load('youtubeAnalytics', 'v1', function() {
        // After both client interfaces load, use the Data API to request
        // information about the authenticated user's channel.
        getUserChannel();
      });
    });
  }

  // Calls the Data API to retrieve info about the currently authenticated
  // user's YouTube channel.
  function getUserChannel() {
    // https://developers.google.com/youtube/v3/docs/channels/list
    var request = gapi.client.youtube.channels.list({
      // "mine: true" indicates that you want to retrieve the authenticated user's channel.
      mine: true,
      part: 'id,contentDetails'
   });

    request.execute(function(response) {
      if ('error' in response) {
        displayMessage(response.error.message);
      } else {
        // We will need the channel's channel ID to make calls to the
        // Analytics API. The channel ID looks like "UCPfMWIY-qNbLhIrbZm2BFMQ".
        channelId = response.items[0].id;
        // This string, of the form UCPfMWIY-qNbLhIrbZm2BFMQ", is a unique ID
        // for a playlist of videos uploaded to the authenticated user's channel.
        uploadsListId = response.items[0].contentDetails.relatedPlaylists.uploads;
        // Use the uploads playlist ID to retrieve the list of uploaded videos. 
        var pageToken = ''; // Initial pageToken page. Default is set to '' Or set it like 'CG4QAA'
        getPlaylistItems(uploadsListId, pageToken);
      } 
    });
  }

  // Calls the Data API to retrieve the items in a particular playlist. In this
  // example, we are retrieving a playlist of the currently authenticated user's
  // uploaded videos. By default, the list returns the most recent videos first.
  function getPlaylistItems(listId, paginationToken) {
    // https://developers.google.com/youtube/v3/docs/playlistItems/list
    // Could add contentDetails, but it only adds some details about stats that are gathered later.
    var request = gapi.client.youtube.playlistItems.list({
      playlistId: listId,
      part: 'snippet',
      maxResults: 50, // TODO: Change back to 5 or up to 50.
      pageToken: paginationToken   
    });

    request.execute(function(response) {
      if ('error' in response) {
        displayMessage(response.error.message);
      } else {
        if ('items' in response) {
          // jQuery.map() iterates through all of the items in the response and
          // creates a new array that only contains the specific property we're
          // looking for: videoId.
          var videoIds = $.map(response.items, function(item) {
            return item.snippet.resourceId.videoId;
          });
          
          // Only show the next pagination links if there's more videos.
          nextPageToken = response.result.nextPageToken;
          // console.log(nextPageToken) // Write out the next page token if you wanted to start from a specific page
          if (nextPageToken) {
	        var aElement = $('<a>');
	        aElement.attr('href', '#');
	        aElement.text("Next Page");
	        aElement.click(function() {
	          getPlaylistItems(uploadsListId, nextPageToken);
	        });
	        // Place the Next Page link that calls the next 'maxResults' number of videos
          	$("#next-page").html(aElement);
          } else {
          	$("#next-page").empty();
          }

		  // Only show the previous pagination links if there's previous videos to be shown
          prevPageToken = response.result.prevPageToken;
          if (prevPageToken) {
	        var aElement = $('<a>');
	        aElement.attr('href', '#');
	        aElement.text("Previous Page");
	        aElement.click(function() {
	          getPlaylistItems(uploadsListId, prevPageToken);
	        });
	        // Place the Previous Page link that calls the previous 'maxResults' number of videos
          	$("#previous-page").html(aElement);
          } else {
          	$("#previous-page").empty();
          }
          
          // Display how many total videos are posted
          $("#raw").text("Raw Video Metric Data - " + response.result.pageInfo.totalResults + " Total Videos");

          // Now that we know the IDs of all the videos in the uploads list,
          // we can retrieve info about each video.
          getVideoMetadata(videoIds);
          
          
        } else {
          displayMessage('There are no videos in your channel.');
        }
      }
    });
  }

  // Given an array of video ids, obtains metadata about each video and then
  // uses that metadata to display a list of videos to the user.
  function getVideoMetadata(videoIds) {
    // https://developers.google.com/youtube/v3/docs/videos/list
    var request = gapi.client.youtube.videos.list({
      // The 'id' property value is a comma-separated string of video IDs created from an array via .join(',')
      id: videoIds.join(','),
      // Other part options: contentDetails, fileDetails, processingDetails, [recordingDetails], [suggestions], [topicDetails]
      part: 'id,snippet,statistics,status,contentDetails'
    });
    
    // See how many videos to asychronously query for the engagement metric data
    videoCount = videoIds.length * numberOfTimePeriods;
    
    // Write the video results to the screen and link to be able to look at a graph of data
    request.execute(function(response) {
      if ('error' in response) {
        displayMessage(response.error.message);
      } else {
        // Get the jQuery wrapper for #video-list once outside the loop.
        var videoList = $('#video-list');
        $('#video-engagement-07').empty();
        $('#video-engagement-14').empty();
        $('#video-engagement-30').empty();
        $('#video-engagement-60').empty();
        
        // Clear out previous results to show new next or previous paginated results
        videoList.empty();
       
        i = 0;

        $.each(response.items, function() {
          // Exclude videos that don't have any views, since those videos
          // will not have any interesting viewcount analytics data.
          if (this.statistics.viewCount == 0) {
            return;
          }
          
		      // See what variables are available
		      // console.log(this);
	  
          var title = this.snippet.title;
          var videoId = this.id;
          // NOTE: Save this data to an array to output later in order for additional stats to be queried and displayed
          // columnTitles = "title|viewCountTotal|likeCountTotal|favoriteCountTotal|commentCountTotal|dislikeCountTotal|id|publishedDate|publishedTime|tags|categoryId|privacyStatus|durationText|durationSeconds|daysPublished|averageViewsPerDay";
          // Trim the final character off of the timestamp of 2013-09-03T23:22:01.000Z, and split at the 'T'
          var publishedDateTime = this.snippet.publishedAt.substring(0, this.snippet.publishedAt.length - 5).split('T');
          // Dump the id, snippet, statistics, status, & contentDetails of this video
          
		      outputData[i] = this.snippet.title + '|' + this.id + '|' + this.statistics.viewCount + '|' + this.statistics.likeCount + '|' + this.statistics.favoriteCount + '|' + this.statistics.commentCount +'|' + this.statistics.dislikeCount + '|' + publishedDateTime[0] + '|' + publishedDateTime[1] + '|' + this.snippet.tags + '|' + this.snippet.categoryId + '|' + this.status.privacyStatus + '|' + this.contentDetails.duration;

		  // YouTube displays the time in this format: PT9M52S. Convert it to seconds.
          var durationSeconds = this.contentDetails.duration;
          var lengthDurationArray = durationSeconds.length;
          durationSeconds.split('');
          var currentInteger = Array();
          var multiplier = 1;
          var totalSeconds = 0;
          for (var x = lengthDurationArray; x > 1 ; x--) {
          	currentInteger[x] = parseInt(durationSeconds[x]);
          	if(currentInteger[x] || currentInteger[x]==0) {
              // If the next character is a number, then multiply by 10
              if(currentInteger[x+1] || currentInteger[x+1]==0) {
              	multiplier *= 10;
              }
              totalSeconds += currentInteger[x]*multiplier;
            } 
            // Otherwise it's either Seconds/Minutes/Hours
            // 00s are not displayed. H is for hours (*3600). M is for minutes (*60). S is for seconds
            else {
              if (durationSeconds[x] == 'S') {
                multiplier = 1;
              } else if (durationSeconds[x] == 'M') {
              	multiplier = 60;
              } else {
              	multiplier = 3600;
              } 
            }
          }
          // Add the totalSeconds onto the end of the outputData since calculating it before changes the values
          outputData[i] += "|" + totalSeconds;
          
          // Calculate how many days the video has been published
          var currentDate = new Date();
          publishedDate[i] = new Date(publishedDateTime[0]);
		      var daysPublished = Math.round((currentDate.getTime()-publishedDate[i].getTime())/(1000*24*60*60));
		      var averageViewsPerDay = Math.round((this.statistics.viewCount/daysPublished)*1000)/1000;
		      outputData[i] += "|" + daysPublished + "|" + averageViewsPerDay;
          
          // If outputGraphList is true, then it'll display a graphs of views, estimatedMinutesWatched, averageViewDuration & averageViewPercentage for a selected video.
		  var outputGraphList = false;
		  if  (outputGraphList) {
	         // Create a new <li> element that contains an <a> element.
	         // Set the <a> element's text content to the video's title, and
	         // add a click handler that will display Analytics data when invoked.
	         var liElement = $('<li>');
	         var aElement = $('<a>');
	         // The dummy href value of '#' ensures that the browser renders the
	         // <a> element as a clickable link.
	         aElement.attr('href', '#');
	         aElement.text(title);
	         aElement.click(function() {
	           displayVideoAnalytics(videoId);
	         });
	
	         // Call the jQuery.append() method to add the new <a> element to
	         // the <li> element, and the <li> element to the parent
	         // list, which is identified by the 'videoList' variable.
	         liElement.append(aElement);
	         videoList.append(liElement);
		  }
          // Increment counter for the output data so that it can be combined with other asynchronous calls later
          i++;
        });
        // Loop through and retrieve the engagement metrics data for each video
        var a = 0;
        var timePeriod = 7;
        for (var a in videoIds) {
          	// Input the curent video, what order since it's executed asynchronously, start date of last month
            queryVideoEngagement(videoIds[a], a, formatDateString(publishedDate[a]), 7);
            queryVideoEngagement(videoIds[a], a, formatDateString(publishedDate[a]), 14);
            queryVideoEngagement(videoIds[a], a, formatDateString(publishedDate[a]), 30);
            queryVideoEngagement(videoIds[a], a, formatDateString(publishedDate[a]), 60);            
         }

        if (videoList.children().length == 0) {
          // displayMessage('Your channel does not have any videos that have been viewed.');
          displayMessage('Graphing is disabled. Set outputGraphList to true to see graphs. Or it could be that your channel does not have any videos that have been viewed');
        }
      }
    });
  }

  // Query Engagement Metrics for an individual video over the past period of time
  function queryVideoEngagement(videoId, count, startDate, timePeriod) {
    engagementData[count] = new Array();
    if (channelId) {
      // Channel Report data is at: https://developers.google.com/youtube/analytics/v1/channel_reports
      // Retrieve metrics for an individual video
      var endDateTime = new Date(startDate);
      millisecondOffset = timePeriod * 24 * 60 * 60 * 1000;
      endDateTime.setTime(endDateTime.getTime() + millisecondOffset);
      var endDate = formatDateString(endDateTime);
 
      var request = gapi.client.youtubeAnalytics.reports.query({
        // The start-date and end-date parameters need to be YYYY-MM-DD strings.
        'start-date': startDate,
        'end-date': endDate,
        // A future YouTube Analytics API release should support channel==default.
        // In the meantime, you need to explicitly specify channel==channelId.
        // See https://devsite.googleplex.com/youtube/analytics/v1/#ids
        ids: 'channel==' + channelId,
        // NOTE: Remove dimensions to get TOTAL. Other options: day, 7DayTotals, 30DayTotals, month
        // dimensions: 'day',
        // See https://developers.google.com/youtube/analytics/v1/available_reports for details
        // on different filters and metrics you can request when dimensions=day. 
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,annotationClickThroughRate,annotationCloseRate,likes,dislikes,shares,comments,subscribersGained,subscribersLost',
        filters: 'video==' + videoId
      });
      
      // console.log("TEST"); // These headers are written out 5 times
      dataColumnTitles = "title|id|viewCountTotal|likeCountTotal|favoriteCountTotal|commentCountTotal|dislikeCountTotal|publishedDate|publishedTime|tags|categoryId|privacyStatus|durationText|durationSeconds|daysPublished|averageViewsPerDay";
      engagementColumnTitles = "id|timePeriod|sufficientData|views|estimatedMinutesWatched|averageViewDuration|averageViewPercentage|annotationClickThroughRate|annotationCloseRate|likes|dislikes|shares|comments|subscribersGained|subscribersLost";
      
      $('#data-column-titles').html(dataColumnTitles);
      $('#engagement-column-titles').html(engagementColumnTitles);
            
      
      request.execute(function(response) {
        // This function is called regardless of whether the request succeeds.
        // The response either has valid analytics data or an error message.
        if ('error' in response) {
          displayMessage(response.error.message);
        } else {
          if (response.rows) {
          	// Convert averageViewDuration from seconds to minutes
          	response.rows[0][2] = Math.round(response.rows[0][2]*1000/60)/1000;
            engagementData[count][timePeriod] = videoId + "|" + timePeriod + "|1|" + response.rows[0].join('|');
          } else {
          	engagementData[count][timePeriod] = videoId + "|" + timePeriod + "|0";
          }
        }
        // Count the number of successfully completed engagement metric queries
        engagementCount++;
        var videoData = $('#video-data');
        var videoEngagement07 = $('#video-engagement-07');
        var videoEngagement14 = $('#video-engagement-14');
        var videoEngagement30 = $('#video-engagement-30');
        var videoEngagement60 = $('#video-engagement-60');
        // Engagement metric queries are executed asynchronously. Display data when all have completed
        if (engagementCount == videoCount
        ) {
          // Reset the engagementCount counter for next and previous paginated calls
          engagementCount = 0;
          videoData.empty(); 
          // Contatenate the 30-day engagement data with the overall stats  
          for (var i = 0; i < videoCount/numberOfTimePeriods; i++) {
            // In older versions, I combined the video metadata and lifetime statistics with the engagement data into one table
			      //outputData[i] += engagementData[i];

			      // Create a new <li> element that contains an <a> element.
			      // Set the <a> element's text content to the video's title, and
			      // add a click handler that will display Analytics data when invoked.
			      var liDataElement = $('<li>');
			      var liEngagementElement07 = $('<li>');
			      var liEngagementElement14 = $('<li>');
			      var liEngagementElement30 = $('<li>');
			      var liEngagementElement60 = $('<li>');
			      
			      // The dummy href value of '#' ensures that the browser renders the
			      // <a> element as a clickable link.
			      liDataElement.text(outputData[i]);
			      liEngagementElement07.text(engagementData[i][7]);
			      liEngagementElement14.text(engagementData[i][14]);
			      liEngagementElement30.text(engagementData[i][30]);
			      liEngagementElement60.text(engagementData[i][60]);

			      // Call the jQuery.append() method to add the new <a> element to
			      // the <li> element, and the <li> element to the parent
			      // list, which is identified by the 'videoList' variable.
			      videoData.append(liDataElement);
			      videoEngagement07.append(liEngagementElement07);
			      videoEngagement14.append(liEngagementElement14);			      
			      videoEngagement30.append(liEngagementElement30);
			      videoEngagement60.append(liEngagementElement60);			      
		      }
        }
      });
    } else {
      displayMessage('The YouTube user id for the current user is not available.');
    }
  }


  // Requests YouTube Analytics for a video, and displays results in a chart.
  function displayVideoAnalytics(videoId) {
    if (channelId) {

      // Channel Report data is at: https://developers.google.com/youtube/analytics/v1/channel_reports

      // Retrieve metrics for an individual video
      var request = gapi.client.youtubeAnalytics.reports.query({
        // The start-date and end-date parameters need to be YYYY-MM-DD strings.
        'start-date': formatDateString(lastMonth),
        'end-date': formatDateString(today),
        // A future YouTube Analytics API release should support channel==default.
        // In the meantime, you need to explicitly specify channel==channelId.
        // See https://devsite.googleplex.com/youtube/analytics/v1/#ids
        ids: 'channel==' + channelId,
        // NOTE: Remove dimensions to get TOTAL. Other options: day, 7DayTotals, 30DayTotals, month
        dimensions: 'day',
        // See https://developers.google.com/youtube/analytics/v1/available_reports for details
        // on different filters and metrics you can request when dimensions=day.
        // NOTE: Other options are annotationClickThroughRate,likes,shares, 
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
        //metrics: 'views',
        filters: 'video==' + videoId
        //filters: 'video==p76Djpdj5sU' // "Overview of Puppet Enterprise 3.0"
      });

// Total viewcounts, estimated watch time, and more for a channel
//      var request = gapi.client.youtubeAnalytics.reports.query({
//        'start-date': formatDateString(lastMonth),
//        'end-date': formatDateString(today),
//        ids: 'channel==' + channelId,
//        metrics: 'views,comments,favoritesAdded,likes,dislikes,estimatedMinutesWatched,averageViewDuration',
//      });

// Daily watch time metrics for a channel's videos
//      var request = gapi.client.youtubeAnalytics.reports.query({
//        'start-date': formatDateString(lastMonth),
//        'end-date': formatDateString(today),
//        'ids': 'channel==' + channelId,
//        // metrics: 'views,comments,favoritesAdded,likes,dislikes,estimatedMinutesWatched,averageViewDuration',
//        metrics: 'views,estimatedMinutesWatched,averageViewDuration',
//        dimensions: 'day',
//        sort: 'day',
//        //'max-results': 7,
//      });

// Top 10 – Most watched videos for a channel
//      var request = gapi.client.youtubeAnalytics.reports.query({
//        'start-date': formatDateString(lastMonth),
//        'end-date': formatDateString(today),
//        ids: 'channel==' + channelId,
//        metrics: 'estimatedMinutesWatched,views,likes,subscribersGained',
//        dimensions: 'video',
//        'max-results': 10,
//        sort: '-estimatedMinutesWatched'
//      });

// 'The query is not supported' -- Top 10 – YouTube search terms that generate the most traffic for a video
// Look at https://developers.google.com/youtube/analytics/v1/available_reports for supported queries
//      var request = gapi.client.youtubeAnalytics.reports.query({
//        'start-date': formatDateString(lastMonth),
//        'end-date': formatDateString(today),
//        ids: 'channel==' + channelId,
//        metrics: 'estimatedMinutesWatched,views,likes,subscribersGained',
//        dimensions: 'insightTrafficSourceDetail',
//        filters: 'video==p76Djpdj5sU;insightTrafficSourceType==YT_SEARCH',
//        'max-results': 9,
//        sort: '-views'
//      });

// 'The query is not supported'
//      var request = gapi.client.youtubeAnalytics.reports.query({
//        'start-date': formatDateString(lastMonth),
//        'end-date': formatDateString(today),
//        ids: 'channel==' + channelId,
//        metrics: 'views',
//        dimensions: 'video',
//        filters: 'video==p76Djpdj5sU',
//      });

      request.execute(function(response) {
        // This function is called regardless of whether the request succeeds.
        // The response either has valid analytics data or an error message.
        if ('error' in response) {
          displayMessage(response.error.message);
        } else {
          displayChart(videoId, response);
        }
      });
    } else {
      displayMessage('The YouTube user id for the current user is not available.');
    }
  }

  // Boilerplate code to take a Date object and return a YYYY-MM-DD string.
  function formatDateString(date) {
    var yyyy = date.getFullYear().toString();
    var mm = padToTwoCharacters(date.getMonth() + 1);
    var dd = padToTwoCharacters(date.getDate());

    return yyyy + '-' + mm + '-' + dd;
  }

  // If number is a single digit, prepend a '0'. Otherwise, return it as a string.
  function padToTwoCharacters(number) {
    if (number < 10) {
      return '0' + number;
    } else {
      return number.toString();
    }
  }

  // Calls the Google Chart Tools API to generate a chart of analytics data.
  function displayChart(videoId, response) {
    if ('rows' in response) {
      hideMessage();

      // The columnHeaders property contains an array of objects representing
      // each column's title – e.g.: [{name:"day"},{name:"views"}]
      // We need these column titles as a simple array, so we call jQuery.map()
      // to get each element's "name" property and create a new array that only
      // contains those values.
      var columns = $.map(response.columnHeaders, function(item) {
        return item.name;
      });
      // The google.visualization.arrayToDataTable() wants an array of arrays.
      // The first element is an array of column titles, calculated above as
      // "columns". The remaining elements are arrays that each represent
      // a row of data. Fortunately, response.rows is already in this format,
      // so it can just be concatenated.
      // See https://developers.google.com/chart/interactive/docs/datatables_dataviews#arraytodatatable
      var chartDataArray = [columns].concat(response.rows);
      var chartDataTable = google.visualization.arrayToDataTable(chartDataArray);

      var chart = new google.visualization.LineChart(document.getElementById('chart'));
      chart.draw(chartDataTable, {
        // Additional options can be set if desired.
        // See https://developers.google.com/chart/interactive/docs/reference#visdraw
        title: 'Views per Day of Video ' + videoId
      });
    } else {
      displayMessage('No data available for video ' + videoId);
    }
  }

  // Helper method to display a message on the page.
  function displayMessage(message) {
    $('#message').text(message).show();
  }

  // Helper method to hide a previously displayed message on the page.
  function hideMessage() {
    $('#message').hide();
  }
  
})();


