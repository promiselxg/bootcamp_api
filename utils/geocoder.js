const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'tBqg0AESAAQ6QGUlm3YhCeD9c7VF7eAJ',
    formatter: null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder