#!/usr/bin/env python3
"""Face detection for vertical-reframe. Runs OpenCV Haar cascade on selected
frames of a video and prints JSON to stdout.

Usage:  face-detect.py VIDEO_PATH T1 T2 T3 ...

Timestamps are seconds (float). Output is a JSON array; one object per
requested timestamp:

    [
      {"t": 12.34, "w": 1920, "h": 1080, "faces": [{"x":..., "y":..., "w":..., "h":...}]},
      ...
    ]

Empty `faces` = no face found at that frame.

Called by src/lib/pipeline/face-detect.ts. Fails silently (exit 0, empty
list) if OpenCV is unavailable, so the caller can fall back to center
crop instead of erroring the whole video.
"""

import json
import sys


def _fail(reason):
    # stderr goes to fly logs; stdout must stay valid JSON for the Node
    # caller to parse. Empty list means "fall back to centred crop".
    print(f"[face-detect] {reason}", file=sys.stderr, flush=True)
    print(json.dumps([]))
    sys.exit(0)


def main():
    try:
        import cv2  # noqa
    except ImportError as e:
        _fail(f"opencv not importable: {e}")

    if len(sys.argv) < 3:
        _fail(f"bad args: {sys.argv}")

    video_path = sys.argv[1]
    try:
        timestamps = [float(t) for t in sys.argv[2:]]
    except ValueError as e:
        _fail(f"bad timestamp: {e}")

    import os
    if not os.path.exists(video_path):
        _fail(f"video path missing: {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        _fail(f"cv2.VideoCapture could not open: {video_path}")

    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    cascade = cv2.CascadeClassifier(cascade_path)

    results = []
    for t in timestamps:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000.0)
        ok, frame = cap.read()
        if not ok:
            results.append({"t": t, "w": 0, "h": 0, "faces": []})
            continue
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # minSize keeps us from picking up background noise as faces.
        detected = cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=4, minSize=(int(h * 0.05), int(h * 0.05))
        )
        results.append({
            "t": t,
            "w": w,
            "h": h,
            "faces": [
                {"x": int(x), "y": int(y), "w": int(fw), "h": int(fh)}
                for (x, y, fw, fh) in detected
            ],
        })

    cap.release()
    print(json.dumps(results))


if __name__ == "__main__":
    main()
