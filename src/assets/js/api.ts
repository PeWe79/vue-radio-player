/**
 * Soma-FM API handler
 */
import axios from 'axios'
import config from './config'

export default {
  // get stations data from api
  getStations(callback) {
    const apiurl = config.apiBaseUrl + '/api/stations'
    const error = 'There was a problem fetching the latest list of music stations from AzuraCast.'

    axios
      .get(apiurl)
      .then((res) => {
        const list = this._parseStations(res.data)
        if (!list.length) return callback(error, [])
        return callback(null, list)
      })
      .catch((e) => {
        return callback(error + String(e.message || ''), [])
      })
  },

  // fetch songs for a station
  getSongs(station, callback) {
    const apiurl = station.songsurl || ''
    const title = station.name || '...'
    const error =
      'There was a problem loading the list of songs for station ' + title + ' from AzuraCast.'

    axios
      .get(apiurl)
      .then((res) => {
        if (!res.data) return callback(error, [])
        return callback(null, res.data)
      })
      .catch((e) => {
        return callback(error + String(e.message || ''), [])
      })
  },

  // parse stations list from api response
  _parseStations(stations) {
    let output = []
    const randomNumber = Math.floor(Math.random() * 5)
    const fileName = '.jpg'
    const extension = fileName.split('/').pop()
    if (Array.isArray(stations)) {
      for (let c of stations) {
        c.plsfile = c.playlist_pls_url
        c.mp3file = c.listen_url
        c.songsurl = config.apiBaseUrl + '/api/nowplaying/' + c.id
        c.image = '/img/' + c.shortcode + '.png'
        c.brandImg =
          config.apiBaseUrl +
          '/static/uploads/' +
          c.shortcode +
          '/' +
          'album_art.' +
          randomNumber +
          extension
        c.infourl = c.url
        c.twitter = c.twitter ? 'https://twitter.com/@' + c.twitter : ''
        c.route = '/station/' + c.shortcode
        c.listeners = c.mounts[0].listeners.current | 0
        c.updated = c.updated | 0
        c.favorite = false
        c.active = false
        output.push(c)
      }
    }
    return output
  },
}
