YouTube
=======

This code modifies and extends the YouTube Analytics API calls that are in the JavaScript sample code located [here](https://developers.google.com/youtube/analytics/v1/code_samples/javascript).

This will display raw data delimited with a '|' and take a few seconds to run and display data (so be patient and wait a few seconds until you see the data rolling in since it's making about 250 API calls per page load).

It includes the following complete metrics data over the lifetime of each video at the bottom

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

There are some data that you can only query given a specific time period. This code defaults to showing the frist 7, 14, 30, and 60 days since publication, and you can query the follow metrics data per video:

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


# Delimited Output for Database input
Note that the output of this program is more machine readable instead of human readable. It's recommended that you copy the output into Excel or import it into a MySQL database

    engagementColumnTitles = "id|timePeriod|sufficientData|views|estimatedMinutesWatched|averageViewDuration|averageViewPercentage|annotationClickThroughRate|annotationCloseRate|likes|dislikes|shares|comments|subscribersGained|subscribersLost";

    dataColumnTitles = "title|id|viewCountTotal|likeCountTotal|favoriteCountTotal|commentCountTotal|dislikeCountTotal|publishedDate|publishedTime|tags|categoryId|privacyStatus|durationText|durationSeconds|daysPublished|averageViewsPerDay";



# Setting up MAMP and Sequel Pro to View data

* Install MAMP, and Launch phpMyAdmin via Server > MySQL or go to `http://http://localhost/phpMyAdmin/index.php` 

* Create a new database called `stats`

* Navigate to the SQL tab for the `stats` database and copy the text of the `stats.sql` script to initalize the tables

* To import the data into MySQL via the commandline, then first connect to MAMP's MySQL database

    `/Applications/MAMP/Library/bin/mysql --host=localhost -uroot -proot;`

* Test that the connection is working

    `show databases;`

* Copy the first chunck of engagement data into a `engagementexport.csv` file, and the second chunk of data into a `videoexport.csv` file.

* Import the data using the following scripts down below (or alternatively use the phpMyAdmin interface)

* If there are warnings after running the import script above, then run this command for more details

    `SHOW WARNINGS;`

* To view the data in a nice GUI program, then install Sequel Pro

* Add MAMP socket of `/Applications/MAMP/tmp/mysql/mysql.sock` to Sequel Pro with the username and password of `root`

**Sample import scripts**

        LOAD DATA LOCAL INFILE '/Users/kentbye/Documents/videoexport.csv' INTO TABLE `stats`.`videos` FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

        LOAD DATA LOCAL INFILE '/Users/kentbye/Documents/engagementexport.csv' INTO TABLE `stats`.`engagement` FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';


Note that LINES TERMINATED BY changes depending on where you copy from. It's `\r` if copying from Excel or `\n` if copied from the web browser.
    

# Sample MySQL calls
Show the first two months of engagement data for public videos published within the last 240 days (videos less than 15 minutes) ordered by the best average view percentage

    SELECT videos.title, videos.viewCountTotal, engagement.views, engagement.averageViewPercentage, engagement.timePeriod, videos.daysPublished FROM engagement INNER JOIN videos ON engagement.id = videos.id WHERE videos.daysPublished < 240 AND engagement.timePeriod = 60 AND videos.privacyStatus ='public' AND durationSeconds < 900 ORDER BY engagement.averageViewPercentage DESC;

Show the first two week's engagement data for public videos published within the last 60 days (videos less than 15 minutes)

    SELECT videos.title, videos.viewCountTotal, engagement.timePeriod, engagement.views, engagement.averageViewPercentage, videos.daysPublished FROM engagement INNER JOIN videos ON engagement.id = videos.id WHERE videos.daysPublished < 240 AND engagement.timePeriod = 14 AND videos.privacyStatus ='public' AND durationSeconds < 900 ORDER BY engagement.averageViewPercentage DESC;


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