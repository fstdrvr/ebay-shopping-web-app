function search() {
  // Search for items based on search box inputs
  var results = document.getElementById("results");
  var button = document.getElementById("showbutton")
  var summary = document.getElementById("searchSummary")
  var keywords = document.getElementById("keywords");
  var details = document.getElementById("singleItemDetails");
  var tooltip = document.getElementById("emptyKeywords")
  if (keywords.value == "") {
    tooltip.style.visibility = "visible";
    return;
  } else {
    tooltip.style.visibility = "hidden";
  }
  var minPrice = parseFloat(document.getElementById("minPrice").value);
  var maxPrice = parseFloat(document.getElementById("maxPrice").value);
  if (minPrice && maxPrice) {
    if (minPrice > maxPrice) {
        alert("Oops! Lower price limit cannot be greater than upper price limit! Please try again.")
        return;}
    if (minPrice < 0 || maxPrice < 0) {
        alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0")
        return;}
    }
  else if (minPrice) {
    if (minPrice < 0) {
      alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0")
      return;}
    }
  else if (maxPrice) {
    if (maxPrice < 0) {
      alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0")
      return;}
    }
  var returnsAccepted = document.getElementById("returnsAccepted").checked;
  var sortOrder = document.getElementById("sortOrder").value;

  // Get condition values
  var condition = document.querySelectorAll('input[name="condition"]:checked');
  var conditionValues = Array.from(condition).map(el => el.id);
  
  // Get shipping options
  var shipping = document.querySelectorAll('input[name="shipping"]:checked');
  var shippingValues = Array.from(shipping).map(el => el.id);

  // Construct the query string
  var query = "?keywords=" + encodeURIComponent(keywords.value) +
              "&minPrice=" + encodeURIComponent(minPrice) +
              "&maxPrice=" + encodeURIComponent(maxPrice) +
              "&condition=" + encodeURIComponent(conditionValues.join(",")) +
              "&returnsAccepted=" + encodeURIComponent(returnsAccepted) +
              "&shipping=" + encodeURIComponent(shippingValues.join(",")) +
              "&sortOrder=" + encodeURIComponent(sortOrder);
  // All requirement satisfied, reset the page for querying
  results.innerHTML = "";
  button.style.display = "none";
  summary.style.display = "none";
  details.style.display = "none";
  // Fetch API for GET request
  fetch("/finditems" + query)
  .then(response => response.json())   // Parse the JSON response
  .then(data => {
    // Loop through each item in the data
    if (data.findItemsAdvancedResponse[0].searchResult[0]["@count"] == 0) {
      results.style.display = "block";
      results.innerHTML = "No Results Found".bold();
    } else {
      var searchCount = document.getElementById("searchCount")
      searchCount.innerHTML = data.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0]+" Results found for "+keywords.value.italics();
      summary.style.display = "block";
      var itemnumber = 0;
      data.findItemsAdvancedResponse[0].searchResult[0].item.forEach((item, index) => {
        if (
        itemnumber < 10 &&
        typeof item.title !== "undefined" &&
        typeof item.primaryCategory !== "undefined" &&
        typeof item.condition !== "undefined" &&
        typeof item.viewItemURL !== "undefined" &&
        typeof item.sellingStatus !== "undefined") {
        // Create a new div element for each item
          var itemElement = document.createElement("div");
          // Add GetSingleItem API functionality
          itemElement.addEventListener("click", searchDetails.bind(null, item.itemId[0]));
          itemElement.classList.add("item")
          var itemDetails = document.createElement("div");
          itemDetails.classList.add("itemDetails")
          // Create an img element for the item image
          var imageContainer = document.createElement("div");
          imageContainer.classList.add("imageContainer")
          var itemImage = document.createElement("img");
          itemImage.classList.add("itemImage")
          if (typeof item.galleryURL == "undefined" || item.galleryURL == "") {
            itemImage.src = "/static/image/ebay_default.jpg/"
          } else {
            itemImage.src = item.galleryURL[0];
          }
          imageContainer.appendChild(itemImage)
          itemElement.appendChild(imageContainer);
          // Create a p element for the item title
          var itemTitle = document.createElement("p");
          itemTitle.innerHTML = item.title[0].bold();
          itemTitle.classList.add("itemTitle");
          itemDetails.appendChild(itemTitle);
          // Create a p element for the item category
          var itemCategory = document.createElement("p");
          itemCategory.innerHTML = "Category: "+item.primaryCategory[0].categoryName[0].italics();
          // Create an a element for the hyperlink
          var productLink = document.createElement("a");
          productLink.href = item.viewItemURL[0]
          // Create an image element for the product link button
          var linkButton = document.createElement("img");
          linkButton.src = "static/image/redirect.png";
          linkButton.classList.add("productLink")
          productLink.appendChild(linkButton)
          productLink.target = "_blank";
          // Stop the propagation of the click event
          productLink.addEventListener("click", function(event) {event.stopPropagation();});
          itemCategory.appendChild(productLink)
          itemDetails.appendChild(itemCategory);
          // Create a p element for the item condition
          var itemCondition = document.createElement("p");
          itemCondition.textContent = "Condition: "+item.condition[0].conditionDisplayName;
          // If the item is top rated, add the top rated image
          if (item.topRatedListing) {  
            if (item.topRatedListing == "true") {
                var topRated = document.createElement("img");
                topRated.src = "static/image/topRatedImage.png";
                topRated.classList.add("topRated");
                itemCondition.appendChild(topRated);
                itemCondition.style.display = "flex";
            }
          }
          itemDetails.appendChild(itemCondition);
          // Create a p element for the item price
          var itemPrice = document.createElement("p");
          itemPrice.innerHTML = "Price: $".bold()+item.sellingStatus[0].convertedCurrentPrice[0].__value__.bold();
          itemDetails.appendChild(itemPrice);
          itemElement.appendChild(itemDetails)
          // Add the "hidden" class to items after the third item
          if (itemnumber >= 3) {
            itemElement.style.display = "none"}
          else {
            itemElement.style.display = "flex"}
          // Append the div to the results div for up to 10 items
          results.appendChild(itemElement);
          itemnumber += 1;
        }
        results.style.display = "block";
      })
      // Display show more button
      if (itemnumber > 3) {
        button.style.display = "block";
        if (button.textContent == "Show Less") {
          button.textContent = "Show More";}
      }
    }
  })
  .catch(error => console.error("Error:", error));
}

function searchDetails(itemId) {
  // Get single item details
  var query = "?itemId=" + encodeURIComponent(itemId);
  fetch("/findsingleitem" + query)
  .then(response => response.json())   // Parse the JSON response
  .then(data => {
    // Hide search count, results, and show more button
    var searchCount = document.getElementById("searchSummary")
    var results = document.getElementById("results");
    var showButton = document.getElementById("showbutton");
    searchCount.style.display = "none";
    results.style.display = "none";
    showButton.style.display = "none";
    // Create individual item table
    var details = document.getElementById("singleItemDetails");
    details.innerHTML = "";
    details.style.display = "block";
    // Create title
    var divTitle = document.createElement("h1");
    divTitle.classList.add("header");
    divTitle.textContent = "Item Details";
    details.appendChild(divTitle);
    // Create back button
    var backButton = document.createElement("button");
    backButton.classList.add("show");
    backButton.textContent = "Back to search results";
    backButton.addEventListener("click", backToSearchResults);
    details.appendChild(backButton);
    var item = data.Item
    // Add all existing attributes to array to be added to table
    var itemTable = document.createElement("table");
    var row = itemTable.insertRow(-1);
    var name = row.insertCell(0);
    name.innerHTML = "Photo".bold();
    var value = row.insertCell(1);
    var photo = document.createElement("img")
    if (typeof item.PictureURL[0] !== "undefined" && item.PictureURL[0] != "") {
      photo.src = item.PictureURL[0];}
    else {
      photo.src = "static/image/ebay_default.jpg";}
    value.appendChild(photo);
    if (typeof item.ViewItemURLForNaturalSearch !== "undefined" && item.ViewItemURLForNaturalSearch != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "eBay Link".bold();
      var value = row.insertCell(1);
      var productLink = document.createElement("a");
      productLink.href = item.ViewItemURLForNaturalSearch;
      productLink.target = "_blank";
      productLink.textContent = "eBay Product Link";
      value.appendChild(productLink);}
    if (typeof item.Title !== "undefined" && item.Title != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "Title".bold();
      var value = row.insertCell(1);
      value.textContent = item.Title;}
    if (typeof item.SubTitle !== "undefined" && item.SubTitle != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "SubTitle".bold();
      var value = row.insertCell(1);
      value.textContent = item.SubTitle;}
    if (typeof item.CurrentPrice !== "undefined" && item.CurrentPrice.Value != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "Price".bold();
      var value = row.insertCell(1);
      value.textContent = item.CurrentPrice.Value + " " + item.CurrentPrice.CurrencyID;}
    if (typeof item.Location !== "undefined" && typeof item.PostalCode !== "undefined" && item.Location !== "" && item.PostalCode !== "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "Location".bold();
      var value = row.insertCell(1);
      value.textContent = item.Location + ", " + item.PostalCode;}
    if (typeof item.Seller.UserID !== "undefined" && item.Seller.UserID != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "Seller".bold();
      var value = row.insertCell(1);
      value.textContent = item.Seller.UserID;}
    if (typeof item.ReturnPolicy !== "undefined" && item.ReturnPolicy != "") {
      var row = itemTable.insertRow(-1);
      var name = row.insertCell(0);
      name.innerHTML = "Return Policy (US)".bold();
      var value = row.insertCell(1);
      if (typeof item.ReturnPolicy.ReturnsAccepted !== "undefined" && typeof item.ReturnPolicy.ReturnsWithin !== "undefined") {
        value.textContent = item.ReturnPolicy.ReturnsAccepted + " within " + item.ReturnPolicy.ReturnsWithin;
      } else if (typeof item.ReturnPolicy.ReturnsAccepted !== "undefined") {
        value.textContent = item.ReturnPolicy.ReturnsAccepted;
      } else if (typeof item.ReturnPolicy.ReturnsWithin !== "undefined") {
        value.textContent = item.ReturnPolicy.ReturnsWithin;
      } else {
        value.textContent = "";
      }
    }
    if (typeof item.ItemSpecifics.NameValueList !== "undefined" && item.ItemSpecifics.NameValueList != "") {
      for (var i = 0; i < item.ItemSpecifics.NameValueList.length; i++) {
        var row = itemTable.insertRow(-1);
        var name = row.insertCell(0);
        name.innerHTML = item.ItemSpecifics.NameValueList[i].Name.bold();
        var value = row.insertCell(1);
        value.textContent = item.ItemSpecifics.NameValueList[i].Value[0];}
      }
    details.appendChild(itemTable);
  })
.catch(error => console.error("Error:", error));
}

function toggleShowMore() {
  // Show or hide 10 item cards
  var items = document.querySelectorAll("#results > div");
  var button = document.getElementById("showbutton");
  // Loop through the items and change the display
  for (let i = 3; i < items.length; i++) {
    if (items[i].style.display == "none") {
      items[i].style.display = "flex";
    } else {
      items[i].style.display = "none";
    }
  };
  // Change button display
  if (button.textContent == "Show More") {
    button.textContent = "Show Less";
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    button.textContent = "Show More";
    window.scrollTo(0, 0);
  }
}

function clearResults() {
  var singleItemDetails = document.getElementById("singleItemDetails");
  var searchCount = document.getElementById("searchSummary")
  var results = document.getElementById("results");
  var showButton = document.getElementById("showbutton");
  var tooltip = document.getElementById("emptyKeywords")
  singleItemDetails.style.display = "none";
  searchCount.style.display = "none";
  results.style.display = "none";
  showButton.style.display = "none";
  tooltip.style.visibility = "hidden";
}

function backToSearchResults() {
  // Go back from single item details to search results
  var singleItemDetails = document.getElementById("singleItemDetails");
  var searchCount = document.getElementById("searchSummary")
  var results = document.getElementById("results");
  var showButton = document.getElementById("showbutton");
  var tooltip = document.getElementById("emptyKeywords")
  singleItemDetails.style.display = "none";
  searchCount.style.display = "block";
  results.style.display = "block";
  showButton.style.display = "block";
  tooltip.style.visibility = "hidden";
}