import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DetailSearchService } from '../detail-search.service';
@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css']
})
export class WishListComponent implements OnInit{ 
  wishlist:any = [];
  totalPrice = 0;
  detailButtonDisabled: boolean = true;

  constructor(private http: HttpClient,
    private DetailSearchService : DetailSearchService) {
      this.fetchWishlist();
      console.log(this.wishlist);
    }
  
  ngOnInit(): void {
    this.fetchWishlist();
    console.log(this.wishlist);
    let alert = document.getElementById('alert') as HTMLElement;
    if (this.wishlist.length === 0) {
      alert.hidden = false;
    } else {
      alert.hidden = true;
    }
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  async fetchWishlist() {
    let response$ = this.http.get('https://kinetic-hydra-176707.wl.r.appspot.com/wishlist-fetech');
    this.wishlist = await lastValueFrom(response$);
    this.calculatePrice();
    console.log(this.wishlist);
  }

  async removeFromWishlist(product: any) {
    this.wishlist = this.wishlist.filter((item: any) => item.itemId[0] != product.itemId);
    this.calculatePrice()
    let response$ = this.http.post('https://kinetic-hydra-176707.wl.r.appspot.com/wishlist-operate', {'product': product, 'action': "remove"});
    let result = await lastValueFrom(response$);
    console.log(result, this.wishlist);
  }

  showDetail(itemId: string){
    this.detailButtonDisabled = false;
    this.DetailSearchService.getDetail(itemId);
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

  calculatePrice() {
    this.totalPrice = this.wishlist.reduce((total:any, product:any) => {
      var selling_price = Number(product.sellingStatus[0].currentPrice[0].__value__);
      var shipping_price = Number(product.shippingInfo[0].shippingServiceCost[0].__value__);
      return total + shipping_price + selling_price;
    }, 0);
  }
}
