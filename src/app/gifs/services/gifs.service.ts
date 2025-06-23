import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GifService {
    private http = inject(HttpClient);

    trendingGifs = signal<Gif[]>([]);
    trendingGifsLoading = signal(true);

    searchHistory = signal<Record<string, Gif[]>>({});
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    constructor(){
        this.loadTrendigGifs();
    }

    loadTrendigGifs(){
        this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
            params: {
                api_key: environment.apiKey,
                limit: 20,
            }
        }).subscribe((resp) => {
            const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
            this.trendingGifsLoading.set(false);
            this.trendingGifs.set(gifs)
        });
    }

    searchGifs(query: string){
        return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.apiKey,
                q: query,
                limit: 20,
            }
        })
        .pipe(
            map(({data}) => data ),
            map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
            tap(items => {
                this.searchHistory.update(history => ({
                    ...history,
                    [query.toLowerCase()]: items,
                }))
            })
        );
    }
}