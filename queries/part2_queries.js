use("spotify");

// Частина 2 — Запити до даних

// Завдання 1. Треки для вечірки
tracks = db.tracks.find({
    "audio_features.danceability": { $gt: 0.7 },
    "audio_features.energy": { $gt: 0.7 },
    "duration_ms": {
        $gt: 180000,
        $lt: 300000
    }
});

//print('Треки для вечірки:', tracks);

// Завдання 2. Виконавці, у яких усі треки популярні
artists = db.tracks.aggregate([
    { $match: { "popularity": { $gt: 60 } } },
    { $unwind: "$artists" },
    {
        $group: {
            _id: "$artists",
            tracksCount: { $sum: 1 },
            minPopularity: { $min: "$popularity" },
            avgPopularity: {
                $avg: "$popularity"
            },
        }
    },
    { $match: { tracksCount: { $gt: 3 } } },
    {
        $project: {
            _id: 0,
            artist: "$_id",
            tracksCount: 1,
            minPopularity: 1,
            avgPopularity: { $round: ["$avgPopularity", 1] }
        }
    },
    { $sort: { avgPopularity: -1 } },
    { $limit: 20 }
]);

//print('Виконавці, у яких усі треки популярні:', artists);

// Завдання 3. Нетипові треки
tracks = db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            avg_tempo: { $avg: "$audio_features.tempo" },
            std_tempo: { $stdDevPop: "$audio_features.tempo" },
            outlier_tracks: {
                $push: {
                    "avg_tempo": "$avg_tempo",
                    "_id": "$_id",
                    "track_name": "$track_name",
                    "popularity": "$popularity",
                    "artists": "$artists",
                    "audio_features": {
                        "tempo": "$audio_features.tempo"
                    }
                },
            },
        }
    },
    { $unwind: "$outlier_tracks" },
    {
        $project: {
            _id: 0,
            genre: "$_id",
            avg_tempo: 1,
            outlier_threshold: { $add: ["$avg_tempo", { $multiply: [2, "$std_tempo"] }] },
            outlier_tracks: 1
        }
    },

    { $match: { $expr: { $gt: ["$outlier_tracks.audio_features.tempo", "$outlier_threshold"] } } },
]);

//print('Нетипові треки:', tracks);

// Завдання 4: Треки для фонової роботи
tracks = db.tracks.find({
    "audio_features.loudness": { $lt: -10 },
    "audio_features.speechiness": { $lt: 0.1 },
    "audio_features.instrumentalness": { $gt: 0.5 },
    "explicit": { $eq: false },
});

//print('Треки для фонової роботи:', tracks);

print("Finished");