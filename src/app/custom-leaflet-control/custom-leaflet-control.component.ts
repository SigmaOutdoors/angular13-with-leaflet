
import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Map, Control, DomUtil, ControlPosition, LatLng, LeafletMouseEvent} from 'leaflet';

@Component({
  selector: 'app-custom-leaflet-control',
  templateUrl: './custom-leaflet-control.component.html',
  styleUrls: ['./custom-leaflet-control.component.css']
})
export class CustomLeafletControlComponent implements OnInit {

  private _map: Map;
  public custom: Control;

  @Input() position: ControlPosition = 'bottomleft' ;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) { 
  }

  ngOnInit() {
    
  }

  @Input() set map(map: Map){
    if (map){
      this._map = map;
      let customCtrl = Control.extend({
        onAdd(map: Map) {
          return DomUtil.get('custom');
        },
        onRemove(map: Map) {},
      
      });
      this.custom=new customCtrl({
          position: this.position
        }).addTo(this.map);
      
      // as a sep function : this.map.on('click', this.onClick, this);
      this.map.on('click', (e:LeafletMouseEvent) => {
        alert('Clicked at '+ e.latlng);
        //debugger;
      
        console.log(e);
      });
      
    }
  }
  get map(): Map {
    return this._map
  }

public myButton()
{
    alert("You clicked the button")
}

}