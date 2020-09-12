var demoSlotData = [];
$(function(){
	$('[data-loader="circle-side"]').fadeOut(); // will first fade out the loading animation
		$('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
		$('body').delay(350);
		getDemoSlotData();
	})

function getDemoSlotData() {
	$.ajax({
		url : "https://us-central1-notchup-f203d.cloudfunctions.net/demoSlotData",
		type : "GET",
		dataType : "json",
		crossDomain:true,
		success : function(response) {
			demoSlotData = response.success;
			if(demoSlotData === undefined){
				alert("No demo slot available");
			} else {
				for(var i = 0 ; i< demoSlotData.length; i++){
					$("#courseName").append('<option value="'+demoSlotData[i]["course_id"]+'">'+demoSlotData[i]["course_name"]+'</option>');
				}
			}
		}
	});
}

function changeSlotData() {
	if($("#courseName").val() !=  "") {
		var courseId = $("#courseName").val();
		for (var i = 0; i < demoSlotData.length; i++) {
			if (demoSlotData[i]["course_id"] == courseId){
				var slotArray = demoSlotData[i]["slots"];
				setSlotData(slotArray);
				break;
			}
		}
	}
}

function setSlotData(slotArray) {
	$("#slot_time").empty();
	$("#slot_time").append('<option value="">Select Suitable Slot </option>');
	var minimumDate = new Date();
	minimumDate.setHours( minimumDate.getHours() + 4 );
	var maximumDate = new Date();
	maximumDate.setDate(maximumDate.getDate() + 7);
	for(var i = 0 ; i< slotArray.length; i++) {
		console.log(slotArray[i].slot);
		var dateVal = new Date(parseInt(slotArray[i].slot));
		if (dateVal.getTime() > minimumDate.getTime() && dateVal.getTime() < maximumDate.getTime()){
			$("#slot_time").append('<option value="'+slotArray[i].slot+'">'+dateVal+'</option>');
		}
	}
}

function saveFormData(){
	var parentName = $("#parent_name").val();
	var parentContactNumber = $("#parent_contact_number").val();
	var parentEmailId = $("#parent_emailId").val();
	var kid_name = $("#kid_name").val();
	var kid_age = $("#kid_age").val();
	var courseName = $("#courseName").val();
	var slot_time = $("#slot_time").val();
	
	if(parent == "" || parentContactNumber == "" || parentEmailId == ""){
		return alert("Please fill parent  details");
	}
	if(kid_name == ""){
		return alert("Please fill student name");
	}
	if(courseName == ""){
		return alert("Please fill courseName");
	}
	if(slot_time == ""){
		return alert("Please fill slot_time");
	}
	// saving data if all entry are valid 
	alert("Demo Booked Successfully");
	resetFormData()
}

function resetFormData() {
	$("#parent_name").val("");
	$("#parent_contact_number").val("");
	$("#parent_emailId").val("");
	$("#kid_name").val("");
	$("#kid_age").val("");
	$("#courseName").val("");
	$("#slot_time").val("");
}
