var userEmail = getUrlParam("email","");
var courseId = "";
var courseDetailData = {};
var currencyConversionFactors = {};
var currency = "INR";
var currencySymbol = "₹";
var currencyMultiple = 1;
var pricingPlans = [];
var selectedPlan = {};

$(function(){
	courseId = window.location.href.split("#")[0].split("/")[4];
	console.log("courseId:"+courseId);
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
		
		fetchCourseDetail(courseId);
		fetchCourseReviews(courseId);
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

function fetchCourseDetail(courseId){
	var listner1 = db_firestore.collection("selfLearningCourseDetailsCollection").doc(courseId)
		.onSnapshot(function (doc) {
			console.log("courseDetailsCollection:",doc.data());
			courseDetailData = doc.data();
			var data = doc.data();
			$(".courseName").text(data.title);
			$(".title").text(data.title);
			$(".description").text(data.description);
			$(".videoHref").attr("href",data.videoUrl);
			try{
				$(".courseBG").css("background","url("+data.image+") center center no-repeat");
				$(".courseBG").css("background-size","cover");
			}catch(err){}
			/*
			for(var i=0;i<data.whatWillYouLearn.length;i++){
				$(".featuresUL").append('<li><h6>'+data.whatWillYouLearn[i]+'</h6></li>')
			}
			for(var i=0;i<data.whatsIncluded.length;i++){
				$("#whatIncludes").append('<li></i>'+data.whatsIncluded[i]+'</li>')
			}
			*/
			var lessonCategory = {};
			var tasks = data.lessons.taskList;
			for(var i=0;i<tasks.length;i++){
				if(lessonCategory[tasks[i].taskGroup] == undefined){
					lessonCategory[tasks[i].taskGroup] = {};
				}
				if(lessonCategory[tasks[i].taskGroup][tasks[i].taskTitle] == undefined){
					lessonCategory[tasks[i].taskGroup][tasks[i].taskTitle] = {};
				}
				lessonCategory[tasks[i].taskGroup][tasks[i].taskTitle].taskIds = tasks[i].taskIds;
			}
			console.log("lessonCategory",lessonCategory);
			var counter = 0;
			$("#accordion_lessons").html("");
			for( var key in lessonCategory ) {
			  var value = lessonCategory[key];
			  counter++;
			  var html = "";
			  html += '<div class="card">'
						+'<div class="card-header" role="tab" id="headingOne">'
							+'<h5 class="mb-0">'
								+'<a class="headingOne'+counter+'" data-toggle="collapse" href="#collapse'+counter+'" aria-expanded="false" aria-controls="collapseOne"><i class="indicator ti-plus"></i> '+key+'</a>'
							+'</h5>'
						+'</div>';
			  html += '<div id="collapse'+counter+'" class="collapse" role="tabpanel" aria-labelledby="headingOne" data-parent="#accordion_lessons">'
						+'<div class="card-body">';
			  html += '<table class="table table-responsive table-striped add_bottom_30" style=" margin-top:0px;">'
									+'<thead>'
									+'<tr style="">'
									+'<th>Lesson</th>'
									+'<th>Progress</th>'
									+'</tr>'
									+'</thead><tbody>';
			  console.log("value",value);
			  var counter1 = 0;
			  for( var key1 in value ) {
				  var value1 = value[key1];
				  console.log("key1",key1);
				  html += '<tr style="width:100%;"><td style="min-width:200px;">'+(counter1+1)+". "+key1+'</td>';
				  html += '<td class="" style="width:inherit;">';
				  var taskIds = value1.taskIds;
				  for(var i=0;i<taskIds.length;i++){
					  console.log("taskIds:"+key1+":"+taskIds[i]);
					  html += '<div class="subLevelCircle" onclick="">'+(i+1)+' </div>';
				  }
				  html += "</td>";
				  html += "</tr>";
			  }
			  html+='</tbody></table>'
					+'</div>'
					+'</div>'
					+'</div>';
				$("#accordion_lessons").append(html);
			}
			$(".headingOne1").click();
			pricingPlans = data.pricingPlans;
			for(var i=0;i<pricingPlans.length;i++){
				var html = "";
				var popular = "";
				if( i == 1){
					popular = "popular";
					selectedPlan = pricingPlans[i];
				}
				html += '<li class="'+popular+'" onclick="selectPricing('+i+',this);" style="cursor:pointer;">'
						+'<ul class="pricing-wrapper">'
							+'<li data-type="monthly" class="is-visible">'
								+'<header class="pricing-header">'
									+'<h2>Plan '+(i+1)+'</h2>'
									+'<div class="price">'
										+'<span class="currency">'+currencySymbol+'</span>'
										+'<span class="price-value" style="">'+new Number(Math.round(pricingPlans[i].price*currencyMultiple/10)*10).toLocaleString()+'</span>'
										//+'<span class="price-duration">'+pricingPlans[i].pricePerClass+' classess</span>'
									+'</div>'
								+'</header>'
								+'<div class="pricing-body">'
									+'<ul class="pricing-features">'
										+'<li style=""><em></em>'+pricingPlans[i].classes+' Classes</li>'
										+'<li style=""><em></em>'+pricingPlans[i].achievements+'</li>'
										+'<li style=""><em></em>'+pricingPlans[i].cognitiveBenefits+'</li>'
										+'<li style=""><em></em>'+pricingPlans[i].keySkills+'</li>'
										+'<li style=""><em></em>'+pricingPlans[i].kidsCanCreate+'</li>'
									+'</ul>'
								+'</div>'
								+'<footer class="pricing-footer">'
									+'<a class="select-plan" onclick="buyWithRazorpay()">Pay</a>'
//									+'<a class="select-plan" href="'+pricingPlans[i].paymentLink+'" target="_blank">Pay</a>'
								+'</footer>'
							+'</li>'
						  +'</ul>'
						+'</li>';
				$("#priceListContainer").append(html);		
			}
			
			
			setTimeout(function(){
				var heightArr = [];
				$("#priceListContainer .pricing-features").each(function(){
					var length = $(this).find("li").length;
					for(var i=0;i<length;i++){
						var height = $(this).find("li:eq("+i+")").height() + 32;
						//console.log("height:"+height);
						if(heightArr.length < length){
							heightArr.push(height);
						}else if(height > heightArr[i]){
							heightArr[i] = height;
						}
					}
				});
				if(window.innerWidth > 500){
					$("#priceListContainer .pricing-features").each(function(){
						var length = $(this).find("li").length;
						for(var i=0;i<length;i++){
							$(this).find("li:eq("+i+")").css("height",heightArr[i]+"px");
							$(this).find("li:eq("+i+")").css("width",$(".pricing-features").width()+"px");
							$(this).find("li:eq("+i+")").css("display","grid");
							$(this).find("li:eq("+i+")").css("vertical-align","middle");
							
						}
					});
				}
				console.log("heightArr",heightArr);
				listner1()
			},500);
		});
}

function selectPricing(index,_this){
	$("#priceListContainer li").removeClass("popular");
	$(_this).addClass("popular");
	selectedPlan = pricingPlans[index];
}

function fetchCourseReviews(courseId){
	
	//var listner2 = db_firestore.collection("courseReviews").where("courseId","==",courseId)
	var listner2 = db_firestore.collection("courseReviews").doc(courseId)
		.onSnapshot(function (doc) {
			var ratingDistribution = doc.data().ratingDistribution;
			var reviewsCount = doc.data().totalRatingCount;
			//$(".ratingDiv").text(totalRating/reviewsCount);
			$(".ratingDiv").text(doc.data().averageRating);
			$(".reviewCountDiv").text("Based on "+reviewsCount+" reviews");
			$(".reviewProgressContianer .progress-bar:eq(0)").css("width",parseInt(ratingDistribution["5"]*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(1)").css("width",parseInt(ratingDistribution["4"]*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(2)").css("width",parseInt(ratingDistribution["3"]*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(3)").css("width",parseInt(ratingDistribution["2"]*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(4)").css("width",parseInt(ratingDistribution["1"]*100/reviewsCount)+"%");
		});
	var listner2 = db_firestore.collection("courseReviews").doc(courseId).collection("reviews")
		.onSnapshot(function (querySnapshot) {
			var reviewsCount = 0;
			var totalRating = 0;
			var star1Count = 0;
			var star2Count = 0;
			var star3Count = 0;
			var star4Count = 0;
			var star5Count = 0;
			querySnapshot.forEach(function(doc) {
				console.log("doc",doc.data());
				var data = doc.data();
				reviewsCount++;
				var starCount = parseInt(data.rating);
				if(starCount == 1){
					star1Count++;
				}else if(starCount == 2){
					star2Count++;
				}else if(starCount == 3){
					star3Count++;
				}else if(starCount == 4){
					star4Count++;
				}else if(starCount == 5){
					star5Count++;
				}
				totalRating += starCount;
				var today = moment(data.createdAt).format("DD-MMM-YYYY");
				/*
				try{
					today = new Date(data.createdAt.seconds * 1000);	
					var day = today.getDate() + "";
					var month = (today.getMonth() + 1) + "";
					var year = today.getFullYear() + "";
					var hour = today.getHours() + "";
					var minutes = today.getMinutes() + "";
					var seconds = today.getSeconds() + "";
					today = day+"-"+month+"-"+year;
					console.log("today1:"+today);
				}catch(err){
				}
				*/
				var html = '<div class="review-box">'
									+'<figure class="rev-thumb"><img src="'+data.userImage+'" alt="">'
									+'</figure>'
									+'<div class="rev-content">'
										+'<div class="rating">';
										for(var i=0;i<5;i++){
											if(i < starCount){
												html += '<i class="icon_star voted"></i>';
											}else{
												html += '<i class="icon_star"></i>';
											}
										}
								 html += '</div>'
										+'<div class="rev-info">'
										+data.userId +','+data.location+' ('+today+')'
										+'</div>'
										+'<div class="rev-text">'
											+'<p>'
												+data.review
											+'</p>'
										+'</div>'
									+'</div>'
								+'</div>';
				$(".reviewsBox").append(html);
			});
			for(var i=0;i<5;i++){
				if(i < totalRating/reviewsCount){
					$("#review_summary .rating").append('<i class="icon_star voted"></i>');
				}else{
					$("#review_summary .rating").append('<i class="icon_star"></i>');
				}
			}
			/*
			$(".ratingDiv").text(totalRating/reviewsCount);
			$(".reviewCountDiv").text("Based on "+reviewsCount+" reviews");
			$(".reviewProgressContianer .progress-bar:eq(0)").css("width",parseInt(star5Count*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(1)").css("width",parseInt(star4Count*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(2)").css("width",parseInt(star3Count*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(3)").css("width",parseInt(star2Count*100/reviewsCount)+"%");
			$(".reviewProgressContianer .progress-bar:eq(4)").css("width",parseInt(star1Count*100/reviewsCount)+"%");
			*/
			setTimeout(function(){
				listner2()
			},500);
		});
}

function showLoadingDiv(){
	$("#loadingDiv").show();
}
function hideLoadingDiv(){
	$("#loadingDiv").hide();
}

function buyWithRazorpay(){
	
	if(userEmail == ""){
		authenticate();
	}
	var amount = Math.round(selectedPlan.price*currencyMultiple/10)*10*100;
	var receipt = new Date().getTime();
	var productId = courseId + selectedPlan.classes;
	
	var settings = {
	  "function":"fetchOrderId",
	  "userId" : userEmail,
	  "amount": amount,
	  "receipt": receipt,
	  "currency": currency,
	  "productId" : productId,
	  "payment_capture":0,
	  "testPayment" : "false"
	}
	console.log("settings",settings);
	showLoadingDiv();
	var razorpay = defaultProject.functions(cf_region).httpsCallable('razorPayFunctions');
	razorpay(settings).then(function(result) {
		console.log("fetchOrderId:",result);
		hideLoadingDiv();
		initiateRazorPayTransaction(result.data.details,settings);
	}).catch(function(error) {
	  console.log(error);
	  alert("Error! Please try again");
	});
}

function initiateRazorPayTransaction(details,settings){
	var amount = settings.amount;
	var currency = settings.currency;
	console.log("order id:"+details.id);
	var options = {
		"key": "rzp_live_LH8fVut12b8u6b", // Enter the Key ID generated from the Dashboard
		"amount": amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
		"currency": currency,
		"name": "Hello Learner",
		"description": courseDetailData.title,
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

