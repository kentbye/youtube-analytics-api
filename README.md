YouTube
=======

This code modifies and extends the YouTube Analytics API calls that are in the JavaScript sample code located [here](https://developers.google.com/youtube/analytics/v1/code_samples/javascript).

It includes the following complete metrics data over the lifetime of each video

* this.snippet.title
* statistics.viewCount
* statistics.likeCount
* statistics.favoriteCount
* statistics.commentCount
* statistics.dislikeCount
* id
* snippet.publishedAt
* snippet.tags
* snippet.categoryId
* status.privacyStatus
* contentDetails.duration

It also sanitizes the data and adds a few additional the video duration in seconds, how many days that the video has been published, and average views per day.

There are some data that you can only query given a specific time period. This code defaults to a month, and you can query the follow metrics data per video:

* views
* estimatedMinutesWatched
* averageViewDuration
* averageViewPercentage
* annotationClickThroughRate
* annotationCloseRate
* likes
* dislikes
* shares
* comments
* subscribersGained
* subscribersLost

This program will query the YouTube Analytics API, and query maxResults of 50 per call. There's a nextPageToken that is executed within the "Next Page" link to get the next results from there.


# Setting up the API Access on YouTube
Go [here](https://code.google.com/apis/console/?pli=1#project:112773181024) to set up the Authorized domains for API access. 

Note that the number of requests sent can be seen on the [Google Cloud Console](https://cloud.google.com/console#/project).


# Set up a domain where OAuth can authenticate
* Configuration settings located at: https://cloud.google.com/console#/project
* Create new Browser key... (button) 
* Configure Browser Key for API Project
* Choose localhost


# Reference Links
Blog post on [YouTube Analytics API Updates](http://apiblog.youtube.com/2013_05_01_archive.html) from May 10, 2013


> The new API includes all the standard view and engagement metrics you would expect, including views, shares, and subscriber numbers.
>
> Watch metrics: Track estimated minutes watched across channel, content owner, or video, and dive into the video details with average view time and average view percentage.
>
>Annotation metrics: Optimize overlays/annotations with click through and close rate metrics.