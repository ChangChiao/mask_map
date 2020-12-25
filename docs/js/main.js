new Vue({
    el: '#app',
    data: {
        map: null,
        dataList: {},
        url: 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',
        group: ['日', '一', '二', '三', '四', '五', '六'],
        day: '',
        date: '',
        peopleList: ['1,3,5,7,9', '0,2,4,6,8'],
        canBuy: '',
        selcetedCity: '',
        selcetedCounty: '',
        showList: [],
        greenMark: null,
        redMark: null,
        markLayer: null,
        loading: false,
        status: [
            { color: 'green', icon: 'fa-check-circle' },
            { color: 'orange', icon: 'fa-exclamation-circle' },
            { color: 'gray', icon: 'fa-times-circle' }
        ],
        renderData: [],
        taiwanJson:{}
    },
    computed: {
        zoneList() {
            return this.taiwanData[this.selcetedCity] || []
        },
        cityList() {
            return Object.keys(this.taiwanData)
        },
        taiwanData() {
            let str = JSON.stringify(this.taiwanJson)
            str = str.replace(/台/g, '臺')
            return JSON.parse(str) || []
        },
        updatedTime(){
            return this.renderData[0] &&  this.renderData[0].properties.updated
        }
    },
    watch:{
        taiwanData(val){
            console.log('0000',val)
        },
        cityList(val){
            console.log('111',val)
        }
    },
    methods: {
        setMap() {
            this.map = L.map('map', {
                center: [25.033976, 121.5623609],
                zoom: 16
            });
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
            }).addTo(this.map);
        },
        checkStatus(num, type = 'color') {
            
            if(num === 0){
                return this.status[2][type]
            }
            if(num > 50){
                return this.status[0][type]
            }else{
                return this.status[1][type]
            }
            
        },
        getMaskData() {
            this.loading = true
            this.renderData = []
            fetch(this.url).then((response) => {
                return response.json()
            }).then((jsonData) => {
                this.loading = false
                console.log('jsonData', jsonData)
                this.dataList = jsonData
                this.filterCityData()
            })
        },
        setMark(arr = []) {
            let data = arr.length === 0 ? this.dataList['features'] : arr
            this.showList = data
            console.log('setmark', this.showList)
            this.cleanMarker()
            this.showList.forEach((item) => {
                let [x, y] = item.geometry.coordinates
                let { name, updated, custom_note, mask_adult, mask_child } = item.properties
                let marks = item.properties.mask_adult == 0 ? this.redMark : this.greenMark
                this.markLayer.addLayer(L.marker([y, x], { icon: marks }).bindPopup(`
                <h2>${name}</h2>
                <h4>成人口罩${mask_adult}</h4>
                <h4>兒童口罩${mask_child}</h4>
                <h5>更新時間:${updated}</h5>
                <p>備註:${custom_note || '暫無備註'}</p>
                <a target="_blank" href='https://www.google.com/maps/search/?api=1&query=${y},${x}'>在google map上查看</a>`
               ))
            })
            this.map.addLayer(this.markLayer)
        },
        test() {
            console.log('open')
            setTimeout(() => {
                L.popup().setLatLng([25.058709, 121.558489]).setContent("獨立的訊息方塊。").openOn(this.map);
            }, 1000)

        },
        focusLocation(item) {
            // L.popup().setLatLng([25.058709,121.558489]).setContent("獨立的訊息方塊。").openOn(this.map);
            // console.log('item',item)
            setTimeout(() => {
                let [x, y] = item.geometry.coordinates
                let { name, updated, custom_note, mask_adult, mask_child, id } = item.properties
                this.map.setView([y, x], 18)
                L.popup().setLatLng([y, x]).setContent(`
                <h2>${name}</h2>
                <h4>成人口罩${mask_adult}</h4>
                <h4>兒童口罩${mask_child}</h4>
                <h5>更新時間:${updated}</h5>
                <p>備註:${custom_note  || '暫無備註'}</p>
                <a target="_blank" href='https://www.google.com/maps/search/?api=1&query=${y},${x}'>在google map上查看</a>`)
                .openOn(this.map)
            }, 1000)
        },
        createMark() {
            this.greenMark = new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })

            this.redMark = new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            //https://github.com/pointhi/leaflet-color-markers
            this.markLayer = new L.MarkerClusterGroup().addTo(this.map)
        },
        getTime() {
            let date = new Date()
            let day = date.getDay()
            this.day = `星期${this.group[day]}`
            this.setClock()
            if (day != 0) {
                let num = day % 2 == 0 ? 1 : 0
                this.canBuy = `身分證尾碼為者${this.peopleList[num]}可購買`
            } else {
                this.canBuy = '全部的人都可購買'
            }
        },
        setClock() {
            setInterval(() => {
                this.date = new Date().toLocaleString()
            }, 1000)
        },
        filterCityData(type) {
            this.renderData = []
            if (type === 'city') {
                this.selcetedCounty = ''
            }
            console.log('this.selcetedCity', this.selcetedCity)
            let arr = this.dataList['features'].filter((item) => {
                if (this.selcetedCounty) {
                    return item.properties.county == this.selcetedCity &&
                        item.properties.town == this.selcetedCounty
                }
                return item.properties.county == this.selcetedCity
            })
            console.log('arrrr', arr)
            this.setMark(arr)
            this.loadMore()
            this.locationDefault()
        },
        locationDefault() {
            let [x, y] = this.renderData[0].geometry.coordinates
            this.map.setView([y, x], 18)
        },
        getPosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.getPosSuccess, this.getPosFail);
            } else {
                console.log('not support')
                this.selcetedCity = this.cityList[0]
            }
        },
        getPosSuccess(location) {
            console.log('getPosSuccess', location)
            this.map.setView([location.coords.latitude, location.coords.longitude], 18);
        },
        getPosFail() {
            this.selcetedCity = this.cityList[0]
            console.log('fail')
        },
        cleanMarker() {
            this.markLayer.clearLayers();
            this.map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    this.map.removeLayer(layer)
                }
            })
        },
        getTown(){
            fetch("/js/town.json")
                .then(response => {
                    console.log('response', response)
                    return response.json();
                })
                .then(data => this.taiwanJson = data);
        },
        loadMore() {
            let part = this.showList.splice(0, 10)
            this.renderData = this.renderData.concat(part)
        },
        scrollEvent() {
            let dom = document.getElementsByClassName('maskList')[0]
            dom.addEventListener('scroll', () => {
                if (this.showList.length === 0) return
                if (dom.scrollHeight - dom.scrollTop - dom.clientHeight < 40) {
                    this.loadMore()
                }
            })
        },
    },
    mounted() {
        this.getTown()
        this.setMap()
        this.createMark()
        // this.getPosition()
        this.getMaskData()
        this.getTime()
        this.scrollEvent()
    }
})