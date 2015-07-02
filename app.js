"use strict";

require("date-utils");

// main service config
var async = require('async');
var bodyParser = require('body-parser');
var ckan = require('ckan');
var config = require('config');
var express = require('express');
var NGSI = require('ngsijs');
var url = require('url');

// Fields
var METER_FIELDS = [
    {
        'id': 'Downstream Active Power',
        'type': 'float'
    },
    {
        'id': 'Time',
        'type': 'timestamp'
    },
    {
        'id': 'Unit Of Measurement',
        'type': 'text'
    },
    {
        'id': 'Upstream Active Power',
        'type': 'float'
    }
];

var LOAD_FIELDS = [
    {
        'id': 'Downstream Active Energy',
        'type': 'float'
    },
    {
        'id': 'From',
        'type': 'timestamp'
    },
    {
        'id': 'To',
        'type': 'timestamp'
    },
    {
        'id': 'Unit Of Measurement',
        'type': 'text'
    },
    {
        'id': 'Upstream Active Energy',
        'type': 'float'
    }
]

// Subscription ID
var subscriptionId;

// CKAN Resources
var resources = {};

// AUXILIAR FUNCTIONS
function cammelCaseToReadableString(input) {

    if (input.length <= 1) {
        return input;
    } else {
        var result = input.replace(/([A-Z]+)/g, " $1").replace(/^,/, "");
        return result[0].toUpperCase() + result.substring(1, result.length)
    }
}

// CKAN Functions
var ckanClient = new ckan.Client(config.CKAN_URL, config.CKAN_API_KEY);

function createDataset(datasetId, callback) {
    ckanClient.action('dataset_show', 
        {
            id: datasetId
        }, 
        function(err, result) {
            if (err) {
                ckanClient.action('dataset_create', 
                    {
                        name: datasetId 
                    }, 
                    function(err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log('Dataset ' + datasetId + ' created.');
                            callback(null);
                        }
                    }
                );
            } else {
                console.log('Dataset ' + datasetId + ' already exists.');
                callback(null);
            }
        }
    );
}

function createResource(datasetId, name, fields, callback) {
    
    ckanClient.action('resource_create', 
        {
            package_id: datasetId, 
            name: name, 
            url: 'http://fake.url'
        }, 
        function(err, result) {
            if (err) {
                callback(err);
            } else {
                var resourceId = result.result.id;
                ckanClient.action('datastore_create', 
                    {
                        force: true, 
                        resource_id: resourceId, 
                        fields: fields
                    }, 
                    function(err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log('Resource ' + name + ' created for dataset ' + datasetId + '.');
                            callback(null, resourceId);
                        }
                    }
                );
            }
        }
    );
}  

function insertRecords(resourceId, records, callback) {

    ckanClient.action('datastore_upsert', 
        {
            force: true, 
            resource_id: resourceId, 
            records: records, 
            method: 'insert'
        }, 
        function(err, result) {
            callback(err, result);
        }
    );
}


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
        [{type: 'ONCHANGE', condValues: ['BusinessDemo:Meter:time', 'BusinessDemo:Load:to']}],
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

    var body = '';

    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        var doc = NGSI.XML.parseFromString(body, 'application/xml');
        var data = NGSI.parseNotifyContextRequest(doc, {flat: true});

        // Parse notifications
        var notificationsByProsumer = {};
        var prosumersIds = [];
        for (var element in data.elements) {

            var notification = {};
            var prosumerIdIndex = 'prosumerId';
            for (var property in data.elements[element]) {
                var finalId = property.indexOf('prosumerId') >= 0 ? prosumerIdIndex : property;
                notification[finalId] = data.elements[element][property];
            }

            var prosumerId = notification[prosumerIdIndex];
            if (!(prosumerId in notificationsByProsumer)) {
                notificationsByProsumer[prosumerId] = {};
            }

            var measureType = notification['id'].indexOf('Meter') >= 0 ? 'meter' : 'load';

            notificationsByProsumer[prosumerId][measureType] = notification;

            if (prosumersIds.indexOf(prosumerId) < 0) {
                prosumersIds.push(prosumerId);
            }
        }

        function insertEntities(notifications) {

            var functions = [];

            for (var prosumerId in notifications) {
                var prosumerInfo = notifications[prosumerId];

                for (var type in prosumerInfo) {

                    var meassure = prosumerInfo[type];
                    var record = {};

                    for (var attribute in meassure) {

                        var splittedAttribute = attribute.split(':');

                        if (splittedAttribute.length > 1) {
                            record[cammelCaseToReadableString(splittedAttribute[splittedAttribute.length - 1])] = meassure[attribute];
                        } 
                    }

                    functions.push(insertRecords.bind({}, resources[prosumerId][type], [record]));
                }
            }

            async.parallel(functions, function(err, res) {
                if (!err) {
                    console.log('Records inserted!');
                } else {
                    console.log(err);
                }
            });
        }

        function createResources(prosumersIds, callback) {

            var functions = {}
            var today = new Date();
            var todayFormatted = today.toFormat('DD/MM/YYYY');
            var loadSuffix = '-load';
            var meterSuffix = '-meter';

            for (var i = 0; i < prosumersIds.length; i++) {
                var prosumerId = prosumersIds[i];
                var lastUpdate = prosumerId in resources ? resources[prosumerId]['lastUpdate'] : Date.yesterday();

                // If there are no resources for this prosumer for the current date, create two:
                // one for meter and another one for load.
                if (!Date.equalsDay(today, lastUpdate)) {
                    var funcMeter = createResource.bind({}, prosumerId, 'Meter ' + todayFormatted, METER_FIELDS);
                    var funcLoad = createResource.bind({}, prosumerId, 'Load ' + todayFormatted, LOAD_FIELDS);

                    functions[prosumerId + meterSuffix] = funcMeter;
                    functions[prosumerId + loadSuffix] = funcLoad;

                }
            }

            async.series(functions, function(err, res) {

                if (err) {
                    callback(err);
                } else {

                    for (var i = 0; i < prosumersIds.length; i++) {

                        var prosumerId = prosumersIds[i];

                        if (!(prosumerId in resources)) {
                            resources[prosumerId] = {};
                        }

                        if ((prosumerId + meterSuffix) in res) {
                            resources[prosumerId]['meter'] = res[prosumerId + meterSuffix];
                        }

                        if ((prosumerId + loadSuffix) in res) {
                            resources[prosumerId]['load'] = res[prosumerId + loadSuffix];
                        }

                        resources[prosumerId]['lastUpdate'] = today;
                    }

                    // Call next function without errors
                    callback(null);
                }

            });

        }

        function postResourcesCreated(err) {
            if (!err) {
                insertEntities(notificationsByProsumer);
            } else {
                console.log(err);
            }

        }

        // Create datasets
        // if (Object.keys(resources).length == 0) {
            async.map(prosumersIds, createDataset, function(err, result) {
                createResources(prosumersIds, postResourcesCreated);
            });
        // } else {
        //    createResources(prosumersIds, postResourcesCreated);
        // }

    });

    res.end();
}

// Subscribe to the Context Broker
var init = function init(host, port) {

    // Create API to receive notifications
    var app = express();
    // app.use(bodyParser.json());             // for parsing application/json
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
