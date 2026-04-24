mapboxgl.accessToken =mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        center:listing.geometry.coordinates,
        zoom: 9
    });

    new mapboxgl.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({offset:25}).setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`)
        )
        .addTo(map);


//     const map = new mapboxgl.Map({
//         container: 'map', // container ID
//         center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
//         zoom: 9 // starting zoom
// });
// //to set coordinates taken from user to set in mapbox
// const marker=new mapboxgl.Marker({color:"red"})
//     .setLngLat(coordinates)
//     .addTo(map);
    
