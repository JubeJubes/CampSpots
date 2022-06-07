mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // style URL
center:  loc.geometry.coordinates,
zoom: 10 // starting zoom
});

const marker1 = new mapboxgl.Marker()
.setLngLat(loc.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25})
    .setHTML(
        `<h5 class="pe-3 ps-2 text-muted"><b>${loc.title}</b></h5><div class="pe-3 ps-2 ">${loc.location}</div>`
    )
)
.addTo(map);