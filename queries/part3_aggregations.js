// Частина 3 — Аналітика через Aggregation Pipeline

use("spotify");

// Завдання 1. Топ-10 виконавців за середньою популярністю

artists = db.tracks.aggregate([
    { $unwind: "$artists" },
    {
        $group: {
            _id: "$artists",
            tracksCount: { $sum: 1 },
            avgPopularity: { $avg: "$popularity" }
        }
    },
    { $match: { tracksCount: { $gte: 5 } } },
    { $sort: { avgPopularity: -1 } },
    {
        $project: {
            _id: 0,
            artist: "$_id",
            avgPopularity: 1,
        }
    },
    { $limit: 10 }

]);

//print('Топ-10 виконавців за середньою популярністю:', artists);

// Завдання 2. Розподіл треків за настроєм

tracks = db.tracks.aggregate([
    {
        $group: {
            _id: null,
            avgValence: { $avg: "$audio_features.valence" },
            avgEnergy: { $avg: "$audio_features.energy" },
            tracks: {
                $push: { valence: "$audio_features.valence", energy: "$audio_features.energy", }
            },
        }
    },
    { $unwind: "$tracks" },
    {
        $project: {
            _id: 0,
            mood: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $and: [
                                    { $gt: ['$tracks.valence', '$avgValence'] },
                                    { $gt: ['$tracks.energy', '$avgEnergy'] }
                                ]
                            }, then: 'happy'
                        },
                        {
                            case: {
                                $and: [
                                    { $lt: ['$tracks.valence', '$avgValence'] },
                                    { $gt: ['$tracks.energy', '$avgEnergy'] }
                                ]
                            }, then: 'angry'
                        },
                        {
                            case: {
                                $and: [
                                    { $gt: ['$tracks.valence', '$avgValence'] },
                                    { $lt: ['$tracks.energy', '$avgEnergy'] }
                                ]
                            }, then: 'calm'
                        },
                        {
                            case: {
                                $and: [
                                    { $lt: ['$tracks.valence', '$avgValence'] },
                                    { $lt: ['$tracks.energy', '$avgEnergy'] }
                                ]
                            }, then: 'sad'
                        },
                    ],
                    default: 'Unknown'
                }
            },
        }
    },
    {
        $group: {
            _id: '$mood',
            tracksCount: { $sum: 1 },
        }
    }
]);

//print('Розподіл треків за настроєм:', tracks);

// Завдання 3. Найбільш «танцювальний» жанр

genre = db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            tracksCount: { $sum: 1 },
            avg_danceability: { $avg: "$audio_features.danceability" },
            avg_energy: { $avg: "$audio_features.energy" },
            avg_valence: { $avg: "$audio_features.valence" },
        }
    },
    { $match: { "tracksCount": { $gte: 100 } } },
    {
        $project: {
            _id: 0,
            genre: "$_id",
            tracksCount: 1,
            avg_danceability: 1,
            avg_energy: 1,
            avg_valence: 1
        }
    }
]);

//print('Найбільш «танцювальний» жанр:', genre);

print("Finished");