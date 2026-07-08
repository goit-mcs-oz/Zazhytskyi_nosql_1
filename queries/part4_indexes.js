// Частина 4 — Індекси та оптимізація

// Завдання 1. Аналіз запиту та індексація

use("spotify");

db.tracks.dropIndex({ track_genre: 1 });

result = db.tracks.find({
    track_genre: "pop",
    "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

//print(result);

//print('----------------------------');

db.tracks.createIndex({ track_genre: 1 });

result = db.tracks.find({
    track_genre: "pop",
    "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

//print(result);

// Завдання 2. Індекс для інших полів

db.tracks.createIndex({
    explicit: 1,
    "audio_features.instrumentalness": 1,
    "audio_features.speechiness": 1,
});

result = db.tracks.find({
    explicit: { $eq: true },
    "audio_features.instrumentalness": { $lt: 0.1 },
    "audio_features.speechiness": { $gt: 0.1 },
}).explain("executionStats");;

//print(result);

print("Finished");