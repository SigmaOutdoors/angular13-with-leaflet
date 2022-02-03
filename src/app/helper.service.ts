import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';


@Injectable()
export class HelperService {
 
  private mapCollection;
  public zmap;
  constructor() { }

  getMapData():Observable<Map<string,L.TileLayer>>
  {
    let data = new Observable<Map<string,L.TileLayer>>(observer => {

      /*** IF YOU MOVE NOAA HERE IN THE REAL ORDER Topo (Opacity 1) will completely cover it!!!

      

    this.mapCollection.set(
      'NOAA1',
      L.tileLayer.wms(
        ' https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer',
        {
          layers: '1',
          opacity: 1,
          transparent: true, // transparent and format of PNG HAND in HAND defaults to JPG so if you don't have this radar will cover basemap with white in the non radar sections! (try it by commenting out transparent or format of PNG).
          format: 'image/png',
        }
      )
    );

    */
    this.mapCollection = new Map();
    this.mapCollection.set(
      'Topo (Opacity 1)',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
        transparent: true,
        opacity : 1,
        pane : 'LOWEST'
       // format: 'image/png',
      })
    );

    this.mapCollection.set(
      'Topo (Opacity .4)',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
        transparent: true,
        opacity : .4,
        format: 'image/png',
        pane : 'MIDDLE1'
      })
    );

 // If this isn't AFTER Topo (Opacity 1), it will get covered by it.
 this.mapCollection.set(
      'NOAA1',
      L.tileLayer.wms(
        ' https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer',
        {
          layers: '1',
          opacity: 1,
          transparent: true, // transparent and format of PNG HAND in HAND defaults to JPG so if you don't have this radar will cover basemap with white in the non radar sections! (try it by commenting out transparent or format of PNG).
          format: 'image/png',
          pane : 'MIDDLE2'
         }
      )
    );


    this.mapCollection.set(
      'Cables',
      L.tileLayer.wms(
        '',
        {
          layers: 'vector_workspace:fiber_optic_cables',
          opacity: 1,
          transparent: true, // transparent and format of PNG HAND in HAND defaults to JPG so if you don't have this radar will cover basemap with white in the non radar sections! (try it by commenting out transparent or format of PNG).
          format: 'image/png',
          pane : 'TOPMOST'
        }

      )
    );

     // this.zmap = Array.from(this.mapCollection.keys());
     observer.next(this.mapCollection);

    });
    return data;
  }



}