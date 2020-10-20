import { Component, ViewChildren, QueryList } from '@angular/core';
import {
  StlModelViewerComponent,
  RotateDirection,
  ZoomDirection,
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
  downModels = ['./assets/strap.stl'];
  @ViewChildren(StlModelViewerComponent) viewers: QueryList<
    StlModelViewerComponent
  >;

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
}
