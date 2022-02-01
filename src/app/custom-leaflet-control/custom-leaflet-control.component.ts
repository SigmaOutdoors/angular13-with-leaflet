
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

  position: L.ControlPosition = 'bottomleft' ;
  @Input() mapCollection;
  @Input() customOverlayOrder;

  
  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) { 
    
  }

  ngOnInit() {

    //console.log(this.mm)
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
   * So we need to go thorough the mapCollection WHICH defines the order of the layers (z-index)
   * and look to the display order for whether it is checked.  This allows us to keep our
   * order with the underlying mapCollection, but give the appearance the way our users may want
   * to see the order.
   */
  public onCheckboxChanged(ee)
  {
    this.dumpMapCollectionAndRemoveLayers();
   
    for (let [key, value] of this.mapCollection) {
      let layerFound = this.customOverlayOrder.find(item => item.title == key);  // we can use find, will only be one match
  
      if (layerFound.checked ) {  
          console.log (layerFound.title + ":" + layerFound.checked )
          this._map.addLayer(this.mapCollection.get(layerFound.title))  
        
      }
    } 
  }



get getChecked() {
  return this.customOverlayOrder.filter(item => item.checked);
}

  /**
   * Remove layers by default 
   */
   public dumpMapCollectionAndRemoveLayers(removeLayers = true) {

    for (let [key, value] of this.mapCollection) {
      //console.log(key);
     // console.log(value)
      if (removeLayers)
          this.map.removeLayer(value);
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