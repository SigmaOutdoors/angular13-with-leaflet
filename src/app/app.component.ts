import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
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
  center = [this.lat, this.lng];

  overlayCollection = [];

  mm = new Map();

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
    var streetsBaseMap = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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
      golden = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');

    var mbAttr =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    var mbUrl =
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayScaleBaseMap = L.tileLayer(mbUrl, {
      id: 'mapbox/light-v9',
      tileSize: 512,
      zoomOffset: -1,
      attribution: mbAttr,
    });

    this.mm.set('cities', L.layerGroup([littleton, denver, aurora, golden]));

    var baseMaps = {
      Grayscale: grayScaleBaseMap,
      Streets: streetsBaseMap,
    };

    this.mm.set(
      'topoOverlayMap',
      L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS',
      })
    );

    var overlayMaps = {
      Cities: this.mm.get('cities'),
      Topo: this.mm.get('topoOverlayMap'),
    };

    L.control.layers(baseMaps, overlayMaps).addTo(this.map);
  }

  public showOverlay() {
    var overlayImageURL =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg',
      imageBounds = [this.center, [-35.865, 154.2094]];
    //this.overlayCollection.push(      L.imageOverlay(imageUrl, imageBounds, {opacity: 0.5}).addTo(this.map)     );
    this.mm.set(
      'overlay1',
      L.imageOverlay(overlayImageURL, imageBounds, { opacity: 0.5 }).addTo(
        this.map
      )
    );
    L.imageOverlay(overlayImageURL, imageBounds).bringToFront();
  }

  public dump() {
    // for (const [key, value] of (<any>Object).entries(this.overlayCollection)) {
    //if (key.toUpperCase() == 'POSTGISLAYER') {
    // this.map.removeLayer(value);
    //this.removeMapLay(key);

    //   console.log(key)
    //    console.log(value)
    //}
    for (let [key, value] of this.mm) {
      console.log(key);
      //console.log(value)
      this.map.removeLayer(value);
    }

    // console.log(this.overlayCollection)
  }
}