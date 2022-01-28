import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
import {
  bounds,
  LatLng,
  LatLngBoundsExpression,
  LatLngExpression,
  Layer,
  LeafletMouseEvent,
  Marker,
  TileErrorEvent,
  WMSOptions,
} from 'leaflet';
import { environment } from '../environments/environment';

/**
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
  map: any;

  lat = 26;
  lng = -81;
  center = L.latLng(this.lat, this.lng); // [this.lat, this.lng];
  
  overlayCollection = [];
  
  mapCollection = new Map();

  constructor() {}

  public ngAfterViewInit(): void {
    this.loadMap();
  }

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

  public showMarker() {
    this.map.flyTo(this.center, 13);

    const icon = L.icon({
      iconUrl:
        'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-icon.png',
      shadowUrl:
        'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
      popupAnchor: [13, 0],
    });

    const marker = L.marker(this.center, { icon }).bindPopup('Angular Leaflet');
    marker.addTo(this.map);
  }

  private loadMap(): void {
    this.map = L.map('map').setView([0, 0], 1);

    var mbAttr =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    var mbUrl =
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    //  var mbUrl =     'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    var streetsBaseMap = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
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

    var baseMaps = {
      Grayscale: grayScaleBaseMap,
      Streets: streetsBaseMap,
    };

    this.mapCollection.set(
      'topoOverlayMap',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
        transparent: true,
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

    //https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer

    var overlayMaps = {
      Cities: this.mapCollection.get('cities'),
      Topo: this.mapCollection.get('topoOverlayMap'),
      NOAA1: this.mapCollection.get('NOAA1'),
    };

     L.control.layers(baseMaps, overlayMaps).addTo(this.map);
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

  public dump(removeLayers = true) {

    for (let [key, value] of this.mapCollection) {
      console.log(key);
      console.log(value)
      if (removeLayers)
          this.map.removeLayer(value);
    }
  }
}
