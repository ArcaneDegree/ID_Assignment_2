// const { request, get } = require("http");

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

swift = document.querySelector(".swift");
swift.onclick = function() {
    navBar = document.querySelector(".nav-bar");
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
function SendTestRequestToServer(selected_method, selected_url_path, selected_body_str = "")
{
    test_request = new XMLHttpRequest();

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

QueryDB("member", "get_all", null, (request_obj) =>
{
    console.log("Response status code: " + request_obj.status);

    console.log("Response received: " + request_obj.responseText);
});
// End of backend testing part