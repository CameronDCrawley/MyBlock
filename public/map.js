const eventMarkers = {}

let mapRef

function focusEvent(id){
  const mark = eventMarkers[id]

  if(!mark) return
  mapRef.panTo(mark.marker.getPosition())
  mapRef.setZoom(15)
  mark.open()
  document.getElementById('map').scrollIntoView({behavior:'smooth'})

}

window.focusEvent = focusEvent





async function getMap(){
  const map =new google.maps.Map(document.getElementById('map'),{
center: { lat:40.7282, lng: -73.7949},//Queens location
zoom:12,
mapTypeControl:false,
streetViewControl:false,


  })
  mapRef = map
  const info = new google.maps.InfoWindow()

  try{
    const res = await fetch('/api/places')
    const places = await res.json()

    const color = {food: 'orange' , library: 'blue' , shelter: 'pink', youth:'red', community:'black',culture:'yellow',garden: 'green',other: 'purple'}

    places.forEach(p => {
      const marker = new google.maps.Marker( {
        position:{lat:p.lat, lng:p.lng},
        map,
        title:p.name,
        icon: {
          fillColor:color[p.type]||color.other,
          scale:6, //size
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
    //Zoom to Zip
    const zip = new URLSearchParams(window.location.search).get('zip')
    if(zip){
      const inZip = places.filter(p=> p.zip == zip)
      if (inZip.length === 1){
        map.setCenter({lat:inZip[0].lat, lng:inZip[0].lng})
        map.setZoom(15)
      }else if(inZip.length > 1){
        const bounds = new google.maps.LatLngBounds()
        inZip.forEach(p => bounds.extend ({lat:p.lat, lng: p.lng}))
        map.fitBounds(bounds)
      }
    }
    const evPins = await fetch('/api/events')
    const events = await evPins.json()
    events.forEach(ev => {
      const mark = new google.maps.Marker({
      position:{ lat:Number(ev.lat), lng: Number(ev.lng)},map,
      title:ev.title,
      zIndex:999,
      icon:{
        path:google.maps.SymbolPath.CIRCLE,
        scale:5,
        fillColor: '#e11d48',
        fillOpacity:1,
        strokeColor: "#facc15",
        strokeWeight:2,


      }

      })
       const open = () => {
          const box = document.createElement('div')
          const title = document.createElement('strong')
          title.textContent = ev.title
          const when = document.createElement('div')
          when.textContent= new Date(ev.date).toDateString() + (ev.startTime ? ` . ${ev.startTime}` : '')
          const where = document.createElement('div')
          where.textContent = ev.placeName
          const spots = document.createElement('div')
          spots.textContent = `${ev.spotsLeft} spots left`
          box.append(title,when,where,spots)
          info.setContent(box)
          info.open(map,mark)
       }
       mark.addListener('click',open)
       eventMarkers[ev.id] = {marker: mark, open}
    })

  } catch(err){
    console.log('Couldnt load',err)
  }
}

window.getMap = getMap