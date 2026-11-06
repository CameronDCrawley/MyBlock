async function getMap(){
  const map =new google.maps.Map(document.getElementById('map'),{
center: { lat:40.7282, lng: -73.7949},//Queens location
zoom:11,
mapTypeControl:false,
streetViewControl:false,


  })
  const info = new google.maps.InfoWindow()

  try{
    const res = await fetch('/api/places')
    const places = await res.json()

    places.forEach(p => {
      const marker = new google.maps.Marker( {
        position:{lat:p.lat, lng:p.plug},
        map,
        title:p.name
      })
      marker.addListener('click',()=> {
        const box = document.createElement('strong');
        box.textContent = p.name
        info.setContent(box)
        info.open(map,marker)
      })
    });
  } catch(err){
    console.log('Couldnt load',err)
  }
}

window.getMap = getMap