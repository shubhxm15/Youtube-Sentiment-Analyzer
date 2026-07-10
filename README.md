# YouTube Sentiment Analysis

This project provides a web application for sentiment analysis of YouTube comments. It allows users to input a YouTube link and analyzes the sentiment of the comments associated with that video. The application also displays video information, channel information, and visualizations of the sentiment analysis results.

## Features 

- Extracts the video ID from a YouTube link.
- Retrieves comments from the specified YouTube video and saves them to a CSV file. 
- Accepts existing comment CSVs with `Comment`, `comments`, or Xquik-style `text` columns.
- Performs sentiment analysis on the comments using the VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment analysis tool.
- Generates bar charts to visualize the sentiment analysis results. 
- Retrieves video and channel information from the YouTube API. 

## Installation 

1. Clone the repository:

2. Install the required dependencies:

3. Obtain a YouTube Data API key from the [Google Cloud Console](https://console.cloud.google.com/) and replace `YOUR_API_KEY` in `YoutubeCommentScrapper.py` with your actual API key.

4. Run the application:


## Usage 🚀

1. Open the application in your web browser.

2. Enter a valid YouTube link in the sidebar. 

3. Or upload an existing CSV with a `Comment`, `comments`, or `text` column.

4. Wait for the application to retrieve or load comments, perform sentiment analysis, and display the results. 

5. Explore the sentiment analysis results, video information, and channel information. 
