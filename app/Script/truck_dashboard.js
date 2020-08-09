/**
 * Adds a  draggable marker to the map..
 *
 * @param {H.Map} map                      A HERE Map instance within the
 *                                         application
 * @param {H.mapevents.Behavior} behavior  Behavior implements
 *                                         default interactions for pan/zoom
 */

var map, marker;
var delay = 5000;


// If you set the delay below 1000ms and you go to another tab,
// the setTimeout function will wait to be the active tab again
// before running the code.
// See documentation :
// https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout#Inactive_tabs

function animateMarker(marker, vid) {
    var target = 0;
    var defaultIcon = new H.map.Icon("icon1.png", { size: { w: 35, h: 25 } });
    //var defaultIcon = new H.map.Icon("https://image.flaticon.com/icons/svg/726/726455.svg", {size: {w: 30, h: 30}});
    //var defaultIcon = new H.map.Icon("https://image.flaticon.com/icons/svg/275/275338.svg", {size: {w: 30, h: 30}});
    //var defaultIcon = new H.map.Icon("https://www.flaticon.com/premium-icon/icons/svg/1675/1675361.svg", {size: {w: 20, h: 20}});
    //var defaultIcon = new H.map.Icon("icon2.png", {size: {w: 30, h: 30}});

    function goToPoint() {

        window.fetch("/user/" + vid).then(r => r.json()).then(res => {

            console.log(res[0]["latMatched"]);
            console.log(res[0]["lonMatched"]);

            var deltaLat = (res[0]["latMatched"]);
            var deltaLng = (res[0]["lonMatched"]);

            function moveMarker() {
                const lat = deltaLat;
                const lng = deltaLng;
                marker.setVisibility(false);
                marker = new H.map.Marker({ lat: lat, lng: lng }, { icon: defaultIcon });
                map.addObject(marker);
                setTimeout(goToPoint, 5000);
            }
            moveMarker();
        }).catch((ex) => {
            throw new Error('fetch failed' + ex)
        });
    }
    goToPoint();
}

/*
 * Boilerplate map initialization code starts below:
 */

//Step 1: initialize communication with the platform
function loadmap(clat, clon, apikey) {

    var platform = new H.service.Platform({
        apikey: apikey,
        useCIT: true,
        useHTTPS: true
    });

    var defaultLayers = platform.createDefaultLayers();


    //Step 2: initialize a map - this map is centered over Boston
    map = new H.Map(document.getElementById('map'),
        defaultLayers.vector.normal.map, {
            center: { lat: clat, lng: clon },
            zoom: 14
        });

    //Step 3: make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    var pixelRatio = 1, // alternatively window.devicePixelRatio
        tileSize = pixelRatio === 1 ? 256 : 512,
        ppi = pixelRatio === 1 ? undefined : 320;

    var maptypes = platform.createDefaultLayers({
        tileSize: tileSize,
        ppi: ppi
    });
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Step 4: Create the default UI with Initial marker:
    var ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');
    marker = new H.map.Marker({ lat: clat, lng: clon });
    map.setBaseLayer(defaultLayers.vector.normal.map);
    map.addObject(marker);
}
// Step 5: Create Ecent listner

function addClickEventListenerToMap() {
    var apikey;
    window.fetch("/secret/apikey").then(data => data.json()).then(key => {
        apikey = key.apikey;
    });

    window.fetch("/clat").then(clat => clat.json()).then(clat1 => {
        var dlat = clat1[0]['latMatched'];
        var dlon = clat1[0]['lonMatched'];
        console.log('\tQuery returned:' + clat1[0]['latMatched'] + "," + clat1[0]['lonMatched'] + '\n');
        loadmap(dlat, dlon, apikey);

        window.fetch("/trucks").then(rvid => rvid.json()).then(resvid => {
                for (var queryResult of resvid) {
                    console.log('\tQuery returned:' + queryResult + '\n');
                    animateMarker(marker, queryResult);
                }
            })
            .catch((ex) => {
                alert("Response Empty 1, Run the producer first.!");
                throw new Error('fetch failed' + ex)
            });
    }).catch((ex) => {
        alert("Response Empty 2, Run the producer first.!");
        console.log(ex);
        throw new Error('fetch failed' + ex)
    });

    // animateMarker(marker, 1); 
}

addClickEventListenerToMap();

$('head').append('<link rel="stylesheet" href="https://js.api.here.com/v3/3.0/mapsjs-ui.css" type="text/css" />');