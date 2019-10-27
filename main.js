var favouriteList = [];
var url = "http://www.recipepuppy.com/api/?";
var prev = 1;
var next = 2;
var pageBegin = 1;
var pageEnd = 10;
var pageSize = 10;
var currPos = 1;
var maxPageSize = 100;

$(function () {

	// on search icon click
	$('#search_btn').click(searchRecipies);

	// on enter
	$("#search_tbox").keypress(function (event) {
		if (event.which == 13) {
			searchRecipies();
		}
	});

	function searchRecipies() {
		$('.product-container').css('display', 'block');
		$('.favorites-container').css('display', 'none');
		prev = 1;
		next = 2;
		pageBegin = 1;
		pageEnd = 10;
		pageSize = 10;
		currPos = 1;
		maxPageSize = 100;
		document.getElementById("productListID").innerHTML = "";
		document.getElementById("paginationPanel").innerHTML = "";
		document.getElementById("paginationPanel").innerHTML = generatePageNumbersTag();
		if (!favouriteList) {
			favouriteList = [];
		}
		prepareReciepeList();
	}

	// on favorite click
	$("#favorite_btn").click(function () {
		document.getElementById("favoriteListID").innerHTML = '';
		favouriteList = refreshFavouritesFromCookie();
		$('.product-container').css('display', 'none');
		$('.pagination-container').css('display', 'none');
		$('.favorites-container').css('display', 'block');
		$('.no-data-found').css('display', 'none');
		if (favouriteList.length === 0) {
			$('.no-data-found').css('display', 'block');
			return false;
		}
		favouriteList.forEach(function (item) {
			item = item.replace('/\\/g', '');
		});
		document.getElementById("favoriteListID").innerHTML = favouriteList;
	});

	// On favourite button click
	$("#productListID").on('click', '.product-list', function () {

		if (!favouriteList && favouriteList == "") {
			favouriteList = [];
		}

		$(this)[0].innerHTML = $(this)[0].innerHTML.replace('./assets/fav-icon.png', './assets/fav-selected.png'); // for changing color
		var content = $(this)[0].innerHTML;

		var template = "<div class='product-list'>";
		template += content;
		template += "</div>";
		if (favouriteFind(template)) {
			$(this)[0].innerHTML = $(this)[0].innerHTML.replace('./assets/fav-selected.png', './assets/fav-icon.png'); // for reverting fav color
			favouriteRemove(template);
			if (favouriteList.length) {
				document.getElementById("productListID").innerHTML = favouriteList;
			} else {
				$('.no-data-found').css('display', 'block');
			}
		} else {
			addRecipeToFavourites(template);
		}
	});

	$("#favoriteListID").on('click', '.product-list', function () {
		$(this)[0].innerHTML = $(this)[0].innerHTML.replace('./assets/fav-icon.png', './assets/fav-selected.png'); // for changing color
		var content = $(this)[0].innerHTML;

		var template = "<div class='product-list'>";
		template += content;
		template += "</div>";
		if (favouriteFind(template)) {
			$(this)[0].innerHTML = $(this)[0].innerHTML.replace('./assets/fav-selected.png', './assets/fav-icon.png'); // for reverting fav color
			favouriteRemove(template);
			if (favouriteList.length) {
				document.getElementById("favoriteListID").innerHTML = favouriteList;
			} else {
				document.getElementById("favoriteListID").innerHTML = "";
				$('.favorites-container').css('display', 'none');
				$('.no-data-found').css('display', 'block');
			}
		}
	});

	$("#paginationPanel").on('click', 'a', function () {

		var pageNo = $(this).text();

		if (pageNo) {

			$(".pagination a").removeAttr("class");

			if (pageNo == "Prev") {
				if (currPos > 1) {
					if (currPos == pageBegin) {
						pageBegin = pageBegin - pageSize;

						if (pageBegin <= 1) {
							pageBegin = 1;
							pageEnd = pageSize;
						} else {
							pageEnd = pageEnd - pageSize;
						}

						document.getElementById("paginationPanel").innerHTML = "";
						document.getElementById("paginationPanel").innerHTML = generatePageNumbersTag();
					} else {
						prev = currPos - 1;
						next = currPos;
					}
					currPos -= 1;

					prepareReciepeList();
				}
			} else if (pageNo == "Next") {
				if (prev < maxPageSize - 1) {
					if (currPos == pageEnd) {
						pageBegin = pageBegin + pageSize;
						pageEnd = pageEnd + pageSize;
						document.getElementById("paginationPanel").innerHTML = "";
						document.getElementById("paginationPanel").innerHTML = generatePageNumbersTag();
					} else {
						currPos += 1;
						if (currPos > 1) {
							prev = currPos - 1;
						}
						next = currPos + 1;
					}
					prepareReciepeList();
				}
			} else {
				pageNo = parseInt(pageNo);
				currPos = pageNo;
				if (currPos > 1) {
					prev = currPos - 1;
				}
				next = currPos + 1;
				prepareReciepeList();
			}
		}
		$(this).attr("class", "active");
	});

});

function generatePageNumbersTag() {
	var pageNumTags = "<a href='#'>Prev</a>";
	for (var pageNum = pageBegin; pageNum <= pageEnd; pageNum++) {
		pageNumTags += "<a href='#'>" + pageNum + "</a>";
	}
	pageNumTags += "<a href='#'>Next</a>";
	return pageNumTags;
}

function getRecipies(url) {
	$('.no-data-found').css('display', 'none');
	$('.pagination-container').css('display', 'none');
	$.ajax({
		url: url,
		dataType: 'jsonp', // type of response data
		jsonpCallback: 'callback',
		success: function (data, status, xhr) { // success callback function
			var content = formHtml(data);
			document.getElementById('productListID').innerHTML = '';
			document.getElementById('productListID').innerHTML = content;
			if (data.results.length) {
				$('.product-container').css('display', 'block');
				$('.pagination-container').css('display', 'block');
			} else {
				$('.no-data-found').css('display', 'block');
			}
		},
		error: function (jqXhr, textStatus, errorMessage) { // error callback 
			console.log(errorMessage);
		}
	});
}

function formHtml(jsonStr) {
	var recipeList = "";
	if (jsonStr) {
		var jObj = jsonStr;
		$.each(jObj["results"], function (i) {
			var href = jObj["results"][i]["href"];
			var ingredients = jObj["results"][i]["ingredients"];
			var thumbnail = jObj["results"][i]["thumbnail"];
			var title = jObj["results"][i]["title"];
			recipeList += recipeShowTemplate(href, ingredients, thumbnail, title);
		});
	}
	return recipeList;
}


function refreshFavouritesFromCookie() {
	favouriteList = getCookie("favouriteList");
	return favouriteList;
}

function refreshFavourites(favouriteList) {
	favouriteList = createCookie("favouriteList", favouriteList, 1);
	return favouriteList;
}

function addRecipeToFavourites(item) {
	favouriteList = favouriteList.concat(item);
	refreshFavourites(favouriteList);
	return favouriteList;
}

function favouriteRemove(item) {
	if (favouriteFind(item)) {
		favouriteList = favouriteList.filter(function (ele) {
			return ele != item;
		});
		refreshFavourites(favouriteList);
	}
	return favouriteList;
}

function favouriteFind(item) {
	var isFound = favouriteList.indexOf(item) > -1;
	return isFound;
}

function recipeShowTemplate(href, ingredients, thumbnail, title) {
	if (thumbnail === '') {
		thumbnail = './assets/no-image-icon.jpg';
	}
	var template = "<div class='product-list'>";
	template += "<a class='cursor-pointer' href='" + href + "' target='_blank'>";
	template += "<img class='product-img' src='" + thumbnail + "' />";
	template += "</a>";
	template += "<div class='product-info'>";
	template += "<a class='cursor-pointer' href='" + href + "' target='_blank'>";
	template += "<h3 class='product-title'>" + title + "</h3>";
	template += "</a>";
	template += "<div class='product-details'>" + ingredients + "</div>";
	template += "</div>";
	template += "<div class='product-actions cursor-pointer'>";
	template += "<img name='" + title + "' class='favIcon' src='./assets/fav-icon.png' />";
	template += "</div>";
	template += "</div>";
	return template;
}

function createCookie(name, value, days) {
	var expires;
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	value = JSON.stringify(value);
	document.cookie = name + "=" + encodeURIComponent(value) + '; expires=' + expires + "; path=/";
}

function getCookie(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1) {
				c_end = document.cookie.length;
			}
			return JSON.parse(unescape(document.cookie.substring(c_start, c_end)));
		}
	}
	return "";
}

function prepareReciepeList() {
	var query = $("#search_tbox").val();
	if (query) {
		query = query.trim();
		query = url + "q=" + query + "&p=" + currPos;
		getRecipies(query);
	}
}