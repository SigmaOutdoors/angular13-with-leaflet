import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';

import { environment } from '../environments/environment';
import { HelperService } from './helper.service';

/**
 * DESC:
 * The initial reason I wrote this code it to figure out how to present WMS layers (not overlay image layers)
 * on a leaflet map and have the ORDERS of those layers (z-index if you will) be different from the presented
 * order in the GUI.  ASAIK, the order they appear (z-index) is the order they get created in with the
 * LAST being the TOPMOST layer. So maybe you want something more imporant in ORDER being
 * HIGHER on the presentation list?  How does that happen?  Well this project was an
 * experiment in that.
 *
 * UPDATE!!!
 * I ended up finding in discovery (mostly after the fact) that PANES can be used to achieve this.
 * I am leaving this project HERE with the custom control
 *
 *
 * MISC:
 * Took out the code to get your location and hard-coded a lat/long
 * Made the fly to marker code independent of load so map isn't constantly
 * flying to a location as you type in stackblitz
 */

let data1 = [
  { latitude: 37.788022, longitude: -122.399797 },
  { latitude: 40.748817, longitude: -73.985428 },
  { latitude: 34.052235, longitude: -118.243683 },
];

let data = [
  { latitude: 40.73061, longitude: -73.935242 },
  { latitude: 41.878114, longitude: -87.629799 },
  { latitude: 39.952583, longitude: -75.165222 },
  { latitude: 42.331429, longitude: -83.045753 },
  { latitude: 43.038902, longitude: -87.906474 },
  { latitude: 35.227087, longitude: -80.843127 },
  { latitude: 30.438256, longitude: -84.280733 },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  map: L.Map;

  public isLeftVisible = true;
  public leftWidth = '200px';
  public btnText = 'Close';

  public toggleLeft() {
    this.isLeftVisible = !this.isLeftVisible;
    if (this.isLeftVisible) {
      this.btnText = 'Close';
    } else this.btnText = 'Open';
    this.leftWidth = this.isLeftVisible ? '200px' : '0';
  }

  /**
   *
   * To see the custom leaflet control, set this to false
   *
   */
  enableStandardLayerGroupControl = true;

  lat = 26.3398;
  lng = -81.7787;
  center = L.latLng(this.lat, this.lng); // [this.lat, this.lng];
  message = '';
  overlayCollection = [];
  builtInLayerGroupControlOrder: L.Control.LayersObject;
  builtInLayerGroupControlOrderAlt: L.Control.LayersObject;
  customOverlayOrder = [];
  mapCollection; //  = new Map();
  baseMaps;
  layerControl;
  streetsBaseMap;
  position: L.ControlPosition = 'bottomleft';

  mbUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  mbAttr =
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
  mbUrl2 =
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' +
    environment.mapbox.accessToken;

  constructor(private helperService: HelperService) {}

  private drawLinesAndPointsAsFeatureGroup() {
    var destinationHTML = document.getElementById('destinations-body');

    var fg = L.featureGroup().addTo(this.map);
    var destinations = [];

    var line = L.polyline([]).addTo(this.map);
    for (var row in data) {
      var marker = L.marker([data[row].latitude, data[row].longitude]).addTo(
        fg
      );
      line.addLatLng(marker.getLatLng());
    }
  }


  public divAsLayer(bindToPane, divText, mapCollectionName) {
    // Create a LayerGroup
    var layerGroup = L.layerGroup();
  

    // Create a custom div with "Hello, World!" text
    var customPopup = L.popup({
      pane: bindToPane, // Assign the popup to the 'TOPMOST1' pane
      closeButton: false // Optionally hide the close button
    }).setContent(`<div>${divText}</div>`);
  
    // Add the custom popup to the LayerGroup
    layerGroup.addLayer(customPopup);
  
 
  
    // Calculate the fixed position for the popup
    var mapContainer = this.map.getContainer();
    var customPopupLocation = L.point(10, mapContainer.clientHeight - 10);
  
    // Bind the popup to the map container at the specified pixel position
    customPopup.setLatLng(this.map.containerPointToLatLng(customPopupLocation));
  
    // Add the LayerGroup to the map
    this.mapCollection.set(mapCollectionName, layerGroup);
  }

  //     this.mapCollection.set(
  // 'cities',
  //  L.layerGroup([littleton, bloomfield, aurora, bonita], {
  //    pane: 'TOPMOST1',
  //  })
  //);
  private drawLinesAndPointsAsLayerGroup() {
    var lineLayerGroup = L.layerGroup(); // .addTo(this.map);
    var destinations = [];

    var line = L.polyline([], {
      color: 'green',
      weight: 2,
      smoothFactor: 1,
    }).addTo(lineLayerGroup);

    var line2 = L.polyline([], {
      color: 'red',
      weight: 2,
      smoothFactor: 1,
    });

    for (var row in data) {
      var marker = L.marker([data[row].latitude, data[row].longitude], {
        pane: 'TOPMOST1',
      }).addTo(lineLayerGroup);
      line.addLatLng(marker.getLatLng());
    }

    line2.addLatLng([30.438256, -84.280733]);
    line2.addLatLng([40.73061, -73.935242]);

    line2.addTo(lineLayerGroup);

    this.mapCollection.set('MarkersWithLines', lineLayerGroup);
  }

  public ngAfterViewInit(): void {
    // Go get the collection data (the real order of the layers from serivce)
    this.helperService.getMapData().subscribe((r) => {
      this.mapCollection = r;
    });

    this.createCustomLayerOrder();
    this.loadMap();
    // this.drawLinesAndPointsAsFeatureGroup();

    setTimeout(() => {}, 3000);
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

    const marker = L.marker(this.center, { icon }).bindPopup(
      'Sunny Bonita Springs'
    );
    marker.addTo(this.map);
  }

  private loadMap(): void {
    this.map = L.map('map').setView(this.center, 4);

    // UPDATE, I ended up finding out assigning panes to thw WMS layers
    // with approriate z-Index will do the ordering you want on the default
    // control without having to force them into a particular order on the default
    // Group Layer control.

    // One thing I did find is that leaflet has other z-Index values for internal stuff
    // so you want to start your PANE z-Indexes quite high > 1500 or so.

    this.map.createPane('LOWEST');
    this.map.getPane('LOWEST').style.zIndex = '2000';

    // https://leafletjs.com/examples/map-panes/

    this.map.createPane('MIDDLE1');
    this.map.getPane('MIDDLE1').style.zIndex = '3100';

    this.map.createPane('MIDDLE2');
    this.map.getPane('MIDDLE2').style.zIndex = '3200';

    this.map.createPane('MIDDLE3');
    this.map.getPane('MIDDLE3').style.zIndex = '3300';


    this.map.createPane('TOPMOST');
    this.map.getPane('TOPMOST').style.zIndex = '9000';

    this.map.createPane('TOPMOST2');
    this.map.getPane('TOPMOST2').style.zIndex = '9300';

    this.map.createPane('TOPMOST1');
    this.map.getPane('TOPMOST1').style.zIndex = '9500';

    this.streetsBaseMap = L.tileLayer(this.mbUrl, {
      attribution: this.mbAttr,
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: environment.mapbox.accessToken,
    }).addTo(this.map);

    /**
     * You want to disable the DEFAULT LAYER GROUP control to effectively use the Custom Control.
     */

    if (this.enableStandardLayerGroupControl) {
      this.message =
        'With the default layer control enabled, the custom layer control will not work as expected, to demo custom control properly, disable the default control in code.';
      this.createDefaultLayerControl();
    }
  }

  public createCustomLayerOrder() {
    this.customOverlayOrder = [
      {
        title: 'Cables',
        checked: false,
      },
      {
        title: 'NOAA1',
        checked: false,
      },
      {
        title: 'Topo (Opacity 1)',
        checked: false,
      },
      {
        title: 'Topo (Opacity .4)',
        checked: false,
      },
    ];
  }

  public createDefaultLayerControl() {
    // 42.8973° N, 77.4214° W
    var littleton = L.marker([39.61, -105.02]).bindPopup(
        'This is Littleton, CO.'
      ),
      bloomfield = L.marker([42.8973, -77.4214], {
        pane: 'TOPMOST1',
      }).bindPopup('This is Denver, CO.'),
      aurora = L.marker([39.73, -104.8], { pane: 'TOPMOST1' }).bindPopup(
        'This is Aurora, CO.'
      ),
      bonita = L.marker(this.center, { pane: 'TOPMOST1' }).bindPopup(
        'This is Bonita Springs, Fl.'
      );

    var grayScaleBaseMap = L.tileLayer(this.mbUrl, {
      id: 'mapbox/light-v9',
      tileSize: 512,
      zoomOffset: -1,
      attribution: this.mbAttr,
    });

    // !!!! DOESN'T SEEM TO WORK FOR cities even with pane option, gets covered by TOPO (Opacity 1)
    // In order for this to work you need to do it at the MARKER level (see code above)
    // This pane option is DOING NOTING
    this.mapCollection.set(
      'cities',
      L.layerGroup([littleton, bloomfield, aurora, bonita], {
        pane: 'TOPMOST1',
      })
    );

    this.drawLinesAndPointsAsLayerGroup();
    this.divAsLayer('TOPMOST',"Hello World I am on TOP",'PopUp');
    this.divAsLayer('MIDDLE1',"I am another popup with a lower pane order",'PopUp2');

    this.baseMaps = {
      Grayscale: grayScaleBaseMap,
      Streets: this.streetsBaseMap,
    };

    //https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer

    // In this case Topo (Opacity 1) will completely cover NOAA1
    this.builtInLayerGroupControlOrder = {
      PopUp : this.mapCollection.get('PopUp'),
      PopUp2 : this.mapCollection.get('PopUp2'),
      Cities: this.mapCollection.get('cities'),
      'Cables First': this.mapCollection.get('Cables'),
      NOAA1: this.mapCollection.get('NOAA1'),
      'Topo (Opacity 1)': this.mapCollection.get('Topo (Opacity 1)'),
      'Topo (Opacity .4)': this.mapCollection.get('Topo (Opacity .4)'),
      MarkersWithLines: this.mapCollection.get('MarkersWithLines'),
     
      
    };

    // an alternate order to test with and show what happens
    // In this case Topo (Opacity 1) will be "under" NOAA1
    this.builtInLayerGroupControlOrderAlt = {
      Cities: this.mapCollection.get('cities'),
      'Topo (Opacity 1)': this.mapCollection.get('Topo (Opacity 1)'),
      'Topo (Opacity.4)': this.mapCollection.get('Topo (Opacity .4)'),
      'Cables 2nd': this.mapCollection.get('Cables'),
      NOAA1: this.mapCollection.get('NOAA1'),
      MarkersWithLines: this.mapCollection.get('MarkersWithLines'),
    };

    // You could do base and layer separate
    // L.control.layers(this.baseMaps, null).addTo(this.map);
    // this.layerControl = L.control.layers(null, this.overlayMaps).addTo(this.map);
    // Or add them both to same control

    this.layerControl = L.control
      .layers(this.baseMaps, this.builtInLayerGroupControlOrder)
      .addTo(this.map);
  }

  /**
   * The difference here is it is an overlay IMAGE, not a tiled overlay (wms)
   * It calls imageOverlay
   */
  public showOverlayImage() {
    let overlayImageURL =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg';

    let imageBounds = L.latLngBounds(this.center, L.latLng(-35.865, 154.2094));

    // don't keep adding it id they keep whacking the button
    if (this.isActiveLayer(this.mapCollection.get('overlay1'))) return;

    this.mapCollection.set(
      'overlay1',
      L.imageOverlay(overlayImageURL, imageBounds, { opacity: 0.5 }).addTo(
        this.map
      )
    );
    L.imageOverlay(overlayImageURL, imageBounds).bringToFront();
  }

  public activeLayers() {
    this.map.eachLayer((ll) => {
      console.log(ll);
    });
  }

  public isActiveLayer(layerValue): boolean {
    let result = false;
    this.map.eachLayer((ll) => {
      if (ll == layerValue) result = true;
    });
    return result;
  }

  private inMapCollection(vv): boolean {
    for (let [key, value] of this.mapCollection) {
      if (vv == value) {
        console.log('In the mappcollection!');
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
      console.log(value);
      if (removeLayers) this.map.removeLayer(value);
    }
  }

  /**
   * This just swaps out the orginal control for my #2 control with a different order.
   */
  public newLayerControl() {
    this.map.removeControl(this.layerControl);
    this.dumpMapCollectionAndRemoveLayers(true);
    this.layerControl = L.control
      .layers(this.baseMaps, this.builtInLayerGroupControlOrderAlt)
      .addTo(this.map);
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
}
