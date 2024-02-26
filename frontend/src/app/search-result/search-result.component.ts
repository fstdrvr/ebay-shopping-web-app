import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductSearchService } from '../product-search.service';
import { DetailSearchService } from '../detail-search.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy{
  searchResults:any = [];
  searchListener$:Subscription;
  wishlist:any = [];
  p: number = 1;
  last_itemId: string = '';
  detailButtonDisabled: boolean = true;

  constructor(
    private http: HttpClient,
    private ProductSearchService: ProductSearchService,
    private DetailSearchService: DetailSearchService
    ) {
      this.searchListener$=this.ProductSearchService.searchResults$.subscribe((data) => {
        this.searchResults = data;
        console.log(this.searchResults);
        let alert = document.getElementById('alert') as HTMLElement;
        if (this.searchResults === 0) {
          alert.hidden = false;
        } else {
          alert.hidden = true;
        }
      });
    }

  ngOnInit(): void {
    this.ProductSearchService.loadTable();
    this.fetchWishlist();
  }

  ngOnDestroy(): void {
    this.searchListener$.unsubscribe();
  }

  truncateTitle(title: string) {
    const limit = 45;
    if (title.length > limit) {
      const lastIndex = title.lastIndexOf(' ', limit);
      if (lastIndex === -1) {
        return `${title.substring(0, limit)}...`;
      }
      return `${title.substring(0, lastIndex)}...`;
    }
    return title;
   }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  async fetchWishlist() {
    let response$ = this.http.get('https://kinetic-hydra-176707.wl.r.appspot.com/wishlist-fetech');
    this.wishlist = await lastValueFrom(response$);
    console.log(this.wishlist);
  }

  async addToWishlist(product: any) {
    this.wishlist.push(product);
    let response$ = this.http.post('https://kinetic-hydra-176707.wl.r.appspot.com/wishlist-operate', {'product': product, 'action': "add"});
    let result = await lastValueFrom(response$);
    console.log(result, this.wishlist);
  }

  async removeFromWishlist(product: any) {
    this.wishlist = this.wishlist.filter((item: any) => item.itemId[0] != product.itemId);
    let response$ = this.http.post('https://kinetic-hydra-176707.wl.r.appspot.com/wishlist-operate', {'product': product, 'action': "remove"});
    let result = await lastValueFrom(response$);
    console.log(result, this.wishlist);
  }

  isOnWishlist(product: any): boolean {
    return this.wishlist.find((item: any) => item.itemId[0] == product.itemId) !== undefined;
  }

  toggleWishlist(product: any) {
    if (this.isOnWishlist(product)){
      this.removeFromWishlist(product);
    } else {
      this.addToWishlist(product);
    }
  }

  showDetail(itemId: string){
    this.fetchWishlist();
    this.last_itemId = itemId;
    this.detailButtonDisabled = false;
    this.DetailSearchService.getDetail(itemId);
  }

}
