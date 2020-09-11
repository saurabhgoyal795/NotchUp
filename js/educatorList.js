var category = "";
var courseCategory = {};
var teacherListData = [];
var selectedCategory = "all";
var priceRange = "";
var availabilityRange = "";
var currencyConversionFactors = {};
var currency = "INR";
var currencySymbol = "₹";
var currencyMultiple = 1;

$(function(){
	//category = decodeURI(window.location.href.split("/")[4]);
	var listener = db_firestore.collection("currencyConversionFactors").doc("conversionMultiples")
	.onSnapshot(function(doc) {
		console.log("currencyConversionFactors",doc.data());
		currencyConversionFactors = doc.data();
		if(currencyConversionFactors[Intl.DateTimeFormat().resolvedOptions().timeZone] != undefined){
			currency = currencyConversionFactors[Intl.DateTimeFormat().resolvedOptions().timeZone].currency;
			currencyMultiple = parseFloat(currencyConversionFactors[Intl.DateTimeFormat().resolvedOptions().timeZone].multiple);
			currencySymbol = currencyConversionFactors[Intl.DateTimeFormat().resolvedOptions().timeZone].symbol;
		}else{
			currency = currencyConversionFactors["default"].currency;
			currencyMultiple = parseFloat(currencyConversionFactors["default"].multiple);
			currencySymbol = currencyConversionFactors["default"].symbol;
		}
		
		fetchTeacherList();
		setTimeout(function(){
			listener();
		},1000);
	});
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

function fetchTeacherList(){
	var changeBookSlotStatus = defaultProject.functions(cf_region).httpsCallable('fetchTeacherList');
	var responseData = {
			
	};
	changeBookSlotStatus(responseData).then(function(result) {
		
		console.log("fetchTeacherList:",result);
		var list = result.data.success;
		teacherListData = list;
		for(var i=0;i<teacherListData.length;i++){
			if(teacherListData[i].availableSlotsUTC == undefined
					|| Array.isArray(teacherListData[i].availableSlotsUTC) == false){
				teacherListData[i].availableSlotsUTC = [];
			}
			var availableSlotsUTC = teacherListData[i].availableSlotsUTC;
			var availabilityCategory = {};
			console.log("name:"+teacherListData[i].name+"/"+availableSlotsUTC.length);
			for(var j=0;j<availableSlotsUTC.length;j++){
				var time = moment(availableSlotsUTC[j]._seconds*1000 + moment().utcOffset()*60*1000).format("HH");
				if(time >= 21 && time <6){
					availabilityCategory["6"] = {"title":"NIGHT"};
				}else if(time >= 18){
					availabilityCategory["5"] = {"title":"EVENING"};
				}else if(time >= 15){
					availabilityCategory["4"] = {"title":"AFTERNOON"};
				}else if(time >= 12){
					availabilityCategory["3"] = {"title":"AFTERNOON"};
				}else if(time >= 9){
					availabilityCategory["2"] = {"title":"MORNING"};
				}else if(time >= 6){
					availabilityCategory["1"] = {"title":"MORNING"};
				}
			}
			teacherListData[i]["availabilityCategory"] = availabilityCategory;
		}
		console.log("teacherListData",teacherListData);
		loadTeacherList(teacherListData,"all");
		
		for(key in courseCategory){
			$(".allCourseList").append('<option value="'+key+'">'+key+'</option>');
			$(".allCourseList").next().find(".sbOptions li:eq(0) a").attr("onclick","onCategoryChange(this)");
			$(".allCourseList").next().find(".sbOptions").append('<li class="last"><a href="#" onclick="onCategoryChange(this)" rel="'+key+'" class="">'+key+'</a></li>');
		}
		$(".availabilityRangeList").next().find(".sbOptions li").each(function(){
			$(this).find("a").attr("onclick","availabilityOnChange(this)");
		});
	}).catch(function(error) {
		console.log("error",error);
	   //alert("Error");
	});;
}

function loadTeacherList(list){
	var html = "";
	for(var i=0;i<list.length;i++){
		var data = list[i];
		var availability = "";
		for(key in data["availabilityCategory"]){
			availability += data.availabilityCategory[key].title+",";
		}
		if(availability.length > 0){
			availability = availability.substring(0,availability.length-1);
		}
		html += '<div class="box_list wow animated" style="visibility: visible;cursor:pointer;" teacherCode="'+data.teacherCode+'" onclick="window.location.href=\'/educator-detail.html?teacherCode='+data.teacherCode+'\'">'
					+'<div class="row no-gutters">'
						+'<div class="col-lg-5">'
						+'<figure class="block-reveal">'
							+'<div class="block-horizzontal"></div>'
								+'<a href="course-detail.html"><img style="filter:saturate(70%); -webkit-filter: saturate(50%);" src="'+data.imagePath+'" class="img-fluid" alt="">'
								+'</a>'
								//+'<div class="preview"><span>Preview</span></div>'
								+'<div class="scrimDiv" style="width:100%; z-index: 2; background-color: rgba(72,0,72,100); opacity:20%; position: absolute; height: 100%;"> </div>'
								+'</figure>'
							+'</div>'
						+'<div class="col-lg-7">'
						+'<div class="wrapper">'
							+'<a href="#0" class="wish_bt"></a>'
								+'<div class="price">'+data.name+'</div>'
								+'<small>'+data.courseCategories.toString()+'</small>'
								+'<p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">'+data.aboutMe+'</p>'
								+'<div class="rating"><i class="icon_star voted"></i> <small>'+data.overallStats.ratingValue+' ('+data.overallStats.ratingCount+')</small>'
								+'<i class="icon_profile" style="margin-left:10px;"></i> <small>'+data.overallStats.studentsTaught+' Students</small>'
								+'<i class="icon_book_alt" style="margin-left:10px;"></i> <small>'+data.overallStats.lessonsTaken+' Lessons</small>'
									+'</div>'
								+'<div class="rating"><i class="icon_calendar"></i> <small>'+availability+'</small>'
								+'</div>'
								+'</div>'
							+'<ul>'
							+'<li class="price" style="line-height: 1;font-weight: 600;font-size: 24px;font-size: 1.5rem; color: #662d91;margin-right: 0px;"> '+currencySymbol+' '+Math.round(data.pricing.basePriceINR*currencyMultiple/10)*10+'</li> <li> <small> per hour</small></li>'
								+'<li><a href="teacher-detail.html">Book Trial Lesson</a></li>'
								+'</ul>'
							+'</div>'
						+'</div>'
				+'</div>';
		if(selectedCategory == "all"){
			for(var a=0;a<data.courseCategories.length;a++){
				courseCategory[data.courseCategories[a]] = "";
			}
		}
	}
	$(".teacherListContianer").html(html);
}

function onCategoryChange(_this){
	$(".allCourseList").next().find(".sbOptions").css("display","none");
	selectedCategory = $(_this).attr("rel");
	$(".allCourseList").next().find(".sbSelector").text(selectedCategory);
	if(selectedCategory == "all"){
		$(".allCourseList").next().find(".sbSelector").text("All Courses");
	}
	var list = [];
	for(var i=0;i<teacherListData.length;i++){
		var data = teacherListData[i];
		if(data.courseCategories.indexOf(selectedCategory) > -1 || selectedCategory == "all"){
			if(data.availabilityCategory[availabilityRange] != undefined || availabilityRange == ""){
				list.push(data);
			}
		}
	}
	
	for(var i=0;i<list.length;i++){
		list[i].basePriceINR = parseInt(list[i].pricing.basePriceINR);
	}
	if(priceRange == "min"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR < b.basePriceINR? -1:1; 
		    return x; 
		});
	}else if(priceRange == "max"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR > b.basePriceINR? -1:1; 
		    return x; 
		});
	}
	loadTeacherList(list);
}

function onPriceRangeChange(_this){
	$(".priceRangeList").next().find(".sbOptions").css("display","none");
	priceRange = $(_this).val();
	console.log("priceRange:"+priceRange);
	var list = [];
	for(var i=0;i<teacherListData.length;i++){
		var data = teacherListData[i];
		if(data.courseCategories.indexOf(selectedCategory) > -1 || selectedCategory == "all"){
			if(data.availabilityCategory[availabilityRange] != undefined || availabilityRange == ""){
				list.push(data);
			}
		}
	}
	for(var i=0;i<list.length;i++){
		list[i].basePriceINR = parseInt(list[i].pricing.basePriceINR);
	}
	if(priceRange == "min"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR < b.basePriceINR? -1:1; 
		    return x; 
		});
	}else if(priceRange == "max"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR > b.basePriceINR? -1:1; 
		    return x; 
		});
	}
	loadTeacherList(list);
}

function availabilityOnChange(_this){
	$(".availabilityRangeList").next().find(".sbOptions").css("display","none");
	availabilityRange = $(_this).attr("rel");
	console.log("availabilityRange:"+availabilityRange);
	var list = [];
	for(var i=0;i<teacherListData.length;i++){
		var data = teacherListData[i];
		console.log("data.availabilityCategory:",data.availabilityCategory);
		if(data.courseCategories.indexOf(selectedCategory) > -1 || selectedCategory == "all"){
			if(availabilityRange == "" || data.availabilityCategory[availabilityRange] != undefined){
				list.push(data);
			}
		}
	}
	if(selectedCategory == "all"){
		//list = teacherListData;
	}
	for(var i=0;i<list.length;i++){
		list[i].basePriceINR = parseInt(list[i].pricing.basePriceINR);
	}
	if(priceRange == "min"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR < b.basePriceINR? -1:1; 
		    return x; 
		});
	}else if(priceRange == "max"){
		list.sort(function(a,b){ 
		    var x = a.basePriceINR > b.basePriceINR? -1:1; 
		    return x; 
		});
	}
	loadTeacherList(list);
}


