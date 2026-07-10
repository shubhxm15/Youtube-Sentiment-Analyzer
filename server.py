import os
import tempfile
import shutil

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from Senti import extract_video_id, analyze_sentiment
from YoutubeCommentScrapper import (
    save_video_comments_to_csv,
    get_channel_info,
    get_channel_id,
    get_video_stats,
    youtube,
)

app = FastAPI(title="YouTube Sentiment Analysis API")

# CORS — allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------- helpers ---------------

def delete_non_matching_csv_files(directory_path: str, video_id: str) -> None:
    """Remove leftover CSV files that don't belong to the current video."""
    for file_name in os.listdir(directory_path):
        if not file_name.endswith(".csv"):
            continue
        if file_name == f"{video_id}.csv":
            continue
        os.remove(os.path.join(directory_path, file_name))


# --------------- request models ---------------

class AnalyzeRequest(BaseModel):
    youtube_link: str


# --------------- endpoints ---------------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze_youtube_link(payload: AnalyzeRequest):
    youtube_link = payload.youtube_link

    # 1. Extract video ID
    video_id = extract_video_id(youtube_link)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube link")

    try:
        # 2. Scrape comments & save to CSV
        csv_file = save_video_comments_to_csv(video_id)

        # 3. Clean up stale CSVs
        directory_path = os.getcwd()
        delete_non_matching_csv_files(directory_path, video_id)

        # 4. Channel info
        channel_id = get_channel_id(video_id)
        channel_info = get_channel_info(youtube, channel_id)
        if channel_info is None:
            raise HTTPException(status_code=502, detail="Failed to fetch channel info from YouTube API")

        # 5. Video stats
        stats = get_video_stats(video_id)
        if stats is None:
            raise HTTPException(status_code=502, detail="Failed to fetch video stats from YouTube API")

        # 6. Sentiment analysis
        results = analyze_sentiment(csv_file)

        # 7. Build response
        total_comments = results["num_positive"] + results["num_negative"] + results["num_neutral"]

        response = {
            "video_id": video_id,
            "channel": {
                "title": channel_info["channel_title"],
                "logo_url": channel_info["channel_logo_url"],
                "subscriber_count": channel_info["subscriber_count"],
                "video_count": channel_info["video_count"],
                "created_date": channel_info["channel_created_date"][:10],
                "description": channel_info["channel_description"],
            },
            "video": {
                "view_count": stats.get("viewCount", "0"),
                "like_count": stats.get("likeCount", "0"),
                "comment_count": stats.get("commentCount", "0"),
            },
            "sentiment": {
                "positive": results["num_positive"],
                "negative": results["num_negative"],
                "neutral": results["num_neutral"],
                "total": total_comments,
            },
            "youtube_link": youtube_link,
        }

        return response

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        # Clean up the CSV after analysis
        csv_path = os.path.join(os.getcwd(), f"{video_id}.csv")
        if os.path.exists(csv_path):
            os.remove(csv_path)


@app.post("/api/analyze-csv")
async def analyze_csv_upload(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    tmp_path = None
    try:
        # Save uploaded file to a temporary location
        suffix = ".csv"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            shutil.copyfileobj(file.file, tmp)

        # Run sentiment analysis on the temp file
        results = analyze_sentiment(tmp_path)

        total_comments = results["num_positive"] + results["num_negative"] + results["num_neutral"]

        return {
            "sentiment": {
                "positive": results["num_positive"],
                "negative": results["num_negative"],
                "neutral": results["num_neutral"],
                "total": total_comments,
            }
        }

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        # Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# --------------- entry point ---------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
