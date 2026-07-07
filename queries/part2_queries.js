use("spotify");

// Завдання 1. Треки для вечірки

tracks = db.tracks.find({
    "audio_features.danceability": { $gt: 0.7 },
    "audio_features.energy": { $gt: 0.7 },
    "duration_ms": {
        $gt: 180000,
        $lt: 300000
    }
});

print('Треки для вечірки:', tracks);

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

print('Виконавці:', artists);

print("Finished");