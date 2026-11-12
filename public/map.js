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

    const color = {food: 'orange' , library: 'blue' , shelter: 'green', other: 'red'}

    places.forEach(p => {
      const marker = new google.maps.Marker( {
        position:{lat:p.lat, lng:p.lng},
        map,
        title:p.name,
        icon: {
          fillColor:color[p.type]||color.other,
          scale:8, //size
          fillOpacity:1,
          strokeColor:'white',
          path:google.maps.SymbolPath.CIRCLE // shape
        }
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