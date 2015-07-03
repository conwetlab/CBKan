exports.CKAN_URL = '<CKAN_URL>';
exports.CKAN_API_KEY = '<CKAN_API_KEY>';
exports.CKAN_DATASET = '<AN_EXISTING_CKAN_DATASET>';

exports.NGSI_URL = '<NGSI_URL>';

exports.HOST = '<HOST>'
exports.PORT = <PORT>;

// Prosumers
exports.PROSUMERS = {
    pros1: {
        City: 'city1',
        Country: 'Italy',
        'Number': 1,
        Province: 'province1',
        'Street Name': 'street1',
        'Zip Code': 1,
        Latitude: '115240E',
        Longitude: '452423N',
        Name: 'name1'
    },
    pros2: {
        City: 'city2',
        Country: 'Italy',
        'Number': 2,
        Province: 'province2',
        'Street Name': 'street2',
        'Zip Code': 2,
        Latitude: '105240E',
        Longitude: '462423N',
        Name: 'name2'
    },
    pros3: {
        City: 'city3',
        Country: 'Italy',
        'Number': 3,
        Province: 'province3',
        'Street Name': 'street3',
        'Zip Code': 3,
        Latitude: '135140E',
        Longitude: '422423N',
        Name: 'name3'
    },
    pros4: {
        City: 'city4',
        Country: 'Italy',
        'Number': 4,
        Province: 'province4',
        'Street Name': 'street4',
        'Zip Code': 4,
        Latitude: '115140E',
        Longitude: '452423N',
        Name: 'name4'
    },
    pros5: {
        City: 'city5',
        Country: 'Italy',
        'Number': 5,
        Province: 'province5',
        'Street Name': 'street5',
        'Zip Code': 5,
        Latitude: '125110E',
        Longitude: '422423N',
        Name: 'name5'
    },
    pros6: {
        City: 'city6',
        Country: 'Italy',
        'Number': 6,
        Province: 'province6',
        'Street Name': 'street6',
        'Zip Code': 6,
        Latitude: '125140E',
        Longitude: '422823N',
        Name: 'name6'
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


