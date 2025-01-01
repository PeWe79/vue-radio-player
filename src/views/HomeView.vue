<template>
  <!-- app player container -->
  <main id="player-wrap" class="player-wrap" style="opacity: 0">
    <!-- bg absolute elements -->
    <figure id="player-bg" class="player-bg" style="background-image: url(/img/bg.jpg)"></figure>
    <canvas id="player-canvas" class="player-canvas" width="800" height="400"></canvas>

    <!-- main player layout -->
    <section class="player-layout">
      <!-- player top header -->
      <header class="player-header flex-row flex-middle flex-stretch">
        <h2 class="player-logo text-clip flex-1">
          <i class="ico ico-waveform"></i> &nbsp; <span>Web Radio</span>
        </h2>
        <button
          class="text-nowrap common-btn focus-text"
          type="button"
          @click="toggleSidebar(true)"
          title="Open stations menu"
        >
          <i class="ico ico-menu"></i>
        </button>
      </header>

      <!-- player middle content area -->
      <main class="player-content flex-row">
        <!-- default greet message -->
        <section class="player-greet" v-if="!hasStation && !hasErrors">
          <div class="fx fx-slide-left push-bottom">
            <h1>Pick a Station</h1>
          </div>
          <div class="fx fx-slide-left fx-delay-1 push-bottom">
            This is a music streaming player for the stations provided by Web Radio. Just pick a
            station from the sidebar to the right to start listening.
          </div>
          <div class="fx fx-slide-up fx-delay-2 pad-top">
            <button class="cta-btn focus-box" type="button" @click="toggleSidebar(true)">
              <i class="ico ico-headphones"></i> &nbsp; View Stations
            </button>
          </div>
        </section>

        <!-- show selected station info if possible -->
        <section class="player-channel flex-1" v-if="hasStation && !hasErrors" :key="station.name">
          <div class="flex-autorow flex-top flex-stretch">
            <!-- station details -->
            <div class="flex-item flex-1">
              <!-- station -->
              <div class="push-bottom">
                <div class="flex-row flex-middle pad-bottom">
                  <div class="fx fx-drop-in fx-delay-1">
                    <img class="album-cover" :src="coverArtUrls" :alt="station.name" />
                  </div>
                  <div class="pad-left">
                    <h3 class="text-clip fx fx-fade-in fx-delay-2">
                      <span>{{ station.name }}</span>
                    </h3>
                    <div class="fx fx-fade-in fx-delay-3">
                      <favBtn
                        :id="station.shortcode"
                        :active="station.favorite"
                        text="Favorite"
                        @change="toggleFavorite"
                      ></favBtn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- description -->
              <div class="push-bottom pad-bottom fx fx-slide-up fx-delay-3">
                <div class="push-bottom">
                  <span class="text-secondary">Mixed by DJ {{ station.name || 'N/A' }}.</span>
                  <br />
                  <span class="text-bright text-capitalize">
                    {{ station.title }}
                  </span>
                  <span class="text-faded">Playlist:</span>&nbsp;
                  <span class="text-bright text-capitalize">{{ npData.playlist || 'None' }}.</span>
                  <br />
                  <span>{{ station.description }}</span>
                </div>
                <div class="flex-row flex-middle">
                  <div class="fx fx-slide-up fx-delay-2 push-right" v-if="station.infourl">
                    <a
                      class="cta-btn text-nowrap focus-box"
                      :href="station.infourl"
                      title="Station page"
                      target="_blank"
                    >
                      <i class="ico ico-earth"></i>&nbsp; Webpage
                    </a>
                  </div>
                  <div class="fx fx-slide-up fx-delay-3 push-right" v-if="station.plsfile">
                    <a
                      class="cta-btn text-nowrap focus-box"
                      :href="station.plsfile"
                      title="Download PLS"
                      target="_blank"
                    >
                      <i class="ico ico-download"></i>&nbsp; PLS
                    </a>
                  </div>
                  <div class="fx fx-slide-up fx-delay-4 push-right" v-if="station.twitter">
                    <a
                      class="cta-btn text-nowrap focus-box"
                      :href="station.twitter"
                      title="Twitter page"
                      target="_blank"
                    >
                      <i class="ico ico-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>

              <!-- heading now playing -->
              <div class="flex-row flex-middle push-bottom">
                <div class="push-right">
                  <h5 class="text-nowrap fx fx-fade-in fx-delay-2">
                    <i class="ico ico-playing"></i>&nbsp; Now Playing
                  </h5>
                </div>
                <div
                  class="fx fx-slide-left fx-delay-3"
                  :key="formatNumber(station.mounts[0].listeners.current)"
                >
                  <i class="ico ico-headphones"></i>&nbsp;
                  {{ formatNumber(station.mounts[0].listeners.current) }}
                  listening
                </div>
              </div>

              <!-- current track -->
              <div class="card fx fx-slide-left fx-delay-4">
                <div>
                  <span class="text-secondary">
                    {{ npSong.title || 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-faded">From:</span>&nbsp;
                  <span class="text-bright">
                    {{ npSong.album || 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-faded">By:</span>&nbsp;
                  <span class="text-default">
                    {{ npSong.artist || 'N/A' }}
                  </span>
                </div>
              </div>

              <!-- heading next playing, will showing when station support next song  -->
              <div v-if="hasNextSong">
                <div class="flex-row flex-middle push-bottom">
                  <div class="push-right">
                    <h6 class="text-nowrap fx fx-fade-in fx-delay-2">
                      <i class="ico ico-playing"></i>&nbsp; Next Playing
                    </h6>
                  </div>
                </div>

                <!-- next track -->
                <div class="card fx flex-row flex-top flex-stretch fx-delay-4">
                  <div>
                    <img
                      v-if="nextCoverArtUrls"
                      class="history-cover"
                      :alt="nextSong.title"
                      :src="nextCoverArtUrls"
                    />
                  </div>
                  <div class="pad-left">
                    <div>
                      <span class="text-secondary">
                        {{ nextSong.title || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">Played: </span>&nbsp;
                      <span class="text-default">
                        {{ getPlayAt(nextPl.played_at) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">From:</span>&nbsp;
                      <span class="text-bright">
                        {{ nextAlbum || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">By:</span>&nbsp;
                      <span class="text-default">
                        {{ nextSong.artist || 'N/A' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- songs list -->
            <div class="flex-item flex-1">
              <div class="push-bottom">
                <h5 class="text-nowrap fx fx-fade-in fx-delay-1">
                  <i class="ico ico-collection"></i>&nbsp; Recent Tracks
                </h5>
              </div>

              <div class="card push-bottom fx fx-slide-left fx-delay-4" v-if="!hasSongs">
                There are no songs loaded yet for this station.
              </div>

              <ul class="player-tracklist push-bottom" v-if="hasSongs">
                <li
                  v-for="(historyItem, index) in songHist.slice(0, 5)"
                  :key="index"
                  class="card fx flex-row flex-top flex-stretch"
                  :class="'fx-slide-left fx-delay-' + (index + 5)"
                >
                  <div>
                    <img
                      v-if="songHistoryCoverArt[index]"
                      :src="songHistoryCoverArt[index]"
                      class="history-cover"
                    />
                  </div>
                  <div class="pad-left">
                    <div>
                      <span class="text-secondary">
                        {{ historyItem.song.title || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">Played: </span>&nbsp;
                      <span class="text-default">
                        {{ getPlayAt(historyItem.played_at) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">From:</span>&nbsp;
                      <span class="text-bright">
                        {{ songHistoryAlbum[index] || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-faded">By:</span>&nbsp;
                      <span class="text-default">
                        {{ historyItem.song.artist || 'N/A' }}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- show error messages -->
        <section class="player-errors flex-1 text-center" v-if="hasErrors" key="errors">
          <div class="push-bottom fx fx-drop-in fx-delay-1">
            <i class="ico ico-unplugged text-huge"></i>
          </div>
          <div class="fx fx-slide-up fx-delay-2">
            <h3>Oops, there's a problem!</h3>
          </div>
          <hr />
          <div
            v-for="(e, i) of errors"
            class="push-bottom fx fx-slide-up"
            :class="'fx-delay-' + (i + 3)"
            :key="e"
          >
            <span class="text-primary">{{ e }}</span>
          </div>
          <hr />
          <button
            class="cta-btn text-nowrap focus-box fx fx-slide-up fx-delay-4"
            type="button"
            @click="tryAgain"
          >
            <i class="ico ico-waveform"></i>&nbsp; Try again
          </button>
        </section>
      </main>

      <!-- player footer with controls -->
      <footer class="player-footer flex-row flex-middle flex-space">
        <!-- player controls -->
        <section
          class="player-controls flex-row flex-middle push-right"
          :class="{ disabled: !canPlay }"
        >
          <button class="common-btn focus-text" type="button" @click="togglePlay">
            <i v-if="loading" class="ico ico-loader fx fx-spin-right" key="wait"></i>
            <i v-else-if="playing" class="ico ico-stop fx fx-drop-in" key="stop"></i>
            <i v-else class="ico ico-play fx fx-drop-in" key="play"></i>
          </button>
          <div class="form-slider push-left">
            <span>
              <i v-if="volume >= 75" class="ico ico-volume-4"></i>
              <i v-else-if="volume >= 50" class="ico ico-volume-3"></i>
              <i v-else-if="volume >= 25" class="ico ico-volume-2"></i>
              <i v-else class="ico ico-volume-1"></i>
            </span>
            <input
              class="common-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value="100"
              v-model="volume"
              @change="saveVolume()"
            />
          </div>
          <div class="text-clip push-left">
            <span>{{ timeDisplay }}</span>
            <span class="text-faded" v-if="hasStation">&nbsp;|&nbsp;</span>
            <span class="fx fx-fade-in fx-delay-1" v-if="hasStation" :key="station.shortcode">{{
              station.name
            }}</span>
          </div>
        </section>

        <!-- player links -->
        <section class="player-links text-nowrap">
          <a
            class="common-btn text-faded focus-text"
            href="https://github.com/PeWe79"
            title="Github profile"
            target="_blank"
          >
            <i class="ico ico-github"></i>
          </a>
        </section>
      </footer>
    </section>
    <!-- layout wrapper -->

    <!-- player stations overlay + sidebar -->
    <section
      class="player-stations"
      :class="{ active: sbActive, visible: sbVisible }"
      @click="toggleSidebar(false)"
      tabindex="-1"
      ref="sidebarDrawer"
    >
      <aside class="player-stations-sidebar" @click.stop>
        <!-- sidebar search -->
        <header class="player-stations-header flex-row flex-middle flex-stretch">
          <div class="form-input push-right">
            <i class="ico ico-search"></i>
            <input type="text" placeholder="Search station..." v-model="searchText" />
          </div>
          <button
            class="common-btn focus-text"
            type="button"
            @click="toggleSidebar(false)"
            title="Close stations menu"
          >
            <i class="ico ico-close"></i>
          </button>
        </header>

        <!-- sidebar stations list -->
        <ul class="player-stations-list">
          <li
            class="player-stations-list-item flex-row flex-top flex-stretch"
            tabindex="0"
            v-for="c of stationsList"
            :key="c.shortcode"
            @click="selectStation(c, true)"
            :class="{ active: c.active }"
            :title="c.title"
          >
            <figure class="push-right">
              <img class="history-cover" :src="c.brandImg" :alt="c.name" />
            </figure>
            <aside class="flex-1">
              <div class="flex-row flex-middle flex-space">
                <div class="player-stations-list-title text-bright text-clip">
                  {{ c.name }}
                </div>
                <div class="text-nowrap">
                  <span class="text-secondary">
                    <i class="ico ico-headphones"></i>&nbsp;
                    {{ formatNumber(c.mounts[0].listeners.current) }} &nbsp;
                  </span>
                  <favBtn :id="c.shortcode" :active="c.favorite" @change="toggleFavorite"></favBtn>
                </div>
              </div>
              <div class="text-small">
                <span class="text-faded text-uppercase text-small">
                  {{ c.genre }}
                </span>
                <br />
                {{ c.description }}
              </div>
            </aside>
          </li>
        </ul>

        <!-- sidebar sort options -->
        <footer class="player-stations-footer flex-row flex-middle flex-stretch">
          <div class="flex-1 push-right">
            <span
              @click="toggleSortOrder()"
              class="ico clickable"
              :class="{
                'ico-sort-desc': sortOrder === 'desc',
                'ico-sort-asc': sortOrder === 'asc',
              }"
              >&nbsp;</span
            >
            <span class="text-faded">Sort: &nbsp;</span>
            <span class="text-bright popover">
              <span class="clickable">{{ sortLabel }}</span>
              <span class="popover-box popover-top">
                <button type="button" @click="sortBy('name', 'asc')">
                  <i class="text-faded ico ico-sort-asc"></i> &nbsp; Station Name
                </button>
                <button type="button" @click="sortBy('listeners', 'desc')">
                  <i class="text-faded ico ico-headphones"></i> &nbsp; Listeners Count
                </button>
                <button type="button" @click="sortBy('favorite', 'desc')">
                  <i class="text-faded ico ico-favs-check"></i> &nbsp; Saved Favorites
                </button>
                <button type="button" @click="sortBy('genre', 'asc')">
                  <i class="text-faded ico ico-collection"></i> &nbsp; Music Genre
                </button>
              </span>
            </span>
          </div>
          <div>
            <button type="button" @click.stop="saveFavorites()" title="Download Favorites PLS">
              <i class="ico ico-download"></i>
            </button>
          </div>
        </footer>
      </aside>
    </section>
  </main>
  <!-- player -->
</template>

<script>
import favBtn from '@/components/favBtn.vue'
import _api from '../assets/js/api'
import _audio from '../assets/js/audio'
import _scene from '../assets/js/scene'
import _store from '../assets/js/store'
import _utils from '../assets/js/utils'

export default {
  name: 'HomeView',
  components: {
    favBtn,
  },

  data: () => {
    return {
      // toggles
      init: false,
      visible: true,
      playing: false,
      loading: false,
      sidebar: false,
      volume: 80,
      // sidebar toggles
      sbActive: false,
      sbVisible: false,
      // stations stuff
      route: '/',
      stations: [],
      station: {},
      npSong: {},
      songHist: [],
      histSongs: [],
      songNow: {},
      npData: {},
      nextSong: {},
      nextPl: {},
      coverArtUrls: [],
      nextCoverArtUrls: [],
      nextAlbum: {},
      songHistoryCoverArt: {},
      songHistoryAlbum: {},
      favorites: [],
      errors: {},
      // timer stuff
      timeStart: 0,
      timeDisplay: '00:00:00',
      timeItv: null,
      // sorting stuff
      searchText: '',
      sortParam: 'listeners',
      sortOrder: 'desc',
      // timer stuff
      anf: null,
      sto: null,
      itv: null,
    }
  },

  // watch methods
  watch: {
    // watch playing status
    playing() {
      if (this.playing) {
        this.startClock()
      } else {
        this.stopClock()
      }
    },

    // update player volume
    volume() {
      _audio.setVolume(this.volume)
    },
  },

  // computed methods
  computed: {
    // filter stations list
    stationsList() {
      let list = this.stations.slice()
      const search = this.searchText
        .replace(/[^\w\s-]+/g, '')
        .replace(/[\r\s\t\n]+/g, ' ')
        .trim()

      if (search && search.length > 1) {
        list = _utils.search(list, 'name', search)
      }
      if (this.sortParam) {
        list = _utils.sort(list, this.sortParam, this.sortOrder, false)
      }
      if (this.station.shortcode) {
        list = list.map((i) => {
          i.active = this.station.shortcode === i.shortcode ? true : false
          return i
        })
      }
      return list
    },

    // sort-by label for buttons, etc
    sortLabel() {
      switch (this.sortParam) {
        case 'name':
          return 'Station Name'
        case 'listeners':
          return 'Listeners Count'
        case 'favorite':
          return 'Saved Favorites'
        case 'genre':
          return 'Music Genre'
        default:
          return []
      }
    },

    // check if audio can be played
    canPlay() {
      return this.station.shortcode && !this.loading ? true : false
    },

    // check if a station is selected
    hasStation() {
      return this.station.shortcode ? true : false
    },

    // check if there are tracks loaded
    hasSongs() {
      return this.songHist.length ? true : false
    },

    // check for errors that would affect playback
    hasErrors() {
      if (this.errors.support || this.errors.stream) return true
      if (this.errors.stations && !this.stations.length) return true
      return false
    },

    // check if there is a next song
    hasNextSong() {
      return this.nextSong.title ? true : false
    },
  },

  // custom methods
  methods: {
    // format number
    formatNumber(num) {
      return new Intl.NumberFormat('id-ID').format(num)
    },

    // run maintenance tasks on a timer
    setupMaintenance() {
      this.itv = setInterval(() => {
        this.getStations(this.sidebar) // update stations
        this.getSongs(this.station) // update station tracks
      }, 1000 * 30)
    },

    // set an erro message
    setError(key, err) {
      const errors = Object.assign({}, this.errors)
      errors[key] = String(err || '').trim()
      /* eslint-disable */
      if (err) console.warn('ERROR(' + key + '):', err)
      this.errors = errors
    },

    // clear all error messages
    clearError(key) {
      let errors = Object.assign({}, this.errors)
      delete errors[key]
      this.errors = errors
    },

    // check if an error has been set for a key
    hasError(key) {
      return key && Object.prototype.hasOwnProperty.call(this.errors, key)
    },

    // flush all errors
    flushErrors() {
      this.errors = {}
    },

    // show player when app is mounted
    setupEvents() {
      document.addEventListener('visibilitychange', () => {
        this.visible = document.visibilityState === 'visible'
      })
      window.addEventListener('hashchange', () => this.applyRoute(window.location.hash))
      window.addEventListener('keydown', this.onKeyboard)
      // audio related events
      _audio.on('waiting', this.onWaiting)
      _audio.on('playing', this.onPlaying)
      _audio.on('ended', this.onEnded)
      _audio.on('error', this.onError)
    },

    // hide spinner and show player
    initPlayer() {
      setTimeout(() => {
        document.querySelector('#_spnr').style.display = 'none'
        document.querySelector('#player-wrap').style.opacity = '1'
        this.init = true
      }, 100)
    },

    // reset selected station
    resetPlayer() {
      this.closeAudio()
      this.flushErrors()
      this.station = {}
      this.songHist = []
    },

    // try resuming stream problem if possible
    tryAgain() {
      if (this.hasError('support')) {
        this.flushErrors()
        setTimeout(this.setupAudio, 1)
      } else {
        this.flushErrors()
        this.playStation(this.station)
      }
    },

    // show/hide the sidebar
    toggleSidebar(toggle) {
      const state = typeof toggle === 'boolean' ? toggle : false
      if (state) {
        this.sbActive = true // bring to front
        this.sbVisible = true // show drawer
        this.$refs.sidebarDrawer.focus()
      } else {
        this.sbVisible = false
        setTimeout(() => {
          this.sbActive = false
        }, 500)
      }
    },

    // toggle stream playback for current selected station
    togglePlay(e) {
      e && e.preventDefault()
      if (this.loading) return
      if (this.playing) return this.closeAudio()
      this.playStation(this.station)
    },

    // save volume to store
    saveVolume() {
      _store.set('player_volume', this.volume)
    },

    // load saved volume from store
    loadVolume() {
      const vol = parseInt(_store.get('player_volume')) || 80
      this.volume = vol
    },

    // load last sort options from store
    loadSortOptions() {
      const opts = _store.get('sorting_data')
      if (opts && opts.param) this.sortParam = opts.param
      if (opts && opts.order) this.sortOrder = opts.order
    },

    // toggle sort order
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },

    // apply sorting and toggle order
    sortBy(param, order) {
      if (this.sortParam === param) {
        this.toggleSortOrder()
      } else {
        this.sortOrder = order || 'asc'
      }
      this.sortParam = param
      _store.set('sorting_data', {
        param: this.sortParam,
        order: this.sortOrder,
      })
    },

    // load saved favs list from store
    loadFavorites() {
      const favs = _store.get('favorites_data')
      if (!Array.isArray(favs)) return
      this.favorites = favs
    },

    // save favs to a .m3u file
    saveFavorites() {
      let data = '#EXTM3U'
      for (let id of this.favorites) {
        const station = this.stations.filter((c) => c.shortcode === id).shift()
        if (!station) continue
        data += '\n\n'
        data += `#EXTINF:0,${station.title} [AzuraCast]\n`
        data += `${station.mp3file}`
      }
      const elm = document.createElement('a')
      elm.setAttribute('href', 'data:audio/mpegurl;charset=utf-8,' + encodeURIComponent(data))
      elm.setAttribute('download', 'AzuraCast_favorites.m3u')
      elm.setAttribute('target', '_blank')
      document.body.appendChild(elm)
      setTimeout(() => elm.click(), 100)
      setTimeout(() => elm.remove(), 1000)
    },

    // toggle favorite station by id
    toggleFavorite(id, toggle) {
      let favs = this.favorites.slice()
      favs = favs.filter((fid) => fid !== id)
      if (toggle) favs.push(id)
      this.favorites = favs
      this.updateCurrentStation()
      _store.set('favorites_data', favs)
    },

    // close active audio
    closeAudio() {
      _audio.stopAudio()
      this.playing = false
    },

    // setup animation canvas
    setupCanvas() {
      _scene.setupCanvas()
    },

    // audio visualizer animation loop
    updateCanvas() {
      this.anf = requestAnimationFrame(this.updateCanvas)
      if (this.visible) {
        const freq = _audio.getFreqData(this.playing)
        _scene.updateObjects(freq)
      }
    },

    // get stations data from api
    getStations(sidebar) {
      _api.getStations((err, stations) => {
        if (err) return this.setError('stations', err)
        this.stations = stations
        this.clearError('stations')
        this.updateCurrentStation()
        this.applyRoute(window.location.hash, sidebar)
      })
    },

    // get songs list for a station from api
    getSongs(station, cb) {
      if (!station || !station.shortcode || !station.songsurl) return
      if (!this.isCurrentStation(station)) {
        this.songHist = []
        this.histSongs = []
        this.songNow = {}
        this.npData = {}
        this.nextSong = {}
        this.nextPl = {}
      }

      _api.getSongs(station, (err, reslt) => {
        if (err) return this.setError('reslt', err)
        if (typeof cb === 'function') cb(reslt)
        this.songNow = reslt.now_playing.song
        this.songHist = reslt.song_history
        this.histSongs = reslt.song_history
        this.npData = reslt.now_playing
        this.nextSong = reslt.playing_next.song
        this.nextPl = reslt.playing_next
        this.clearError('reslt')

        // get cover
        this.fetchCoverArt(this.songNow).then((coverArtData) => {
          this.coverArtUrls = coverArtData.artworkUrl
          this.npSong = coverArtData
        })
        this.fetchNextCoverArt(this.nextSong)
        this.fetchCoverArtForSongHistory(this.histSongs)
      })
    },

    fetchNextCoverArt(nextSong) {
      this.fetchCoverArt(nextSong).then((coverArtData) => {
        this.nextCoverArtUrls = coverArtData.artworkUrl
        this.nextAlbum = coverArtData.album
      })
    },

    fetchCoverArtForSongHistory(songHistory) {
      const historyToFetch = songHistory.slice(0, 5)
      historyToFetch.forEach((data, index) => {
        this.fetchCoverArt(data.song).then((coverArtData) => {
          if (!this.songHistoryCoverArt) {
            this.songHistoryCoverArt = {}
            this.songHistoryAlbum = {}
          }
          this.songHistoryCoverArt[index] = coverArtData.artworkUrl
          this.songHistoryAlbum[index] = coverArtData.album
        })
      })
    },

    async fetchCoverArt(t) {
      const track = t.text
      const response = await fetch(
        `https://itunes.apple.com/search?limit=1&term=${encodeURIComponent(track)}`,
      )

      if (response.status === 403) {
        const results = {
          title: t.title,
          artist: t.artist,
          album: t.album,
          artworkUrl: t.art,
        }
        return results
      }

      const data = response.ok ? await response.json() : {}
      if (!data.results || data.results.length === 0) {
        const results = {
          title: t.title,
          artist: t.artist,
          album: t.album,
          artworkUrl: t.art,
        }
        return results
      }

      const itunes = data.results[0]
      const results = {
        title: itunes.trackName || t.title,
        artist: itunes.artistName || t.artist,
        album: itunes.collectionName || t.album,
        artworkUrl: itunes.artworkUrl100
          ? itunes.artworkUrl100.replace('100x100', '512x512')
          : t.art,
      }
      return results
    },

    // checks is a station is currently selected
    isCurrentStation(station) {
      if (!station || !station.shortcode || !this.station.shortcode) return false
      if (this.station.shortcode !== station.shortcode) return false
      return true
    },

    // update data for current selected station
    updateCurrentStation() {
      for (let c of this.stations) {
        // see if station has been saved as a favorite
        c.favorite = this.favorites.indexOf(c.shortcode) >= 0
        // see if station is currently selected
        if (this.isCurrentStation(c)) {
          this.station = Object.assign(this.station, c)
          c.active = true
        }
      }
    },

    // play audio stream for a station
    playStation(station) {
      if (this.playing || !station || !station.mp3file) return
      this.loading = true
      _audio.playSource(station.mp3file)
      _audio.setVolume(this.volume)
    },

    // select a station to play
    selectStation(station, play = false) {
      if (!station || !station.shortcode) return
      if (this.isCurrentStation(station)) return
      this.closeAudio()
      this.toggleSidebar(false)
      this.setRoute(station.route)
      this.getSongs(station)
      this.station = station
      // attempt to play only after user insteraction, triggered from clicking a station on the list
      if (play) {
        this.playStation(station)
      }
      document.title = this.station.name
    },

    // set station route
    setRoute(route) {
      route = '/' + String(route || '').replace(/^[#/]+|[/]+$/g, '').trim()
      window.location.hash = route
      this.route = route
    },

    // parse url hash route actions
    applyRoute(route, sidebar = false) {
      const data = String(route || '')
        .replace(/^[#/]+|[/]+$/g, '')
        .trim()
        .split('/')
      const action = data.length ? data.shift() : ''
      const param = data.length ? data.shift() : ''

      // select a station from the url
      if (action === 'station' && param) {
        const station = this.stations.filter((c) => c.shortcode === param).shift()
        if (station && station.shortcode) {
          return this.selectStation(station)
        }
      }
      // nothing to do, reset player
      this.closeAudio()
      this.resetPlayer()
      this.toggleSidebar(sidebar)
    },

    // on keyboard events
    onKeyboard(e) {
      const k = e.key || ''
      if (k === ' ' && this.station.shortcode) return this.togglePlay()
      if (k === 'Enter') return this.toggleSidebar(true)
      if (k === 'Escape') return this.toggleSidebar(false)
    },

    // waiting for media to load
    onWaiting(e) {
      if (this.sto) clearInterval(this.sto)
      this.sto = setTimeout(() => this.onError(e), 10000)
      this.playing = false
      this.loading = true
      console.log('onWaiting', e)
    },

    // audio stream playing
    onPlaying() {
      this.clearError('stream')
      this.playing = true
      this.loading = false
    },

    // audio stream ended
    onEnded() {
      this.playing = false
      this.loading = false
    },

    // error loading stream
    onError(e) {
      this.closeAudio()
      this.setError(
        'stream',
        `The selected stream (${this.station.title}) could not load, or stopped loading due to network problems.`,
      )
      this.playing = false
      this.loading = false
      /* eslint-disable */
      console.log('Error ', e)
    },

    // start tracking playback time
    startClock() {
      this.stopClock()
      this.timeStart = Date.now()
      this.timeItv = setInterval(this.updateClock, 1000)
      this.updateClock()
    },

    // update tracking playback time
    updateClock() {
      let p = (n) => (n < 10 ? '0' + n : '' + n)
      let elapsed = (Date.now() - this.timeStart) / 1000
      let seconds = Math.floor(elapsed % 60)
      let minutes = Math.floor((elapsed / 60) % 60)
      let hours = Math.floor(elapsed / 3600)
      this.timeDisplay = p(hours) + ':' + p(minutes) + ':' + p(seconds)
    },

    // stop tracking playback time
    stopClock() {
      if (this.timeItv) clearInterval(this.timeItv)
      this.timeItv = null
    },

    // clear timer refs
    clearTimers() {
      if (this.sto) clearTimeout(this.sto)
      if (this.itv) clearInterval(this.itv)
      if (this.anf) cancelAnimationFrame(this.anf)
    },

    // pass height property to css
    setCssHeight(elm, height) {
      elm.style.setProperty('--height', `${height}px`)
    },

    // keep track of window height
    updateHeight() {
      let root = document.querySelector(':root')
      this.setCssHeight(root, window.innerHeight)
      window.addEventListener('resize', () => this.setCssHeight(root, window.innerHeight))
    },

    // convert timestamp get playing at
    getPlayAt(numeric) {
      // Convert Unix timestamp to milliseconds
      const date = new Date(numeric * 1000)
      date.toLocaleString()
      date.toDateString()
      date.toLocaleTimeString()
      // Define options for formatting just get hour & minutes
      // weekday: "long", year: "numeric", month: "short",
      // day: "numeric", hour: "2-digit", minute: "2-digit",
      const options = {
        hour: '2-digit',
        minute: '2-digit',
      }
      const formattedDate = date.toLocaleTimeString('en-us', options)
      return formattedDate
    },
  },

  // on app mounted
  mounted() {
    this.loadSortOptions()
    this.loadFavorites()
    this.loadVolume()
    this.setupEvents()
    this.getStations(true)
    this.setupCanvas()
    this.updateCanvas()
    this.setupMaintenance()
    this.updateHeight()
    this.initPlayer()
  },

  // on app destroyed
  unmounted() {
    this.closeAudio()
    this.clearTimers()
  },
}
</script>
