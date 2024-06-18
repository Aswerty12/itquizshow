import { Component } from '@angular/core';
import { RouterOutlet , RouterModule, RouterLink} from '@angular/router';
import { HomeComponent } from './home/home.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HomeComponent,RouterLink],
  template: `<main>
    <nav>
      <a [routerLink]="['/']">
        <header class="brand-name">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true" />
        </header>
      </a>
      <a routerLink="/play"> Play!</a>
      <a routerLink="/host">  HOST!</a>
      <a routerLink="/about"> About</a>
      </nav>

    <section class = "content"> 
      <router-outlet> </router-outlet>
    </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ITQuizshow';
}
