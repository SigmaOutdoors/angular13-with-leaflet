
import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-custom-leaflet-control',
  templateUrl: './custom-leaflet-control.component.html',
  styleUrls: ['./custom-leaflet-control.component.css']
})
export class CustomLeafletControlComponent implements OnInit {

  private _map: L.Map;
  public custom: L.Control;

  @Input() position: L.ControlPosition = 'bottomleft' ;
  @Input() mapCollection ;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) { 
  }

  ngOnInit() {
    
  }

  @Input() set map(map: L.Map){
    if (map){
      this._map = map;
      let customCtrl = L.Control.extend({
        onAdd(map: L.Map) {
          return L.DomUtil.get('custom');
        },
        onRemove(map: L.Map) {},
      
      });
      this.custom=new customCtrl({
          position: this.position
        }).addTo(this.map);
      
      // as a sep function : this.map.on('click', this.onClick, this);
      // Disabling Map click event for now
      if (false) 
      { 
      this.map.on('click', (e:L.LeafletMouseEvent) => {
        alert('Clicked at '+ e.latlng);
        //debugger;
      
        console.log(e);
      });
      }
   //   this.initLayers();
    }
  }

  get map(): L.Map {
    return this._map;
  }

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

public myButton(layerAsString)
{
  if (layerAsString == 'cables') {
   // alert("You want cables")
    this._map.addLayer(this.mapCollection.get('Cables'))
  }
  else {
    this._map.addLayer(this.mapCollection.get('topoOverlayMap'))
  }
}

}