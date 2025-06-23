import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./gifs/pages/dashboard/dashboard.component'),
        children: [
            {
                path: 'trending',
                loadComponent: () => import('./gifs/pages/trending/trending.component')
            },
            {
                path: 'search',
                loadComponent: () => import('./gifs/pages/search/search.component')
            },
            {
                path: 'history/:query',
                loadComponent: () => import('./gifs/pages/gif-history/gif-history.component')
            },
            {
                path: '**',
                redirectTo: 'trending'           
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
