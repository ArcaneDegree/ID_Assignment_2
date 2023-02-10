const FastDocAPI = LoadFastDocAPI();

// Add shadow on header while scrolling

$(window).scroll(function() {     
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
        $("header").addClass("active");
    }
    else {
        $("header").removeClass("active");
    }
});

// Scroll back to top button

const backToTopButton = document.querySelector("#back-to-top-btn");

window.addEventListener("scroll", scrollFunction);

function scrollFunction() {
  if (window.pageYOffset > 300) { // Show backToTopButton
    if(!backToTopButton.classList.contains("btnEntrance")) {
      backToTopButton.classList.remove("btnExit");
      backToTopButton.classList.add("btnEntrance");
      backToTopButton.style.display = "block";
    }
  }
  else { // Hide backToTopButton
    if(backToTopButton.classList.contains("btnEntrance")) {
      backToTopButton.classList.remove("btnEntrance");
      backToTopButton.classList.add("btnExit");
      setTimeout(function() {
        backToTopButton.style.display = "none";
      }, 250);
    }
  }
}

backToTopButton.addEventListener("click", smoothScrollBackToTop);

// function backToTop() {
//   window.scrollTo(0, 0);
// }

function smoothScrollBackToTop() {
  const targetPosition = 0;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 750;
  let start = null;
  
  window.requestAnimationFrame(step);

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    window.scrollTo(0, easeInOutCubic(progress, startPosition, distance, duration));
    if (progress < duration) window.requestAnimationFrame(step);
  }
}

function easeInOutCubic(t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t + 2) + b;
};

// Navigation bar

let swift = document.querySelector(".swift");
swift.onclick = function() {
    let navBar = document.querySelector(".nav-bar");
    navBar.classList.toggle("active");
}

var x=document.getElementById('login');
		var y=document.getElementById('register');
		var z=document.getElementById('btn');
		function register()
		{
			x.style.left='-400px';
			y.style.left='50px';
			z.style.left='110px';
		}
		function login()
		{
			x.style.left='50px';
			y.style.left='450px';
			z.style.left='0px';
		}

        var modal = document.getElementById('login-form');
        window.onclick = function(event) 
        {
            if (event.target == modal) 
            {
                modal.style.display = "none";
            }
        }        

// For backend testing purposes only (Do not remove this, if necessary, you may comment this part out)
// Start of backend testing part
/*
function SendTestRequestToServer(selected_method, selected_url_path, selected_body_str = "")
{
    let test_request = new XMLHttpRequest();

    test_request.onreadystatechange = function()
    {
        if (test_request.readyState == XMLHttpRequest.DONE)
        {
            console.log(`Response status code: ${test_request.status}`);

            console.log(`Response received: ${test_request.responseText}`);
        }
    }

    // console.log("selected_body_str value: " + selected_body_str);

    if (selected_body_str != "")
    {
        test_request.open("POST", selected_url_path, true);

        test_request.send(selected_body_str);
    }
    else
    {
        test_request.open(selected_method.toUpperCase(), selected_url_path, true);

        test_request.send();
    }
}
*/

/*
FastDocAPI.SendRequestToServerDB("single", [
  new FastDocAPI.LocalDBCommand(
    "SELECT * FROM Member",
    [],
    null
  )
],
(request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.AddNewMember("Carl Jung", "interestingpassword55473", "carl_jung@gmail.com");
*/

/*
FastDocAPI.QueryRestDB("member", "get_all", "", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.GetRowsFromServerDBTableWithFilter("Member", "MemberID = 2", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.GetAllRowsFromServerDBTable("Member", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.UpdateRowsInServerDBTableWithFilter("Member", "MemberID = 2 AND Name = 'Damon Pok'", "Name = 'Daemon Pock', Passwd = 'pwddaemon', EmailAddress = 'daemon_pock@outlook.edu'", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.DeleteRowsInServerDBTableWithFilter("Member", "MemberID = 4 AND Name = 'Julian Ee' AND Passwd = 'a'", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
let new_member_name = "John Lee";

let new_member_passwd = "johnspw447d";

let new_member_email_address = "john_lee@gmail.com";

FastDocAPI.AddRowToServerDBTable("Member", "Name, Passwd, EmailAddress, PrivilegeType, CurrentStatus", `'${new_member_name}', '${new_member_passwd}', '${new_member_email_address}', 1, 0`, (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.AddNewMember("Steven Tan", "stevietnpwd", "steven_tan@gmail.com", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.GetMembers(null, "Chaim Soh", "nisl.sem.consequat@google.couk", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.UpdateMembers([
  "MemberID = 6",
  "Name = 'Carl Jung'",
  "Passwd = 'interestingpassword55473'"
],
[
  "Name = 'Carl Lim'",
  "Passwd = 'carlspwd'",
  "EmailAddress = 'carl_lim@gmail.com'"
],
(request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.DeleteMembers(
  [
    "MemberID = 3",
    "Name = 'Damian Soh'",
    "Passwd = 'nunc'"
  ],
  (request_obj) =>
  {
    console.log("Response status code: " + request_obj.status);

    console.log("Response received: " + request_obj.responseText);
  }
)
*/

/*
FastDocAPI.AddAppointmentBooking(1, 1, "12/02/2023 15:00:00", (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});

FastDocAPI.AddFastDocTransaction(1, 1, 100.55, FastDocAPI.TransactionMethod.Credit_Card, (request_obj) =>
{
  console.log("Response status code: " + request_obj.status);

  console.log("Response received: " + request_obj.responseText);
});
*/

/*
FastDocAPI.DeleteAppointmentBooking(
  [
    "AppointmentBookingID = 1",
    "AppointmentDateTime = '12/02/2023 15:00:00'",
    "BookingMemberID = 1"
  ],
  (request_obj) =>
  {
    console.log("Response status code: " + request_obj.status);

    console.log("Response received: " + request_obj.responseText);
  }
);

FastDocAPI.DeleteFastDocTransaction(
  [
    "TransactionID = 1",
    "OriginMemberID = 1",
    "TransactionAmount = 100.55"
  ],
  (request_obj) =>
  {
    console.log("Response status code: " + request_obj.status);

    console.log("Response received: " + request_obj.responseText);
  }
);
*/
// End of backend testing part