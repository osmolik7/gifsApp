import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';


const loadFromLocalStorage = () => {
    const gifsFromLocalStorage = localStorage.getItem('gifs') ?? '{}';
    const gifs = JSON.parse(gifsFromLocalStorage);
    return gifs;
}

@Injectable({providedIn: 'root'})
export class GifService {
    private http = inject(HttpClient);

    trendingGifs = signal<Gif[]>([]);
    trendingGifsLoading = signal(true);

    searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    constructor(){
        this.loadTrendigGifs();
    }

    saveGifsToLocalStorage = effect(() => {
        const historyString = JSON.stringify(this.searchHistory());
        localStorage.setItem('gifs', historyString);
    });


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

    searchGifs(query: string): Observable<Gif[]>{
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

    getHistoryGifs(query:string):Gif[]{
        return this.searchHistory()[query] ?? [];
    }
}