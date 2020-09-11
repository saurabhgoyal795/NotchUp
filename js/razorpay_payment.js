
var proPlanJSON = $.parseJSON('{ "PRO_PLAN": { "daily": { "internationalPrice": "2", "package": "", "price": "20" }, "lifeTime": { "internationalPrice": "129", "price": "7999" }, "monthly": { "internationalPrice": "12", "internationalPrice_oneTime": "12", "iosPackage": "premium_hepro_month", "package": "premium_hepro_month_subscription_new", "packageTrial": "premium_hepro_month_subscription_trial_2x", "package_oneTime": "premium_hepro_month", "price": "699", "price_oneTime": "699", "numberOfDays": 30, "unit": "Month", "numberOfUnits": 1 }, "offerPackage": { "discount": "20", "internationalPrice": "32", "iosPackage": "premium_hepro_annual_discounted", "monthly": { "internationalPrice": "12", "iosPackage": "premium_hepro_month", "package": "premium_hepro_month_subscription_trial_2x", "price": "699" }, "package": "premium_hepro_annual_subscription_20_2x_india", "packageTrial": "premium_hepro_annual_subscription_20_2x_india", "price": "1959", "threeMonthly": { "internationalPrice": "25", "iosPackage": "premium_hepro_quarter", "package": "premium_hepro_quarter_subscription_trial_2x", "price": "1599" }, "yearly": { "internationalPrice": "40", "iosPackage": "premium_hepro_annual", "package": "premium_hepro_annual_subscription_trial_2x", "price": "2449" } }, "threeMonthly": { "internationalPrice": "25", "internationalPrice_oneTime": "25", "iosPackage": "premium_hepro_quarter", "package": "premium_hepro_quarter_subscription_new", "packageTrial": "premium_hepro_quarter_subscription_trial_2x", "package_oneTime": "premium_hepro_quarter", "price": "1599", "price_oneTime": "1599", "numberOfDays": 90, "unit": "Quarter", "numberOfUnits": 1 }, "trialPackage": { "internationalPrice": "40", "iosPackage": "premium_hepro_annual", "package": "premium_hepro_month_subscription_trial_2x", "packageTrial": "premium_hepro_month_subscription_trial_2x", "price": "2449" }, "weekly": { "internationalPrice": "2", "internationalPrice_oneTime": "2", "iosPackage": "premium_hepro_weekly_subscription", "package": "premium_hepro_weekly_subscription", "package_oneTime": "premium_hepro_weekly", "price": "120", "price_oneTime": "120" }, "yearly": { "internationalPrice": "40", "internationalPrice_oneTime": "40", "iosPackage": "premium_hepro_annual_discounted_50", "package": "premium_hepro_annual_subscription_30_annual", "packageTrial": "premium_hepro_annual_subscription_trial_2x", "package_oneTime": "premium_hepro_annual", "price": "1715", "price_oneTime": "1715", "numberOfDays": 365, "unit": "Year", "numberOfUnits": 1, "discount": "30", "offerString": "Extra 30% discount Learn from Home Sale" } } }');

$(function(){
	//showBuyProScreen();
});
function showBuyProScreen(){
	
	proPlanJSON = $.parseJSON('{ "PRO_PLAN": { "daily": { "internationalPrice": "2", "package": "", "price": "20" }, "lifeTime": { "internationalPrice": "129", "price": "7999" }, "monthly": { "internationalPrice": "12", "internationalPrice_oneTime": "12", "iosPackage": "premium_hepro_month", "package": "premium_hepro_month_subscription_new", "packageTrial": "premium_hepro_month_subscription_trial_2x", "package_oneTime": "premium_hepro_month", "price": "699", "price_oneTime": "699", "numberOfDays": 30, "unit": "Month", "numberOfUnits": 1 }, "offerPackage": { "discount": "20", "internationalPrice": "32", "iosPackage": "premium_hepro_annual_discounted", "monthly": { "internationalPrice": "12", "iosPackage": "premium_hepro_month", "package": "premium_hepro_month_subscription_trial_2x", "price": "699" }, "package": "premium_hepro_annual_subscription_20_2x_india", "packageTrial": "premium_hepro_annual_subscription_20_2x_india", "price": "1959", "threeMonthly": { "internationalPrice": "25", "iosPackage": "premium_hepro_quarter", "package": "premium_hepro_quarter_subscription_trial_2x", "price": "1599" }, "yearly": { "internationalPrice": "40", "iosPackage": "premium_hepro_annual", "package": "premium_hepro_annual_subscription_trial_2x", "price": "2449" } }, "threeMonthly": { "internationalPrice": "25", "internationalPrice_oneTime": "25", "iosPackage": "premium_hepro_quarter", "package": "premium_hepro_quarter_subscription_new", "packageTrial": "premium_hepro_quarter_subscription_trial_2x", "package_oneTime": "premium_hepro_quarter", "price": "1599", "price_oneTime": "1599", "numberOfDays": 90, "unit": "Quarter", "numberOfUnits": 1 }, "trialPackage": { "internationalPrice": "40", "iosPackage": "premium_hepro_annual", "package": "premium_hepro_month_subscription_trial_2x", "packageTrial": "premium_hepro_month_subscription_trial_2x", "price": "2449" }, "weekly": { "internationalPrice": "2", "internationalPrice_oneTime": "2", "iosPackage": "premium_hepro_weekly_subscription", "package": "premium_hepro_weekly_subscription", "package_oneTime": "premium_hepro_weekly", "price": "120", "price_oneTime": "120" }, "yearly": { "internationalPrice": "40", "internationalPrice_oneTime": "40", "iosPackage": "premium_hepro_annual_discounted_50", "package": "premium_hepro_annual_subscription_30_annual", "packageTrial": "premium_hepro_annual_subscription_trial_2x", "package_oneTime": "premium_hepro_annual", "price": "1715", "price_oneTime": "1715", "numberOfDays": 365, "unit": "Year", "numberOfUnits": 1, "discount": "30", "offerString": "Extra 30% discount Learn from Home Sale" } } }');
	
	proPlanJSON = proPlanJSON.PRO_PLAN;
	$("#1monthPlanBox .pricemonthly").text("₹"+proPlanJSON.monthly.price);
	$("#3monthPlanBox .pricemonthly").text("₹"+Math.round(proPlanJSON.threeMonthly.price/3));
	$("#12monthPlanBox .pricemonthly").text("₹"+Math.round(proPlanJSON.yearly.price/12));
	
	$("#1monthPlanBox").attr("json",JSON.stringify(proPlanJSON.monthly));
	$("#3monthPlanBox").attr("json",JSON.stringify(proPlanJSON.threeMonthly));
	$("#12monthPlanBox").attr("json",JSON.stringify(proPlanJSON.yearly));
	
	$("#12monthPlanBox .discountDiv").text(Math.floor((proPlanJSON.monthly.price - proPlanJSON.yearly.price/12)*100/proPlanJSON.monthly.price)+"% Discount");
	$("#12monthPlanBox .discountDiv").css("display","");
	
	$("#12monthPlanBox").click();
	
	$(".BuyProPage").css("display","");
}

function selectProPlan(_this){
	var planJson = $.parseJSON($(_this).attr("json"));
	console.log(planJson);
	$(".proPlanItemBox .greenTick").css("display","none");
	$(_this).find(".greenTick").css("display","");
	
	var discount = 0;
	var suffix = "";
	if(planJson.unit.toLowerCase() == "year"){
		suffix = "per year";
	}else if(planJson.unit.toLowerCase() == "quarter"){
		suffix = "per quarter";
	}else if(planJson.unit.toLowerCase() == "month"){
		suffix = "per month";
	}
	if(planJson.discount != undefined){
		discount = planJson.discount;
	}
	if(discount > 0){
		var realPrice = "₹"+ (planJson.price*100/(100-discount));
		$(".BuyProPage").find(".proPurchasePrice").html("<span style='text-decoration:line-through;color:#9E78AE;'>"+realPrice+"</span>  "+"₹"+planJson.price+" "+suffix);
	}else{
		$(".BuyProPage").find(".proPurchasePrice").html("₹"+planJson.price+" "+suffix);
	}
	
	
	if(planJson.offerString != undefined){
		$(".BuyProPage").find(".offerString").text(planJson.offerString);	
	}else{
		$(".BuyProPage").find(".offerString").text("");
	}
}

function hideBuyProScreen(){
	$(".BuyProPage").css("display","none");
}

function buyProplanWithRazorpay(_this){
	
	if(firebase.auth().currentUser.email == ""){
		authenticate();
		if(firebase.auth().currentUser.email == ""){
			return;
		}
	}
	
	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": "https://us-central1-hello-english-app-269406.cloudfunctions.net/razorPay?function=fetchOrderId&amount=200&receipt=order_rcptid_11&currency=INR&payment_capture=1",
	  "method": "GET",
	  "headers": {}
	}
	/*
	var razorPay = firebase.functions().httpsCallable('razorPay');
	razorPay(
		{	function: "fetchOrderId",
			amount : "200",
			currency : "INR",
			payment_capture : "1"
		}
	).then(function(result) {
	  // Read result of the Cloud Function.
	  console.log(result);
	  //var sanitizedMessage = result.data.text;
	  // ...
	});
	*/

	$.ajax(settings).done(function (response) {
	  console.log(response);
	  initiateRazorPayTransaction();
	  /*
	  $.ajax({
		  method: "get",
		  url: "https://mail.culturealley.com/english-app/home.php",
		  data: { 
					function: "initiateTransaction"
				},
		  success : function(dataNew) {
			  console.log(dataNew);
				initiateRazorPayTransaction();
			}
		});
		*/
	});
	  
}

function initiateRazorPayTransaction(order_id){
	var amount = 100;
	var currency = "INR";
	var options = {
		"key": "rzp_live_LH8fVut12b8u6b", // Enter the Key ID generated from the Dashboard
		//"key": "rzp_test_aEt3GTZyjSN55e",
		"amount": amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
		"currency": currency,
		"name": "Hello English Pro",
		"description": "Test Transaction",
		"image": "https://s3.amazonaws.com/LanguagePractice/English-App/Email+Contents/hello_english.png",
		"order_id": order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
		"handler": function (response){
			console.log("response",response);
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