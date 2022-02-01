# angular13+-leaflet-uswlvk

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/angular12-leaflet-uswlvk)


## OLD First cut code at the custom control
<button (click)="cc()">cc</button>

public custom: L.Control;

/**
 * Custom control, some ideas taken from 
 * https://stackblitz.com/edit/angular-leaflet-custom?file=src%2Fapp%2Fcustom-control%2Fcustom-control.component.ts
 */
public cc() 
{

let customCtrl = L.Control.extend({
  onAdd(map: L.Map) {
    var img = L.DomUtil.create('img');
    console.log ("in onAdd")
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg';
    img.style.width = '200px';

    return img;
  },
  onRemove(map: L.Map) {},

});
this.custom=new customCtrl({
    position: this.position
  }).addTo(this.map);

// as a sep function : this.map.on('click', this.onClick, this);
this.map.on('click', (e:L.LeafletMouseEvent) => {
  alert('Clicked at '+ e.latlng);
  //debugger;

  console.log(e);
});


}


THIS IS FALSE, just saving code
/**
 * In order for this to work we need to REMOVE the built in layers control 
 * once the default layer is added to the map the order is forever "written" since we are
 * using the same Map Collection for our layers , so if the default control exists "that order will prevail"
 * If we disable the default control, the WE control the order or appearance AND z-index
 */
public initLayers() {
  // REMEMBER THE LAST LAYER DOWN IS TOP-MOST LAYER!
  let cablesOnTop = false;

  if (cablesOnTop) {

    this._map.addLayer(this.mapCollection.get('topoOverlayMap'))
    this._map.removeLayer(this.mapCollection.get('topoOverlayMap'))

    this._map.addLayer(this.mapCollection.get('Cables'))  
    this._map.removeLayer(this.mapCollection.get('Cables')) 

  }
  else {
    this._map.addLayer(this.mapCollection.get('Cables'))  
    this._map.removeLayer(this.mapCollection.get('Cables')) 
    
    this._map.addLayer(this.mapCollection.get('topoOverlayMap'))
    this._map.removeLayer(this.mapCollection.get('topoOverlayMap'))
  }

}