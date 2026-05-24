import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './main/header/header.component';
import { CustomToastComponent } from './shared/custom-toast/custom-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CustomToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'THERAPI';
}
