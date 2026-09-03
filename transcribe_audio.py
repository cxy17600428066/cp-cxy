import json
import sys
from pathlib import Path

sys.path[:0] = [r"E:\cxy\.whisper_deps", r"E:\cxy\.transcribe_deps"]

import av
import numpy as np
import whisper


audio_path = r"C:\Users\admin\Documents\WXWork\1688855255770308\Cache\File\2026-07\需求重要.m4a"
output_path = Path(r"E:\cxy\需求重要_转写.json")
model_dir = Path(r"E:\cxy\.whisper_models")
model_dir.mkdir(exist_ok=True)

container = av.open(audio_path)
resampler = av.audio.resampler.AudioResampler(format="fltp", layout="mono", rate=16000)
chunks = []
for frame in container.decode(audio=0):
    for converted in resampler.resample(frame):
        chunks.append(converted.to_ndarray().reshape(-1))
for converted in resampler.resample(None):
    chunks.append(converted.to_ndarray().reshape(-1))
audio = np.concatenate(chunks).astype(np.float32, copy=False)
start_offset = 41 * 60
audio = audio[start_offset * 16000 :]
print(f"Decoded tail from {start_offset}s ({len(audio) / 16000:.1f} seconds)", flush=True)

model = whisper.load_model("small", device="cpu", download_root=str(model_dir))
result = model.transcribe(
    audio,
    language="zh",
    fp16=False,
    verbose=False,
    temperature=0,
    condition_on_previous_text=True,
)

data = {
    "language": result["language"],
    "text": result["text"].strip(),
    "segments": [
        {
            "start": round(segment["start"] + start_offset, 2),
            "end": round(segment["end"] + start_offset, 2),
            "text": segment["text"].strip(),
        }
        for segment in result["segments"]
    ],
}
output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nSaved to {output_path}", flush=True)
