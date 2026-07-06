use("spotify");

db.tracks.drop();

db.tracks_raw.aggregate([
    {
        $project: {
            track_id: 1,
            track_name: 1,
            album_name: 1,
            explicit: 1,
            popularity: 1,
            duration_ms: 1,
            track_genre: 1,
            artists: {
                $split: ["$artists", ";"]
            },
            audio_features: {
                danceability: '$danceability',
                energy: '$energy',
                loudness: '$loudness',
                speechiness: '$speechiness',
                acousticness: '$acousticness',
                instrumentalness: '$instrumentalness',
                liveness: '$liveness',
                valence: '$valence',
                tempo: '$tempo',
                key: '$key',
                mode: '$mode',
                time_signature: '$time_signature',
                duration_sec: {
                    $round: [
                        { $divide: ['$duration_ms', 1000] },
                        1
                    ]
                },
                popularity_tier: {
                    $switch: {
                        branches: [
                            { case: { $gte: ['$popularity', 70] }, then: 'high' },
                            {
                                case: {
                                    $and: [
                                        { $gte: ['$popularity', 40] },
                                        { $lt: ['$popularity', 70] }
                                    ]
                                }, then: 'medium'
                            },
                            { case: { $lt: ['$popularity', 40] }, then: 'low' }
                        ],
                        default: 'Unknown'
                    }
                }
            }
        }
    },
    {
        $out: "tracks"
    }
]);

print('tracks:', db.tracks.countDocuments());
printjson(db.tracks.findOne());

print("Finished");