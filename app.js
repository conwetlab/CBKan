/*
 *     Copyright 2015 (c) CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of CBKan.
 *
 *     CBKan is free software: you can redistribute it and/or modify it
 *     under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     CBKan is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with CBKan. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

"use strict";

require("date-utils");

// main service config
var async = require('async');
var bodyParser = require('body-parser');
var ckan = require('ckan');
var config = require('./config');
var express = require('express');
var NGSI = require('ngsijs');
var url = require('url');

// Subscription ID
var subscriptionId;

// CKAN Resources
var resourcesDate = Date.yesterday();       // Create new resources in the first execution
var resources = {};

// Queue to process the messages
var queue = async.queue(parseNotification, 1);

// SHUT DOWN FUNCTION
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

}

process.on('SIGINT', gracefullyShuttinDown);
process.on('SIGTERM', gracefullyShuttinDown);


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
                            console.log('Resource ' + name + ' (ID: ' + resourceId + ') created for dataset ' + datasetId + '.');
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

function parseNotification(elements, cb) {

    // Auxiliar function to insert records 
    function insertEntries(notificationsByType, cb) {

        var functions = [];

        for (var type in notificationsByType) {

            var notifications = notificationsByType[type];
            var parsedNotifications = [];

            for (var i = 0; i < notifications.length; i++) {
                var parsedNotification = {};

                for (var attribute in notifications[i]) {
                    parsedNotification[cammelCaseToReadableString(attribute)] = notifications[i][attribute]; 
                }

                // Add prosumer information
                var prosumerId = notifications[i]['prosumerId'];
                for (var attribute in config.PROSUMERS[prosumerId]) {
                    parsedNotification[attribute] = config.PROSUMERS[prosumerId][attribute];
                }


                parsedNotifications.push(parsedNotification);
            }

            functions.push(insertRecords.bind({}, resources[type], parsedNotifications));

        }

        async.parallel(functions, function(err, result) {
            cb(err);
        });
    }

    // Notifications by type
    var notificationsByType = {};

    for (var element in elements) {

        var type = elements[element]['type'].toLowerCase();

        if (!(type in notificationsByType)) {
            notificationsByType[type] = [];
        }

        notificationsByType[type].push(elements[element]);
    }

    // Create resources for meter and load.
    var today = new Date();
    var todayFormatted = today.toFormat('DD/MM/YYYY');
    var functions = {};
    var load = 'load';
    var meter = 'meter';

    if (!Date.equalsDay(today, resourcesDate)) {
        var funcMeter = createResource.bind({}, config.CKAN_DATASET, 'Meter ' + todayFormatted, config.METER_FIELDS);
        var funcLoad = createResource.bind({}, config.CKAN_DATASET, 'Load ' + todayFormatted, config.LOAD_FIELDS);

        functions[meter] = funcMeter;
        functions[load] = funcLoad;
    
        async.series(functions, function(err, result) {
            if (!err) {
                resources[meter] = result[meter];
                resources[load] = result[load];
                resourcesDate = today;
                insertEntries(notificationsByType, cb);
            } else {
                cb(err);
            }
        });

    } else {
        insertEntries(notificationsByType, cb);
    }
}


// CONTEXT BROKER
var connection = new NGSI.Connection(config.NGSI_URL);

var subscribeNGSI = function subscribeNGSI(urlToNotify) {
    console.log('Creating subscription to meter and load. Callaback URL: ' + urlToNotify);
    connection.createSubscription([
            {
                type: 'Meter',
                isPattern: true,
                id: '.*'
            },
            {
                type: 'Load',
                isPattern: true,
                id: '.*'
            }
        ],
        null,
        'P1Y',
        null,
        [{type: 'ONCHANGE', condValues: ['time', 'to', 'from']}],
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

        // Queue is needed to avoid concurrency issues. Without this queue,
        // the system creates more than two (one per meter and another for 
        // load) resources a day. 
        queue.push(data.elements, function(err) {
            if (err) {
                console.log('Error inserting entities', err);
            } else {
                console.log('Entities inserted correctly');
            }
        });
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
        console.log('Your Host could not be got, try to set it manually by editing config.js');
    });
}
