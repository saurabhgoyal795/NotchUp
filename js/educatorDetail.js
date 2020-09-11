var userEmail = getUrlParam("email","");
var category = "";
var educatorDetailData = {};
var courseCategory = {};
var teacherListData = [];
var selectedCategory = "all";
var availableSlotsData = {};
var availableSlotsUTC = [];
var weekCounter = 1;
var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var currencyConversionFactors = {};
var currency = "INR";
var currencySymbol = "₹";
var currencyMultiple = 1;
var isDemoBuying = false;
var selectedPlan = {};
var teacherId = getUrlParam("teacherCode","");

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
		
		fetchTeacherDetails();
		setTimeout(function(){
			listener();
		},1000);
	});
	
	if(userEmail == ""){
		firebase.auth().onAuthStateChanged(function(user) {
			console.log("onAuthStateChanged:",user);
		  if (user) {
			userEmail = firebase.auth().currentUser.email;
			onAuthenticated();
		  } else {
			$(".afterLogin").css("display","none");
			$(".beforeLogin").css("display","");
		  }
		});
	}else{
		onAuthenticated();
	}
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

function authenticate(){
	
	var user = firebase.auth().currentUser;
	console.log("user",user);
	if (user) {
		console.log("authenticate if");
	  // User is signed in.
	  userEmail = firebase.auth().currentUser.email;
	  onAuthenticated();
	} else {
		console.log("authenticate else");
		$(".afterLogin").css("display","none");
		$(".beforeLogin").css("display","");
		$("#loginBoxFirestore").css("display","");
	 firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
	 //var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
	  var ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start('#firebaseui-auth-container', {
		  signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		  ],
		  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
		  signInFlow: 'popup',
		  signInSuccessUrl: '',
		  callbacks: {
				signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				  // User successfully signed in.
				  // Return type determines whether we continue the redirect automatically
				  // or whether we leave that to developer to handle.
				  //localStorage.setItem();
				  console.log("authenticate success:",authResult);
				  //onAuthenticated();
				  return false;
				},
				uiShown: function() {
				  // The widget is rendered.
				  // Hide the loader.
				  //document.getElementById('loader').style.display = 'none';
				}
			},
		  // Other config options...
		});
		
	}
}

function signOut(){
	firebase.auth().signOut();
	location.reload();
}

function onAuthenticated(){
	$("#loginBoxFirestore").css("display","none");
	$(".userEmail").text(userEmail);
	console.log("onAuthenticated:"+userEmail);
}

function fetchTeacherDetails(){
	var changeBookSlotStatus = defaultProject.functions(cf_region).httpsCallable('fetchTeacherDetails');
	var responseData = {
		teacherId : teacherId	
	};
	changeBookSlotStatus(responseData).then(function(result) {
		
		console.log("fetchTeacherDetails:",result);
		var data = result.data.success;
		educatorDetailData = result.data.success;
		loadTeacherDetail(data);
		
	}).catch(function(error) {
		console.log("error",error);
	  alert("Error");
	});;
}

function loadTeacherDetail(data){
	$(".educator_about").text(data.aboutMe);
	$(".educator_name").text(data.name);
	$(".educator_courses").html("");
	$(".overallStats_rating").text(data.overallStats.ratingValue);
	$(".videoHref").text(data.videoUrl);
	$(".educatorImage").attr("src",data.imagePath);
	$(".overallStats_reviews").text("0");
	$(".bookingFrequency").text(data.overallStats.bookingFrequency);
	$(".responsiveness").text(data.overallStats.responsiveness);
	$(".basePrice").text(currencySymbol+(Math.round(data.pricing.basePriceINR*currencyMultiple/10)*10));
	$(".demoPriceINR").text(currencySymbol+(Math.round(data.pricing.demoPriceINR*currencyMultiple/10)*10));
	$(".demoPriceINRDiscount").text("( "+Math.floor((data.pricing.basePriceINR-data.pricing.demoPriceINR)*100/data.pricing.demoPriceINR)+"% Discount for Demo Only )");
	
	availableSlotsUTC = data.availableSlotsUTC;
	console.log("availableSlotsUTC",availableSlotsUTC);
	
	var reviews = data.reviews;
	$(".reviewsBox").html("");
	for(var i=0;i<reviews.length;i++){
		$("#reviews_edu").css("display","");
		$(".reviewsBox").append('<div class="review-box clearfix" style="padding-left:0px;">'
									+'<div class="rev-content">'
									+'<div class="rating">'
										+'<i class="icon_star voted"></i><i class="icon_star voted"></i><i class="icon_star voted"></i><i class="icon_star voted"></i><i class="icon_star"></i>'
											+'</div>'
										+'<div class="rev-info">'+reviews[i].parentName+' – '+reviews[i].reviewedOn+'</div>'
										+'<div class="rev-text">'
										+'<p>'+reviews[i].reviewText+'</p>'
											+'</div>'
										+'</div>'
								+'</div>');
	}
	
	
	$("#timezone").val(Intl.DateTimeFormat().resolvedOptions().timeZone);
	timeZone = $("#timezone option:selected").text();
	console.log("timeZone:"+timeZone);
	updateavailabilityTable("week1");
	$("#timezone").on('change', function() {
		//timeZone = this.value.trim();
		timeZone = $("#timezone option:selected").text();
		console.log("timeZone onchange:"+timeZone);
		updateavailabilityTable("week1");
	});
	
	var plans = data.pricing.plans;
	for(var i=0;i<plans.length;i++){
		var discount = parseInt(plans[i].discount);
		var price = (plans[i].lessonsCount*data.pricing.basePriceINR)*(100-discount)/100;
		var pricePerClass = currencySymbol+(Math.round(price/plans[i].lessonsCount*currencyMultiple/10)*10);
		price = currencySymbol + (Math.round(price*currencyMultiple/10)*10);
		$(".bulkPlans").append('<div class="pricingBox" onclick="buyBulkPlan('+i+')"> <h2>'+plans[i].planTitle+'</h2> <div class="pricingBoxPrice">'+price+' <span class="pricingBoxDiscount"> ( '+pricePerClass+' / Hr )</span> </div> <div class="arrowBox"><a class="" href="#0" style=""> <i class="icon-right-open"> </i> </a> </div></div>');
	}
	var courses = data.courses;
	for(key in courses){
		var value = courses[key];
		$(".educator_courses").append('<tr>'
				+'<td>'+value.category+'</td>'
				+'<td><a href="#">'+value.title+'</a></td>'
				+'<td class="rating">'
				+'<span style="white-space: pre; margin-right: 10px;"><i class="icon_star voted"></i> <small>'+value.ratingValue+' ('+value.ratingCount+')</small></span>'
				+'<span style="white-space: pre; margin-right: 10px;"><i class="icon_profile"></i> <small>'+value.studentsTaught+' Students</small></span>'
				+'<span style="white-space: pre"><i class="icon_book_alt"></i> <small>'+value.lessonsTaken+' Lessons</small></span>'
				+'</td>'
				+'</tr>');
	}
	$(".resumeContainerUl1").html("");
	$(".resumeContainerUl2").html("");
	for(var i=0;i<data.resume.length;i++){
		if( i%2==0){
			$(".resumeContainerUl1").append('<li><strong>'+data.resume[i].duration+' - '+data.resume[i].degree+'</strong><p>'+data.resume[i].institute+'</p></li>');
		}else{
			$(".resumeContainerUl2").append('<li><strong>'+data.resume[i].duration+' - '+data.resume[i].degree+'</strong><p>'+data.resume[i].institute+'</p></li>');
		}
	}
}

function updateavailabilityTable(week){
	if(week == "week5" || week == "week0"){
		return;
	}
	var offset = moment().utcOffset(timeZone.split(" ")[2])._offset;
	offset = offset*60*1000;
	availableSlotsData = {};
	for(var i=1;i<=4;i++){
		availableSlotsData["week"+i] = {"days":{},"title":moment().add((i-1)*7,'d').format("MMM DD")+" - " + moment().add((i-1)*7 + 6,'d').format("MMM DD")};
		for(var j=1;j<=7;j++){
			availableSlotsData["week"+i]["days"][moment().add((i-1)*7 + j -1,'d').date()+moment().add((i-1)*7 + j -1,'d').format("MMM")] = {
								"title":moment().add((i-1)*7 + j -1,'d').format("ddd") + "<br>" + moment().add((i-1)*7 + j -1,'d').date(),
								"date" : moment().add((i-1)*7 + j -1,'d').date(),
								"month" : moment().add((i-1)*7 + j -1,'d').format("MMM"),
								"slots":[]
								};
		}
	}
	console.log("availableSlotsData:",availableSlotsData);
	for(var i=0;i<availableSlotsUTC.length;i++){
		var seconds = availableSlotsUTC[i]._seconds*1000 + offset;
		var date = moment(seconds).date();
		var month = moment(seconds).format("MMM");
		for(key in availableSlotsData){
			var value = availableSlotsData[key].days;
			if(value[date+month] != undefined){
				//availableSlotsData[key].days[date+month].slots.push(moment(seconds+moment().utcOffset()*60*1000).format("hh:mm a"));
				availableSlotsData[key].days[date+month].slots.push(seconds);
			}
		}
	}
	console.log("availableSlotsData:",availableSlotsData);
	
	weekCounter = parseInt(week.replace("week",""));
	console.log(weekCounter);
	$(".availabilityTable").html("");
	var data = availableSlotsData[week].days;
	console.log("availableSlotsData[week]:",data);
	$(".availability_weekTitle").text(availableSlotsData[week].title);
	var html = "<tr>";
	for(key in data){
		var value = data[key];
		html += '<th class="calendarHeaderRow highlighted"> '+value.title+' </th>';
	}
	html += "</tr><tr>";
	for(key in data){
		var value = data[key];
		var slots = value.slots;
		html += '<td>';
		for(var i=0;i<slots.length;i++){
			var time = moment(slots[i]).format("hh:mm a")
			html += '<a > '+time+'</a> <br>';
		}
		html += '</td>';
	}
	
	$(".availabilityTable").html(html);
}

function showLoadingDiv(){
	$("#loadingDiv").show();
}
function hideLoadingDiv(){
	$("#loadingDiv").hide();
}

function buyDemo(){
	isDemoBuying = true;
	buyWithRazorpay();
}

function buyBulkPlan(index){
	isDemoBuying = false;
	selectedPlan = educatorDetailData.pricing.plans[index];
	buyWithRazorpay();
}

function buyWithRazorpay(){
	
	if(userEmail == ""){
		authenticate();
		return;
	}
	var amount = 0;
	var receipt = new Date().getTime();
	var productId = "";
	if(isDemoBuying){
		amount = Math.round(educatorDetailData.pricing.demoPriceINR*currencyMultiple/10)*10;
		productId = teacherId+"demo";
	}else{
		var discount = parseInt(selectedPlan.discount);
		var price = (selectedPlan.lessonsCount*educatorDetailData.pricing.basePriceINR)*(100-discount)/100;
		amount = Math.round(price*currencyMultiple/10)*10;
		productId = teacherId + selectedPlan.lessonsCount;
	}
	
	var settings = {
	  "function":"fetchOrderId",
	  "userId" : userEmail,
	  "amount": amount*100,
	  "receipt": receipt,
	  "currency": currency,
	  "productId" : productId,
	  "payment_capture":0,
	  "testPayment" : "true"
	}
	console.log("settings",settings);
	showLoadingDiv();
	
	var fetchOrderId = defaultProject.functions(cf_region).httpsCallable('razorPayFunctions');
	fetchOrderId(settings).then(function(result) {
		console.log("fetchOrderId:",result);
		hideLoadingDiv();
		initiateRazorPayTransaction(result.data.details,settings);
	}).catch(function(error) {
	  console.log(error);
	});
}

function initiateRazorPayTransaction(details,settings){
	var amount = settings.amount;
	var currency = settings.currency;
	console.log("order id:"+details.id);
	var options = {
		"key": "rzp_live_LH8fVut12b8u6b", // Enter the Key ID generated from the Dashboard
		"key": "rzp_test_aEt3GTZyjSN55e",
		"amount": amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
		"currency": currency,
		"name": "Hello Learner",
		"description": educatorDetailData.name+" classes",
		"image": "http://hellolearner.com/img/logo.png",
		"order_id": details.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
		"handler": function (response){
			console.log("initiateRazorPayTransaction response",response);
			if(response.razorpay_payment_id != undefined){
				settings.payment_capture = 1;
				settings.razorpay_payment_id = response.razorpay_payment_id;
			}
			finishTransaction(settings);
			//alert(response.razorpay_payment_id);
			//alert(response.razorpay_order_id);
			//alert(response.razorpay_signature)
		},
		"prefill": {
			"email": userEmail
		},
		"notes": {
			"user_email": userEmail
		},
		"theme": {
			"color": "#FE5C57"
		}
	};
	var rzp1 = new Razorpay(options);
	rzp1.open();
}

function finishTransaction(settings){
	showLoadingDiv();
	settings.function = "finishTransaction";
	var finishTransaction = defaultProject.functions(cf_region).httpsCallable('razorPayFunctions');
	finishTransaction(settings).then(function(result) {
		console.log("finishTransaction:",result);
		hideLoadingDiv();
		alert("Payment successful");
	}).catch(function(error) {
	  console.log(error);
	  alert("Error! Please try again");
	});
}

