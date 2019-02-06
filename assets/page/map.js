class Application {
    constructor(element) {
        var platform = new H.service.Platform({
            app_id: 'glc84RI61vvZ5tT7nqHC',
            app_code: 'qV7SBpyMBmVR4YDjSa5aGg',
            useCIT: true,
        });

        this.geocoder = platform.getGeocodingService();
        this.router = platform.getRoutingService();

        var layers = platform.createDefaultLayers();
        this.map = new H.Map(element, layers.normal.map);
        var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

        this.mapObjects = new H.map.Group();
        this.map.addObject(this.mapObjects);

        this.map.addEventListener('tap', (e) => {
            var coord = this.map.screenToGeo(e.currentPointer.viewportX, e.currentPointer.viewportY);
            if(this.onTap) this.onTap(coord);
        });

        this.markerCurrent = new H.map.Marker({lat: 0, lng: 0});
        this.markerDestination = new H.map.Marker({lat: 0, lng: 0});
        this.markerStations = [];
        this.polylineStations = [];
    }

    addPolyline(points) {
        var lineString = new H.geo.LineString();
        var polyline = new H.map.Polyline(lineString, {
            style: {
                strokeColor: 'red',
                lineWidth: 2,
            },
        });

        this.mapObjects.addObject(polyline);

        return polyline;
    }

    setStations(stations) {
        this.stations = stations.map(station => {
            var color = `${Math.floor(Math.random() * 0x1000000).toString(16)}`;
            color = `#${color}${'0'.repeat(6 - color.length)}`;

            return Object.assign({}, station, {
                color: color
            });
        });

        this.markerStations.forEach((marker) => {
            if(this._isMapObject(marker)) this.mapObjects.removeObject(marker);
        });

        this.markerStations.length = 0;

        this.stations.forEach((station) => {
            var svg =
                `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <circle fill="${station.color}" cx="12" cy="12" r="12" />
                        <text x="50%" y="65%" text-anchor="middle" font-weight="bold" fill="white">${station.id}</text>
                    </g>
                </svg>`
            ;
            var icon = new H.map.Icon(svg);
            var marker = new H.map.Marker({
                lat: station.latitude,
                lng: station.longitude,
            }, {
                icon: icon,
            });

            this.markerStations.push(marker);
            this.mapObjects.addObject(marker);
        });

        this._updateRoutes();
    }

    setCurrentLocation(loc) {
        this.locCurrent = loc;

        if(loc) {
            this.markerCurrent.setPosition(loc);
            if(!this._isMapObject(this.markerCurrent)) this.mapObjects.addObject(this.markerCurrent);
            this._updateRoutes();
        } else {
            if(this._isMapObject(this.markerCurrent)) this.mapObjects.removeObject(this.markerCurrent);
            this.mapObjects.removeObject(this.markerCurrent);
        }
    }

    setDestination(loc) {
        this.locDestination = loc;

        if(loc) {
            this.markerDestination.setPosition(loc);
            if(!this._isMapObject(this.markerDestination)) this.mapObjects.addObject(this.markerDestination);
            this._updateRoutes();
        } else {
            if(this._isMapObject(this.markerDestination)) this.mapObjects.removeObject(this.markerDestination);
            this.mapObjects.removeObject(this.markerDestination);
        }
    }

    _isMapObject(obj) {
        return this.mapObjects.getObjects().indexOf(obj) !== -1;
    }

    _updateRoutes() {
        if(!this.locCurrent || !this.locDestination || !this.stations || !this.stations.length) return;

        this.polylineStations.forEach((polyline) => {
            if(this._isMapObject(polyline)) this.mapObjects.removeObject(polyline);
        });

        this.polylineStations.length = 0;

        this.stations.forEach((station) => {
            this.router.calculateRoute({
                mode: 'fastest;car',
                waypoint0: `geo!${this.locCurrent.lat},${this.locCurrent.lng}`,
                waypoint1: `geo!${station.latitude},${station.longitude}`,
                waypoint2: `geo!${this.locDestination.lat},${this.locDestination.lng}`,
                representation: 'display',
            }, (result) => {
                if(!result.response.route) return;

                const route = result.response.route[0];
                const routeShape = route.shape;
                const linestring = new H.geo.LineString();

                routeShape.forEach((pnt) => {
                    var coord = pnt.split(',');
                    linestring.pushLatLngAlt(coord[0], coord[1]);
                });

                var polyline = new H.map.Polyline(linestring, {
                    style: {
                        strokeColor: station.color,
                        lineWidth: 3,
                    }
                });

                this.polylineStations.push(polyline);
                this.mapObjects.addObject(polyline);
            }, (err) => {
                console.error(err.message);
            });
        });
    }

    center() {
        this.map.setViewBounds(this.mapObjects.getBounds());
    }
}

var locCurrent, locDestination;
var startMarker, endMarker;
var stationMarker = [];

$(document).on('message', function(e) {
    const data = JSON.parse(e.originalEvent.data);

    app.setCurrentLocation({
        lat: data.coords.latitude,
        lng: data.coords.longitude,
    })
});

var app = new Application(document.getElementById('divMap'));
app.onTap = loc => app.setDestination(loc);

navigator.geolocation.watchPosition((pos) => {
    app.setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
    });
});

fetch('https://flood-monitor.herokuapp.com/api/station').then(res => {
    res.json().then(stations => app.setStations(stations));
});
