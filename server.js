const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbConfig = require('./database/db');
var cookieParser = require('cookie-parser');


const api = require('./routes/auth.routes');

// I used mongodb instead of sql for now
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,useFindAndModify:false
}).then(() => {
    console.log('Database connected')
},
    error => {
    
        console.log("Database can't be connected: " + error)
    }
)

mongoose.set('useCreateIndex', true);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors());
app.use(cookieParser());


app.use('/public', express.static('public'));

app.use('/api', api)

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log('Connected to port ' + port)
})

app.use((req, res, next) => {
    setImmediate(() => {
        next(new Error('Something went wrong'));
    });
});

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});