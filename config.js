exports.CKAN_URL = 'http://perseo.ls.fi.upm.es:8080'
exports.CKAN_API_KEY = 'fb6e7718-95e5-417f-b947-a969ab81e739'
exports.CKAN_DATASET = 'business-demo';

exports.NGSI_URL = 'http://130.206.124.52:1026';

exports.HOST = 'perseo.ls.fi.upm.es'
exports.PORT = 60010;

// Prosumers
exports.PROSUMERS = {
    pros1: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 47,
        Province: 'PD',
        'Street Name': 'Corso Stati Uniti',
        'Zip Code': 35127,
        Latitude: '45.490196',
        Longitude: '11.951623',
        Name: 'name1',
        'Is Consumer': true,
        'Is Producer': false,
        'Prosumer Type': 'house'
    },
    pros2: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 1,
        Province: 'PD',
        'Street Name': 'via Raffaello Nasini',
        'Zip Code': 35127,
        Latitude: '45.385157',
        Longitude: '11.902384',
        Name: 'name2',
        'Is Consumer': false,
        'Is Producer': true,
        'Prosumer Type': 'wind_turbine'
    },
    pros3: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 14,
        Province: 'PD',
        'Street Name': 'via Guasti',
        'Zip Code': 35124,
        Latitude: '45.380847',
        Longitude: '11.880334',
        Name: 'name3',
        'Is Consumer': true,
        'Is Producer': true,
        'Prosumer Type': 'house'
    },
    pros4: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 35,
        Province: 'PD',
        'Street Name': 'via Bainsizza',
        'Zip Code': 35143,
        Latitude: '45.390030',
        Longitude: '11.854653',
        Name: 'name4',
        'Is Consumer': true,
        'Is Producer': true,
        'Prosumer Type': 'shop'
    },
    pros5: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 4,
        Province: 'PD',
        'Street Name': 'via Monticano',
        'Zip Code': 35135,
        Latitude: '45.430311',
        Longitude: '11.869437',
        Name: 'name5',
        'Is Consumer': true,
        'Is Producer': false,
        'Prosumer Type': 'mall'
    },
    pros6: {
        City: 'Padova',
        Country: 'Italy',
        'Number': 37,
        Province: 'PD',
        'Street Name': 'via del Bigolo',
        'Zip Code': 35133,
        Latitude: '45.430757',
        Longitude: '11.902596',
        Name: 'name6',
        'Is Consumer': true,
        'Is Producer': false,
        'Prosumer Type': 'factory'
    }

}

// Fields
exports.METER_FIELDS = [
    {
        'id': 'City',
        'type': 'text'
    },
    {
        'id': 'Country',
        'type': 'text'
    },
    {
        'id': 'Number',
        'type': 'int'
    },
    {
        'id': 'Province',
        'type': 'text'
    },
    {
        'id': 'Street Name',
        'type': 'text'
    },
    {
        'id': 'Zip Code',
        'type': 'int'
    },
    {
        'id': 'Latitude',
        'type': 'text'
    },
    {
        'id': 'Longitude',
        'type': 'text'
    },
    {
        'id': 'Name',
        'type': 'text'
    },
    {
        'id': 'Is Consumer',
        'type': 'boolean'
    },
    {
        'id': 'Is Producer',
        'type': 'boolean'
    },
    {
        'id': 'Prosumer Type',
        'type': 'text'
    },
    {
        'id': 'Id',
        'type': 'text'
    },
    {
        'id': 'Type',
        'type': 'text'
    },
    {
        'id': 'Prosumer Id',
        'type': 'text'
    },
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

exports.LOAD_FIELDS = [
    {
        'id': 'City',
        'type': 'text'
    },
    {
        'id': 'Country',
        'type': 'text'
    },
    {
        'id': 'Number',
        'type': 'int'
    },
    {
        'id': 'Province',
        'type': 'text'
    },
    {
        'id': 'Street Name',
        'type': 'text'
    },
    {
        'id': 'Zip Code',
        'type': 'int'
    },
    {
        'id': 'Latitude',
        'type': 'text'
    },
    {
        'id': 'Longitude',
        'type': 'text'
    },
    {
        'id': 'Name',
        'type': 'text'
    },
    {
        'id': 'Is Consumer',
        'type': 'boolean'
    },
    {
        'id': 'Is Producer',
        'type': 'boolean'
    },
    {
        'id': 'Prosumer Type',
        'type': 'text'
    },
    {
        'id': 'Id',
        'type': 'text'
    },
    {
        'id': 'Type',
        'type': 'text'
    },
    {
        'id': 'Prosumer Id',
        'type': 'text'
    },
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


