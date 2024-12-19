import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CatalogComponent } from './catalog/catalog.component';
import { CreateComponent } from './movies/create/create.component';
import { DetailsComponent } from './movies/details/details.component'; // Import DetailsComponent
import { AuthGuard } from './core/guards/auth.guard';
import { EditComponent } from './movies/edit/edit.component';
import { TrendingComponent } from './movies/trending/trending.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    {
        path: 'movies',
        children: [
            { path: 'trending', component: TrendingComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'create', component: CreateComponent, canActivate: [AuthGuard] }, // Protected route
            { path: ':id', component: DetailsComponent, canActivate: [AuthGuard] }, // Protected route
            { path: ':id/edit', component: EditComponent, canActivate: [AuthGuard] }, // Add this route
            { path: '', redirectTo: 'catalog', pathMatch: 'full' }
        ]
    },
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
];