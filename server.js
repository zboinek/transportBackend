
'use strict'

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var distance = require('google-distance');
var port = process.env.API_PORT || 3001;

mongoose.connect('mongodb://zboinek:zboinek12@ds119049.mlab.com:19049/transport');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var bodyParser = require('body-parser');
// var Comment = require('./public/model/comments');
var Transit = require('./model/transit');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});



router.get('/', function (req, res) {
    res.json({ message: 'API Initialized!' });
});


function getDistance(transits, raport) {
    transits.forEach(function (u) {
        raport.kasa = raport.kasa + u.price;
        distance.get(
            {
                origin: u.source_address,
                destination: u.destination_address
            },
            function (err, data) {
                if (err) return console.log(err);
                raport.dystans = raport.dystans + data.distanceValue;
            });
    })
};

function resolveTimeout() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 1000);
    });
}

const dataSplit = (u) => {
    const dayS = u.createdAt.toString().split(' ', 3)[2]
    let day = parseInt(dayS);
    console.log(typeof (day));
    return day;
}
// ----------------------------ZADANIE 1-------------------------------------
router.route('/transits')
    .get(function (req, res) {
        Transit.find(function (err, transits) {
            if (err) res.send(err);
            res.json(transits)
        })
    })
    .post(function (req, res) {
        var transit = new Transit();
        transit.source_address = "Ksiecia Janusza 8, Warszawa";
        transit.destination_address = "Polna 2, Warszawa";
        transit.price = 450;
        transit.save(function (err) {
            if (err)
                res.send(err);
            res.json({ message: 'Transit successfully added!' });
        });
    });

    // --------------------------ZADANIE 2--------------------------------

router.route('/reports/daily/:startDate/:endDate')
    .get(function (req, res) {
        Transit.find(function (err, transits) {
            if (err) res.send(err);
        }).where('createdAt').gt(req.params.startDate).lt(req.params.endDate)
            .then(function (transits) {
                let raport = { kasa: 0, dystans: 0 };
                getDistance(transits, raport);
                resolveTimeout();
                async function asyncCall() {
                    console.log('calling');
                    var result = await resolveTimeout();
                    raport.kasa += ' zl';
                    raport.dystans = raport.dystans / 1000 + ' km';
                    console.log(raport);
                    res.json(raport);
                }
                asyncCall();
            })
    });

    // -----------------------------ZADANIE 3------------------------------

router.route('/reports/monthly/:mc/:day')
    .get(function (req, res) {
        Transit.find(function (err, transits) {
            if (err) res.send(err);
        }).where('createdAt').gt('2018-' + req.params.mc + '-01 00:00:00.977')
            .lt('2018-' + req.params.mc + '-' + req.params.day + ' 00:00:00.977')
            .then(function (transits) {
                let raport = { kasa: 0, dystans: 0 };
                getDistance(transits, raport);
                resolveTimeout();
                async function asyncCall() {
                    console.log('calling');
                    var result = await resolveTimeout();
                    raport.kasa += ' zl';
                    raport.dystans = raport.dystans / 1000 + ' km';
                    console.log(raport);


                }
                asyncCall();
                let dayWork = [];
                transits.forEach(function (a, raport) {
                    const day = dataSplit(a);
                    dayWork.push(day);
                })

                let dzien = dayWork[0];

                console.log(raport);
                res.json(transits);
            })
    });


    // ------------------------USUWANIE------------------------------------
router.route('/delete/:id').get(function (req, res) {
    Transit.find(function (err, transits) {
        if (err) res.send(err);
    }).where('_id').equals(req.params.id).remove().then(function (err, transits) {
        if (err) res.send(err);
        console.log('usunieto pomyslnie');
        res.json(transits);
    });
})
//Use our router configuration when we call /api
app.use('/api', router);
//starts the server and listens for requests
app.listen(port, function () {
    console.log(`api running on port ${port}`);
});