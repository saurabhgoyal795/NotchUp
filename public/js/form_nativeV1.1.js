var teacherListData = {};
var subjectCategoriesTaught = {};
var generatedstudentId = "";

$(function(){
	for(var i=0;i<countryCodeMappingArray.length;i++){
		for(key in countryTimezoneMappingObject){
			if(countryTimezoneMappingObject[key].CountryName == countryCodeMappingArray[i].name){
				var timeZone = countryTimezoneMappingObject[key].WindowsTimeZones[0].Id;
				var timeZoneOffset = countryTimezoneMappingObject[key].WindowsTimeZones[0].Name.split(" ")[0].replace("(","").replace(")","").replace("UTC","");
				$("#countryCode").append('<option timeZone="'+timeZone+'" timeZoneOffset="'+timeZoneOffset+'" value="'+countryCodeMappingArray[i].dial_code+'" country="'+countryCodeMappingArray[i].name+'">'+countryCodeMappingArray[i].name+' (+'+countryCodeMappingArray[i].dial_code+')</option>');
				break;
			}
		}
	}
	for(key in countryTimezoneMappingObject){
		var selected = "";
		if(key.indexOf(Intl.DateTimeFormat().resolvedOptions().timeZone) > -1){
			for(var i=0;i<countryCodeMappingArray.length;i++){
				if(countryTimezoneMappingObject[key].IsoAlpha2 == countryCodeMappingArray[i].code){
					$("#countryCode").val(countryCodeMappingArray[i].dial_code);
				}
			}
		}
	}
	$(".submitButton").removeAttr("disabled");
	getAllAvailableSlots();
});

function saveUserData(){
	var responseData = {
			
	};
	var saveUserData = defaultProject.functions(cf_region_asia_south1).httpsCallable('saveUserData');
	saveUserData(responseData).then(function(result) {
		console.log("saveUserData:",result);
		var data = result.data.success;
	});
}

function saveFormData(){
	if(generatedstudentId != ""){
		return;
	}
	var parent = $("#parent_name").val();
	var kid_name = $("#kid_name").val();
	var countryCode = $("#countryCode").val();
	var country = $("#countryCode").find('option:selected').attr("country");
	var phone_number = $("#phone_number").val();
	var kid_grade = $("#kid_grade").val();
	var icheck = $("input[name='icheck']:checked").val();
	
	if(parent == ""){
		return errorAlert("Please fill parent name");
	}
	if(kid_name == ""){
		return errorAlert("Please fill student name");
	}
	if(phone_number == ""){
		return errorAlert("Please fill phone number");
	}
	
	if(phone_number.charAt(0) == "0"){
		phone_number = phone_number.slice(1);
	}
	if(phone_number.length < 7 || phone_number.length > 11){
		return errorAlert("Phone number length must be 7 to 11");
	}
	if(kid_grade == ""){
		return errorAlert("Please select student grade");
	}
	
	var studentId = "";
	for(var i=0;i<Math.min(4,kid_name.split(" ")[0].length);i++){
		studentId += kid_name.split(" ")[0].charAt(i);
	}
	while(studentId.length < 4){
		studentId += studentId.charAt(studentId.length-1);
	}
	studentId +=  Math.floor(1000 + Math.random() * 9000);
	studentId = studentId.toLowerCase();
	
	var timezone = "";
	var timezoneOffset = "";
	try {
		timezone = $("#countryCode").find('option:selected').attr("timeZone");
		timezoneOffset = $("#countryCode").find('option:selected').attr("timeZoneOffset");		
	} catch (e) {
		// TODO: handle exception
	}
	
	var data = {
			name :kid_name,
			parentsName :parent,
			grade : kid_grade,
			phoneNumber : countryCode+phone_number+"",
			country :country,
			countryCode : countryCode,
//			timezoneName : newStudentForm_timezone,
//			timezoneOffset : $('#newStudentForm_timezone').find('option:selected').attr("offset"),
			icheck : icheck,
			timezoneName : timezone,
			timezoneOffset : timezoneOffset,
			createdAt : new Date()
	};
	db_firestore.collection('demoFormDataCollection').doc(studentId)
	.set(data, { merge: true })
	.then(function() {
		generatedstudentId = studentId;
		$("#showSuccessPopup").show();
	}).catch(function(error) {
		errorAlert("Error!");
	});	
}

function getAllAvailableSlots(){
	var responseData = {};
	var getAllAvailableSlots = defaultProject.functions(cf_region).httpsCallable('getAllAvailableSlots');
	getAllAvailableSlots(responseData).then(function(result) {
		console.log("getAllAvailableSlots:",result);
		var data = result.data.success;
		getAllAvailableSlotsData = result.data.success;
		getAllAvailableSlotsData = sortObject(getAllAvailableSlotsData);
		$(".demoBookingDateDropDown").html('<option value="">--choose--</option>');
		try {
			for(key in getAllAvailableSlotsData){
				$(".demoBookingDateDropDown").append('<option value="'+key+'">'+moment(parseInt(key)).format("DD MMM hh:mm a")+'</option>');
			}
			//showAllAvailableSlotsForDemoBooking(true);
		} catch (e) {
			console.log(e);
			// TODO: handle exception
		}
	});
	
	$(".demoBookingTeacherListDropDown").on('change', function() {
		var teacher = this.value.trim();
		showAllAvailableSlotsForDemoBooking(false);
	});
	$(".demoBookingDateDropDown").on('change', function() {
		var date = this.value.trim();
		showAllAvailableSlotsForDemoBooking(false);
	});
	$('.demoBookingCategoryDropDown').on('change', function() {
		var category = this.value.trim();
		showAllAvailableSlotsForDemoBooking(false);
	});
}

function showAllAvailableSlotsForDemoBooking(isFirstTime){
	//console.log("showAllAvailableSlotsForDemoBooking",getAllAvailableSlotsData);
	var data = getAllAvailableSlotsData;
	var html = "";
	var teacherList = {};
	var dateList = {};
	var teacherChoosen = $(".demoBookingTeacherListDropDown").val();
	var dateChoosen = $(".demoBookingDateDropDown").val();
	var categoryChoosen = $('.demoBookingCategoryDropDown').val();
	$("#demoBookingTable").html('<tr><th>Date</th><th>Time</th><th>Teachers</th></tr>');
	
	for(key in data){
		var obj = data[key];
		var teachers = "";
		var teacherChoosenArr0 = {};
		for(key1 in obj){
			if(getUrlParam("showHiddenTeachers","") == "true"){
				
			}else{
				if(teacherListData[key1] != undefined && teacherListData[key1].isPublic != undefined){
					if(!teacherListData[key1].isPublic){
						console.log("key1:"+key1);
						continue;
					}
				}
			}
			var arr = obj[key1];
			for(var i=0;i<arr.length;i++){
				if(arr[i] != undefined){
					for(var j=0;j<arr[i].subjectCategoriesTaught.length;j++){
						subjectCategoriesTaught[arr[i].subjectCategoriesTaught[j]] = "";
					}
				}
			}
			if(categoryChoosen == "all" || arr[0].subjectCategoriesTaught.includes(categoryChoosen)){
				if(teacherChoosen == "all"){
					teachers += '<span style="color:#8950FC;cursor:pointer;" title="'+key1+'" onclick="show_m_admin_calendar_bookSlot(\''+key+'\',\''+key1+'\')">'+arr[0].name+'</span>,  ';	
				}else if(key1 == teacherChoosen){
					teachers += '<span style="color:#8950FC;cursor:pointer;" title="'+key1+'" onclick="show_m_admin_calendar_bookSlot(\''+key+'\',\''+key1+'\')">'+arr[0].name+'</span>,  ';
				}
			}
			
			teacherList[key1] = arr[0].name;
		}
		teachers = teachers.substring(0,teachers.length-1);
		key = parseInt(key);
		dateList[moment(key).format("DD MMM")] = "";
		console.log("dateList",dateList);
//		console.log("key:"+key+"/"+moment(key).format("DD MMM"));
		var isConditionSatisfy = false;
		if(teacherChoosen == "all"){
			if(dateChoosen == "all"){
//				if(categoryChoosen == "all"){
//					isConditionSatisfy = true;					
//				}else if(arr[0].subjectCategoriesTaught.includes(categoryChoosen)){
//					isConditionSatisfy = true;
//				}
				isConditionSatisfy = true;
			}else if(dateChoosen == moment(key).format("DD MMM")){
//				if(categoryChoosen == "all"){
//					isConditionSatisfy = true;					
//				}else if(arr[0].subjectCategoriesTaught.includes(categoryChoosen)){
//					isConditionSatisfy = true;
//				}
				isConditionSatisfy = true;
			}
		}else if(teachers.indexOf(teacherChoosen) > -1){
			if(dateChoosen == "all"){
//				if(categoryChoosen == "all"){
//					isConditionSatisfy = true;					
//				}else if(arr[0].subjectCategoriesTaught.includes(categoryChoosen)){
//					isConditionSatisfy = true;
//				}
				isConditionSatisfy = true;
			}else if(dateChoosen == moment(key).format("DD MMM")){
//				if(categoryChoosen == "all"){
//					isConditionSatisfy = true;					
//				}else if(arr[0].subjectCategoriesTaught.includes(categoryChoosen)){
//					isConditionSatisfy = true;
//				}
				isConditionSatisfy = true;
			}
		}
		/*
		if(teacherChoosen == "all"){
			if(dateChoosen == "all"){
				html += '<tr><td style="width:70px;">'+moment(key).format("DD MMM")+'</td><td style="width: 85px;">'+moment(key).format("hh:mm a")+'-<br>'+moment(key+60*60*1000).format("hh:mm a")+'</td><td>'+teachers+'</td></tr>';
			}else if(dateChoosen == moment(key).format("DD MMM")){
				html += '<tr><td style="width:70px;">'+moment(key).format("DD MMM")+'</td><td style="width: 85px;">'+moment(key).format("hh:mm a")+'-<br>'+moment(key+60*60*1000).format("hh:mm a")+'</td><td>'+teachers+'</td></tr>';
			}
		}else if(teachers.indexOf(teacherChoosen) > -1){
			if(dateChoosen == "all"){
				html += '<tr><td style="width:70px;">'+moment(key).format("DD MMM")+'</td><td style="width: 85px;">'+moment(key).format("hh:mm a")+'-<br>'+moment(key+60*60*1000).format("hh:mm a")+'</td><td>'+teachers+'</td></tr>';
			}else if(dateChoosen == moment(key).format("DD MMM")){
				html += '<tr><td style="width:70px;">'+moment(key).format("DD MMM")+'</td><td style="width: 85px;">'+moment(key).format("hh:mm a")+'-<br>'+moment(key+60*60*1000).format("hh:mm a")+'</td><td>'+teachers+'</td></tr>';
			}
		}
		*/
		if(isConditionSatisfy && teachers != ""){
			html += '<tr><td style="width:70px;">'+moment(key).format("DD MMM")+'</td><td style="width: 85px;">'+moment(key).format("hh:mm a")+'-<br>'+moment(key+60*60*1000).format("hh:mm a")+'</td><td>'+teachers+'</td></tr>';
		}
	}
	$("#demoBookingTable").append(html);
	
	if(isFirstTime){
		for(key2 in subjectCategoriesTaught){
			$(".demoBookingCategoryDropDown").append('<option value="'+key2+'">'+key2+'</option>');
		}
		for(key in dateList){
			$(".demoBookingDateDropDown").append('<option value="'+key+'">'+key+'</option>');
		}
		teacherList = sortObject(teacherList);
		for(key in teacherList){
			$(".demoBookingTeacherListDropDown").append('<option value="'+key+'">'+key+'('+teacherList[key]+')</option>');
		}
	}
}

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

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