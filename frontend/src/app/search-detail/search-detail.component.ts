import { Component, OnInit, OnDestroy } from '@angular/core';
import { DetailSearchService } from '../detail-search.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-detail',
  templateUrl: './search-detail.component.html',
  styleUrls: ['./search-detail.component.css']
})
export class SearchDetailComponent implements OnInit, OnDestroy{
  detailSubscription: Subscription;
  item: any;
  item_title = '';
  item_images = [];
  item_price = '';
  item_return_policy = '';
  item_location = '';
  item_specifics:any = [];
  searchImages = [];
  shipping_cost = '';
  shipping_location = '';
  handling_time = '';
  expedited_shipping = false;
  one_day_shipping = false;
  return_accepted = false;
  feedback_score = 0;
  popularity = 0;
  rating_star = '';
  top_rated = false;
  store_name = '';
  store_url = '';
  storeid = '';

  constructor(
    private http: HttpClient,
    private  detailSearchService: DetailSearchService) {
    this.detailSubscription = this.detailSearchService.searchDetails$.subscribe((data: any) => {
        console.log(data);
        this.item = data;
        this.item_title = data.Title;
        this.item_images = data.PictureURL || [];
        this.item_price = '$'+data.CurrentPrice.Value || '';
        this.item_return_policy = data.ReturnPolicy.ReturnsAccepted + data.ReturnPolicy.ReturnsWithin || '';
        this.item_location = data.Location || '';
        this.item_specifics = data.ItemSpecifics.NameValueList || [];
        this.shipping_cost = 'Free Shipping';
        this.shipping_location = data.ShipToLocations[0] || '';
        if (data.HandlingTime && data.HandlingTime <= 1) {
          this.handling_time = data.HandlingTime.toString() + ' Day';
        } else if (data.HandlingTime) {
          this.handling_time = data.HandlingTime.toString() + ' Days';
        }
        if (data.ReturnPolicy.ReturnsAccepted && data.ReturnPolicy.ReturnsAccepted != "ReturnsNotAccepted"){
          this.return_accepted = true;
        }
        this.storeid = data.Seller.UserID.toUpperCase() || '';
        this.feedback_score = data.Seller.FeedbackScore || 0;
        this.popularity = data.Seller.PositiveFeedbackPercent || 0;
        this.rating_star = data.Seller.FeedbackRatingStar || '';
        this.top_rated = data.Seller.TopRatedSeller || false;
        this.store_name = data.Storefront.StoreName || '';
        this.store_url = data.Storefront.StoreURL || '';
      });  
    }

  ngOnInit(): void {
    this.detailSearchService.loadDetails();
    this.imageSearch();
  }

  ngOnDestroy(): void {
    this.detailSubscription.unsubscribe();
  }

  goBack() {
    this.detailSearchService.returnToTable();
  }

  selectTab(tabId: string) {
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.classList.remove('active');
    });
    document.getElementById(tabId)!.setAttribute('aria-selected', 'true');
    document.getElementById(tabId)!.classList.add('active');

    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(tabPane => {
      tabPane.classList.remove('show', 'active');
    });
    document.getElementById(tabId.replace('-tab',''))!.classList.add('show', 'active');
  }

  openModal() {
    var item_images = this.item_images;
    var carouselIndicators = document.querySelector("#productImagesCarousel .carousel-indicators");
    var carouselInner = document.querySelector("#productImagesCarousel .carousel-inner");
  
    carouselIndicators!.innerHTML = "";
    carouselInner!.innerHTML = "";
  
    item_images.forEach(function(image, index) {
      var indicator = document.createElement("li");
      indicator.setAttribute("data-target", "#productImagesCarousel");
      indicator.setAttribute("data-slide-to", index.toString());
      carouselIndicators!.appendChild(indicator);
  
      var slide = document.createElement("div");
      slide.classList.add("carousel-item");
      if (index === 0) {
        slide.classList.add("active");
      }
      var img = document.createElement("img");
      img.classList.add("carousel-image");
      img.src = image;
      img.addEventListener("click", function() {
        window.open(image, "_blank");
      });
      slide.appendChild(img);
      carouselInner!.appendChild(slide);
    });
  
    // Display the modal
    document.getElementById("productImagesModal")!.style.display = "block";
    document.getElementById("productImagesModal")!.classList.add("show");
  }

  closeModal() {
    // Hide the modal
    document.getElementById("productImagesModal")!.style.display = "none";
    document.getElementById("productImagesModal")!.classList.remove("show");
  }

  async imageSearch() {
    const response:any = await lastValueFrom(this.http.get('https://kinetic-hydra-176707.wl.r.appspot.com/imagesearch'+ '?title=' + this.item_title));
    this.searchImages = response.items;
    console.log(this.searchImages);
  }

  openInNewTab(url: string){
    window.open(url, "_blank");
  }

}
