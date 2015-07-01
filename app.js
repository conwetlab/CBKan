"use strict";

// main service config
var express = require('express');
var bodyParser = require('body-parser');
var config = require('config');
var NGSI = require('ngsijs');
var url = require('url');

// Subscription ID
var subscriptionId;

//shut down function
var gracefullyShuttinDown = function gracefullyShuttinDown() {
    console.log('Shut down signal Received ');
    if (subscriptionId != null) {
        
        // Try to cancel the subscription
        connection.cancelSubscription(subscriptionId, {
            onComplete: function () {
                console.log('Exiting after unsubscribe...');
                process.exit(0);
            }
        });

        // Force shutdown when CB is not responding
        setTimeout(function () {
            console.log('Exiting after 30 seconds without any answer...');
            process.exit(0);
        }, 30000);

    } else {
        console.log('Exiting...');
        process.exit(0);
    }

};

process.on('SIGINT', gracefullyShuttinDown);
process.on('SIGTERM', gracefullyShuttinDown);

// Context Broker
var connection = new NGSI.Connection(config.NGSI_URL);

var subscribeNGSI = function subscribeNGSI(urlToNotify) {
    console.log('Creating subscription to meter and load. Callaback URL: ' + urlToNotify);
    connection.createSubscription([
            {
                type: 'BusinessDemo:Meter',
                isPattern: true,
                id: '.*'
            }, 
            {
                type: 'BusinessDemo:Load',
                isPattern: true,
                id: '.*'
            }
        ],
        null,
        'P1Y',
        null,
        [{type: 'ONCHANGE', condValues: ['TimeInstant']}],
        {
            flat: true,
            onSuccess: function (data) {
                subscriptionId = data.subscriptionId;
                console.log('New subscription created: ' + subscriptionId);
            },
            onFailure: function () {
                console.log('Error creating the subscription to the Context Broker');
            },
            onNotify: urlToNotify   // will call onEntityChanges
        }
    );
};

var refreshNGSISubscription = function refreshNGSISubscription() {
    connection.updateSubscription(subscriptionId,
        'PT24H',
        null,
        [{type: 'ONCHANGE', condValues: ['TimeInstant']}],
        {
            onComplete: function () {
                console.log('NGSI Subscription updated');
            },
            onFailure: function () {
                console.log('Error updating NGSI Subscription.');
            }
        });
};

/**
 * Function that will be called when one entity changes
 */
var onEntityChanges = function onEntityChanges(req, res) {    
    console.log('two two two changes!!!!');
    console.log(req.body);
    res.end();
}

// Subscribe to the Context Broker
var init = function init(host, port) {

    // Create API to receive notifications
    var app = express();
    app.use(bodyParser.json());             // for parsing application/json
    app.post('/notify', onEntityChanges);   // listen context changes in /notify
    app.listen(port);                       // start the server

    // build the url to use for the ngsi notifications
    var serviceUrl = 'http://' + host + ':' + port;
    var urlToNotify = url.resolve(serviceUrl, 'notify');

    // Subscribe to NSGSI
    subscribeNGSI(urlToNotify);
};

// MAIN
var host = config.HOST;
var port = config.PORT;

if (host) {
    init (host, port);
} else {
    // If host is not give, try to guess it using ifconfig.me
    var http = require('http');

    var reqOptions = {
        host: 'ifconfig.me',
        port: 80,
        path: '/ip'
    };

    var req = http.get(reqOptions, function (resp) {

        resp.on('data', function (data) {
            host = data.toString().split('\n')[0];
            init(host, port);
        });
    })
    
    req.on('error', function (e) {
        console.log('Your Host could not be got, try to set it manually editing config.js');
    });
}
