import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import {
  StlModelViewerComponent,
  RotateDirection,
  ZoomDirection,
  StlSnapshotService,
} from '../../../angular-stl-model-viewer/src/public-api';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Examples';
  private peterUp = true;
  upModels = ['./assets/peter.stl'];
  downModels: (string | ArrayBuffer)[] = ['./assets/strap.stl'];
  @ViewChildren(StlModelViewerComponent)
  viewers: QueryList<StlModelViewerComponent>;

  switchPosition() {
    this.peterUp = !this.peterUp;
    this.upModels = [
      this.peterUp ? './assets/peter.stl' : './assets/strap.stl',
    ];
    this.downModels = [
      this.peterUp ? './assets/strap.stl' : './assets/peter.stl',
    ];
  }
  rotate(direction: RotateDirection) {
    for (const viewer of this.viewers) {
      viewer.rotate(direction, 2);
    }
  }
  zoom(direction: ZoomDirection) {
    for (const viewer of this.viewers) {
      viewer.zoom(direction, 5);
    }
  }

  dropFile(event: DragEvent) {
    console.debug(event);
    console.debug(typeof event);
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      Promise.all(
        Array.from(event.dataTransfer.files).map(async (file, idx) => {
          const snapshot = new StlSnapshotService(file, 5);
          const arrayBuffer = await snapshot.read();
          this.downModels = [...this.downModels, arrayBuffer];
          return snapshot.snapshot((data) => {
            const link = document.createElement('a');
            link.setAttribute('download', '' + idx + file.name + '.png');
            link.setAttribute('href', 'data:image/octet-stream;base64,' + data);
            document.body.appendChild(link);
            link.click();
          });
        })
      ).then((results) => {
        event.target['innerHTML'] = results
          .map((result) =>
            result.images.map(
              (img) =>
                `<img src='${img}' width="${result.sideLength}px" height="${result.sideLength}px"/>`
            )
          )
          .reduce((acc, v) => acc.concat(v), []);
      });
    }
  }
}
