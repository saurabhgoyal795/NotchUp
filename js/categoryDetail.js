var category = "";
$(function(){
	category = decodeURI(window.location.href.split("/")[4]);
	console.log("category:"+category);
	$(".categoryName").text(category);
	fetchCategoryDetail(category);
});

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return decodeURI(urlparameter);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function fetchCategoryDetail(courseId){
	var listner2 = db.collection("courseDetailsCollection").where("category","==",courseId)
		.onSnapshot(function (querySnapshot) {
			querySnapshot.forEach(function(doc) {
				console.log("doc",doc.data());
				var data = doc.data();
				var html = "";
				html+='<div class="col-xl-4 col-lg-6 col-md-6" onclick="window.open(\'/courseDetail/'+doc.id+'\',\'_blank\')">'
						+'<div class="box_grid wow animated" style="visibility: visible;">'
							+'<figure class="block-reveal">'
								+'<div class="block-horizzontal"></div>'
								+'<a href="" class="wish_bt"></a>'
								+'<a href="course-detail.html"><img src="http://via.placeholder.com/800x533/ccc/fff/course__list_4.jpg" class="img-fluid" alt=""></a>'
								+'<div class="price">INR '+data.price+'</div>'
								+'<div class="preview"><span>Preview course</span></div>'
							+'</figure>'
							+'<div class="wrapper">'
								+'<small style="display:none;">Category</small>'
								+'<h3>'+data.name+'</h3>'
								+'<p style="display:-webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;overflow: hidden;">'+data.description+'</p>'
								+'<div class="rating"><i class="icon_star voted"></i><i class="icon_star voted"></i><i class="icon_star voted"></i><i class="icon_star"></i><i class="icon_star"></i> <small>(145)</small></div>'
							+'</div>'
							+'<ul>'
								+'<li><i class="icon_clock_alt"></i> 1h 30min</li>'
								+'<li><i class="icon_like"></i> 890</li>'
								+'<li><a href="course-detail.html">Enroll now</a></li>'
							+'</ul>'
						+'</div>'
					+'</div>';
				$(".courseContainer").append(html);
			});
			setTimeout(function(){
				listner2()
			},500);
		});
	
}


