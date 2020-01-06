import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private REST_API_SERVER = 'http://localhost:3000/products';
  public first: '';
  public prev: '';
  public next: '';
  public last: '';

  constructor(private httpClient: HttpClient) { }

  parseLinkHeader(header) {
    if (header.length === 0) {
      return;
    }

    const parts = header.split(',');
    const links = {};
    parts.forEach(p => {
      const section = p.split(';');
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });

    this.first = links['first'];
    this.last = links['last'];
    this.prev = links['prev'];
    this.next = links['next'];
  }

  public sendGetRequest() {
    // Add safe, URL encoded_page and _limit parameter
    // const options = { params: new HttpParams({fromString: '_page=1&_limit=20'}), observe: 'response' };
    return this.httpClient.get<Product[]>(this.REST_API_SERVER,
      { params: new HttpParams({fromString: '_page=1&_limit=20'}), observe: 'response' })
      .pipe(retry(3), catchError(this.handleError), tap(res => {
      // console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  public sendGetRequestToUrl(url: string) {
    return this.httpClient.get<Product[]>(url, {observe: 'response'}).pipe(retry(3), catchError(this.handleError), tap(res => {
            // console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
