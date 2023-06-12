import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'quantum-mixer-frontend';

  reload() {
    window.location.reload();
  }

  requestFullscreen() {
    return document.documentElement.requestFullscreen()
  }
}
