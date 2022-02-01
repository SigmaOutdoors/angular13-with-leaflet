import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';



import { environment } from '../environments/environment';

/**
 * DESC:
 * The initial reason I wrote this code it to figure out how to present WMS layers (not overlay image layers)
 * on a leaflet map and have the ORDERS of those layers (z-index if you will) be different from the presented
 * order in the GUI.  ASAIK, the order they appear (z-index) is the order they get created in with the 
 * LAST being the TOPMOST layer. So maybe you want something more imporant in ORDER being
 * HIGHER on the presentation list?  How does that happen?  Well this project was an 
 * experiment in that. 
 * 
 * MISC: 
 * Took out the code to get your location and hard-coded a lat/long
 * Made the fly to marker code independent of load so map isn't constantly
 * flying to a location as you type in stackblitz
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  map: L.Map;

  lat = 26.3398;
  lng = -81.7787;
  center = L.latLng(this.lat, this.lng); // [this.lat, this.lng];
  message = "";
  overlayCollection = [];
  overlayMaps : L.Control.LayersObject ;
  overlayMapsAlternateOrder : L.Control.LayersObject ;
  mapCollection = new Map();
  baseMaps;
  layerControl;
  position: L.ControlPosition = "bottomleft" ;

  constructor() {}

  public ngAfterViewInit(): void {
    this.loadMap();
  }

  /**
   * Not used ATM, but kept for informational purposes.
   */
  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

  /**
   * Fly to a marker on the map
   */
  public flyToMarker() {
    this.map.flyTo(this.center, 13);

    const icon = L.icon({
      iconUrl:
        'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-icon.png',
      shadowUrl:
        'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
      popupAnchor: [13, 0],
    });

    const marker = L.marker(this.center, { icon }).bindPopup('Sunny Bonita Springs');
    marker.addTo(this.map);
  
  }

  private loadMap(): void {
    this.map = L.map('map').setView(this.center, 4);

    var mbAttr =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + environment.mapbox.accessToken;

    var streetsBaseMap = L.tileLayer(
      mbUrl,
      {
        attribution: mbAttr,
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: environment.mapbox.accessToken,
      }
    ).addTo(this.map);



    var littleton = L.marker([39.61, -105.02]).bindPopup(
        'This is Littleton, CO.'
      ),
      denver = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
      aurora = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
      bonita = L.marker(this.center).bindPopup('This is Bonita Springs, Fl.');

    var grayScaleBaseMap = L.tileLayer(mbUrl, {
      id: 'mapbox/light-v9',
      tileSize: 512,
      zoomOffset: -1,
      attribution: mbAttr,
    });

    this.mapCollection.set('cities', L.layerGroup([littleton, denver, aurora, bonita]));

    this.baseMaps = {
      Grayscale: grayScaleBaseMap,
      Streets: streetsBaseMap,
    };

    this.mapCollection.set(
      'topoOverlayMap',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
        transparent: true,
        opacity : 1,
       // format: 'image/png',
      })
    );

    this.mapCollection.set(
      'topoOverlayMappt4',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
        transparent: true,
        opacity : .4,
        format: 'image/png',
      })
    );

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


    this.mapCollection.set(
      'Cables',
      L.tileLayer.wms(
        'https://coverwatch.gsalacia.net:5501/geoserver/wms',
        {
          layers: 'vector_workspace:fiber_optic_cables',
          opacity: 1,
          transparent: true, // transparent and format of PNG HAND in HAND defaults to JPG so if you don't have this radar will cover basemap with white in the non radar sections! (try it by commenting out transparent or format of PNG).
          format: 'image/png',
        }
      )
    );



    //https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer

    this.overlayMaps = {
      Cities: this.mapCollection.get('cities'),
      'Cables First': this.mapCollection.get('Cables'),
      'Topo (Opacity 1)': this.mapCollection.get('topoOverlayMap'),
      'Topo (Opacity .4)': this.mapCollection.get('topoOverlayMappt4'),
      NOAA1: this.mapCollection.get('NOAA1'),
      
    };

    this.overlayMapsAlternateOrder = {
      Cities: this.mapCollection.get('cities'),     
      'Topo (Opacity 1)': this.mapCollection.get('topoOverlayMap'),
      'Topo (Opacity.4)': this.mapCollection.get('topoOverlayMappt4'),
      'Cables 2nd': this.mapCollection.get('Cables'),
      NOAA1: this.mapCollection.get('NOAA1')
      
    };

     // You could do base and layer separate
     // L.control.layers(this.baseMaps, null).addTo(this.map);
     // this.layerControl = L.control.layers(null, this.overlayMaps).addTo(this.map);
     // Or add them both to same control 


     /**
      * You want to disable this control to effectively use the Custom Control.
      */

     let enableStandardLayerGroupControl = false;
     if (enableStandardLayerGroupControl) {
        this.message = "With the default layer control enabled, the custom layer control will not work as expected, to demo custom control properly, disable the default control in code."
        this.layerControl = L.control.layers(this.baseMaps, this.overlayMaps).addTo(this.map);
     }

  
  }

  /**
   * The difference here is it is an overlay IMAGE, not a tiled overlay
   * It calls imageOverlay
   */
  public showOverlayImage() {
    let overlayImageURL =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg';

    let imageBounds = L.latLngBounds(this.center, L.latLng(-35.865, 154.2094));

    // don't keep adding it id they keep whacking the button
    if(this.isActiveLayer(this.mapCollection.get('overlay1')))
       return;

    this.mapCollection.set(
      'overlay1',
      L.imageOverlay(overlayImageURL, imageBounds, { opacity: 0.5 }).addTo(
        this.map
      )
    );
    L.imageOverlay(overlayImageURL, imageBounds).bringToFront();
  }

  public activeLayers() {
    this.map.eachLayer(ll => {
       console.log(ll);
    });
  }

  public isActiveLayer(layerValue) : boolean {
    let result = false;
    this.map.eachLayer(ll => {  
       if ( ll == layerValue)
        result=true;
    });
    return result;
  }

  private inMapCollection(vv) : boolean
  {
    for (let [key, value] of this.mapCollection) {
      if (vv == value) {
          console.log("In the mappcollection!");
          return true;
      }
    }
    return false;
  }

  /**
   * Remove layers by default 
   */
  public dumpMapCollectionAndRemoveLayers(removeLayers = true) {

    for (let [key, value] of this.mapCollection) {
      console.log(key);
      console.log(value)
      if (removeLayers)
          this.map.removeLayer(value);
    }
  }


  /**
   * This just swaps out the orginal control for my #2 control with a different order.
   */
  public newLayerControl()
  {

   this.map.removeControl(this.layerControl);
   this.dumpMapCollectionAndRemoveLayers(true);
   this.layerControl = L.control.layers(this.baseMaps, this.overlayMapsAlternateOrder).addTo(this.map);
   
  }




}
