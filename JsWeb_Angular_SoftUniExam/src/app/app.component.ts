import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavigationComponent } from '../../src/app/shared/navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, FooterComponent, CommonModule], // Include CommonModule here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JsWeb_Angular_SoftUniExam';
  showFooter: boolean = true; // Control footer visibility

  constructor(private router: Router) {
    // Subscribe to router events and filter for NavigationEnd
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd) // filter for NavigationEnd events
    ).subscribe((event) => {
      // TypeScript now knows 'event' is of type NavigationEnd
      const navigationEndEvent = event as NavigationEnd;

      // Conditionally set the showFooter flag based on the route
      // Hide footer on login and register pages
      if (navigationEndEvent.urlAfterRedirects.includes('login') || navigationEndEvent.urlAfterRedirects.includes('register')) {
        this.showFooter = false;
      } else {
        this.showFooter = true;
      }

      console.log('Navigation ended:', navigationEndEvent.urlAfterRedirects);
    });
  }
}
