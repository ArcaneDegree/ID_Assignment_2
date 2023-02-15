const FastDocAPI = LoadFastDocAPI();

const max_review_stars = 5;

let services_div = document.getElementById("services_div");

let doctor_cards_div = document.getElementById("doctor_cards_div");

let doctor_review_cards_div = document.getElementById("doctor_review_cards_div");

let health_articles_container_div = document.getElementById("health_articles_container");

function ServicesDivInitializationProc()
{
  for (let current_index = 0; current_index < services_div.children.length; current_index++)
  {
    if (services_div.children[current_index].className == "service")
    {
      services_div.children[current_index].addEventListener("click", (mouse_event) =>
      {
        sessionStorage.setItem("initial_service_selection_key", services_div.children[current_index].id.replace("_div", ""));

        FastDocAPI.GetServiceBookingPageLink((request_obj) =>
        {
          if (request_obj.responseText.includes(".html") == true)
          {
            window.location.href = request_obj.responseText;
          }
          else
          {
            // alert("Please login first to book a service.");

            login_status_label.innerText = "Please login first to book a service.";

            login_status_div.style.display = "flex";

            login_form_div.style.display = "block";
          }
        });
      });
    }
  }
}

if (sessionStorage.getItem("session_token") == null)
{
  FastDocAPI.GetSessionToken();
}

ServicesDivInitializationProc();

FastDocAPI.InitDoctorCards(doctor_cards_div);

FastDocAPI.InitDoctorReviewCards(doctor_review_cards_div);

FastDocAPI.InitHealthArticleCards(health_articles_container_div);

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
  const duration = 75;
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
                // modal.style.display = "none";
            }
        }        


// Login form

// Fixed a bug causing the login form panel to not be hidden when the X button was clicked.
// The fix only involved removing the "for" tag from the label that represented the X button.
document.addEventListener("DOMContentLoaded", function() {
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", function() {
    const loginForm = document.getElementById("login-form");
    loginForm.style.display = "none";
  });
});

// Update additions
let email_address_input_box = document.getElementById("email_address_input_box");

let passwd_input_box = document.getElementById("passwd_input_box");

let login_form = document.getElementById("actual_login_form");

let login_form_div = document.getElementById("login-form");

let nav_bar_login_logout_btn = document.getElementById("show");

let login_form_cross_close_label = document.getElementById("login_form_cross_close_label");

let login_status_div = document.getElementById("login_status_div");

let login_status_label = document.getElementById("login_status_label");

let sign_up_link_a = document.getElementById("sign_up_link_a");

let input_boxes_arr = document.getElementsByClassName("data_input_box");

FastDocAPI.IsLoggedIn((request_obj) =>
{
  if (request_obj.responseText == "true")
  {
    nav_bar_login_logout_btn.textContent = "Logout";
  }
  else if (request_obj.responseText == "false")
  {
    nav_bar_login_logout_btn.textContent = "Login";
  }
});

for (let current_input_box_index = 0; current_input_box_index < input_boxes_arr.length; current_input_box_index++)
{
  input_boxes_arr[current_input_box_index].addEventListener("focus", (event_obj) =>
  {
    login_status_div.style.display = "none";
  });
}

login_form.addEventListener("submit", (submit_event) =>
{
  // alert("Processing form submission.");

  submit_event.preventDefault();

  login_status_label.innerText = "Logging in...";

  login_status_div.style.display = "flex";

  FastDocAPI.LoginToAccount(email_address_input_box.value, passwd_input_box.value, (request_obj) =>
  {
    // console.log("Response received: " + request_obj.responseText);

    if (request_obj.responseText != "Invalid login credentials provided.")
    {
      // Login successful.
      // alert("Login successful.");

      sessionStorage.setItem("session_token", request_obj.responseText);

      login_status_label.innerText = "Logged in successfully.";

      login_form_div.style.display = "none";

      nav_bar_login_logout_btn.textContent = "Logout";
    }
    else
    {
      // Login unsuccessful.
      // alert("Login unsuccessful.");

      login_status_label.innerText = "Incorrect account credentials entered. Please try again.";
    }
  });

  // alert("Form submission processed fully.");
});

nav_bar_login_logout_btn.addEventListener("click", (mouse_event) =>
{
  // alert("Login nav bar button was clicked.");

  FastDocAPI.IsLoggedIn((request_obj) =>
  {
    // If the user is currently logged in to an account, logout of the account.
    if (request_obj.responseText == "true")
    {
      FastDocAPI.LogoutOfAccount((request_obj) =>
      {
        sessionStorage.setItem("session_token", request_obj.responseText);

        nav_bar_login_logout_btn.textContent = "Login";
      });
    }
    // If the user is not logged into an account, show the login form.
    else if (request_obj.responseText == "false")
    {
      login_status_div.style.display = "none";

      login_form_div.style.display = "block";

      // alert("Opened login form.");
    }
  });
});

sign_up_link_a.addEventListener("click", (mouse_event) =>
{
  FastDocAPI.GetSignUpPageLink((request_obj) =>
  {
    if (request_obj.responseText.includes(".html") == true)
    {
      window.location.href = request_obj.responseText;
    }
  });
});

// Loader

