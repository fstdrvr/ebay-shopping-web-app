import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http'
import { lastValueFrom, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {

  constructor(private http: HttpClient) { }
  private searchResult: any;
  private searchResults = new Subject();
  public searchResults$ = this.searchResults.asObservable();
  private showTable = new Subject();
  public showTable$ = this.showTable.asObservable();
  private showDetail = new Subject();
  public showDetail$ = this.showDetail.asObservable()

  getLocation() {
    const ipInfo = 'https://ipinfo.io/json?token=b28b348d4ab917';
    return this.http.get(ipInfo);
  }

  getAutocomplete(zipInput: any) {
    let params = new HttpParams().set('zipInput', zipInput);
    return this.http.get("https://kinetic-hydra-176707.wl.r.appspot.com/autocomplete", {params: params}); 
  }

  async getSearchresult(keyword: string, category: string, condition: string[], shipping: string[], distance: number, zip: string) {
    let categoryId = 0;
    if (category == "Art") {
      categoryId = 550;
    } else if (category == "Baby") {
      categoryId = 2984;
    } else if (category == "Books") {
      categoryId = 267;
    } else if (category == "Clothing, Shoes & Accessories") {
      categoryId = 11450;
    } else if (category == "Computers/Tablets & Networking") {
      categoryId = 58058;
    } else if (category == "Health & Beauty") {
      categoryId = 26395;
    } else if (category == "Music") {
      categoryId = 11233;
    } else if (category == "Video Games & Consoles") {
      categoryId = 1249;
    }
    let params = new HttpParams()
    .set('keywords', keyword)
    .set('categoryId', categoryId)
    .set('condition', condition.join(','))
    .set('shipping', shipping.join(','))
    .set('distance', distance)
    .set('zip', zip)
    const response:any = await lastValueFrom(this.http.get("https://kinetic-hydra-176707.wl.r.appspot.com/finditems", {params: params}));
    this.searchResult = response['findItemsAdvancedResponse'][0].searchResult[0].item || 0;
    this.searchResults.next(this.searchResult);
    this.showTable.next('table');
  }

  loadTable() {
    this.searchResults.next(this.searchResult);
  }

  jumpToDetails() {
    this.showDetail.next('detail');
  }

  clearTable(){
    this.searchResult = [];
    this.searchResults.next(this.searchResult);
  }
}