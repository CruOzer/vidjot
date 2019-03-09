if (process.env.NODE_ENV === 'production') {
    module.exports = {
        mongoURI: "mongodb+srv://LC_rw_user:NgILIxsd4bq5xvLt@vidjot-prod-ypjkc.mongodb.net/test?retryWrites=true"
    };
} else {
    module.exports = {
        mongoURI: "mongodb://localhost:27017/vidjot-dev"
    };
}