// const { request, get } = require("http");

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

/*
// For backend testing purposes only (Do not remove this, if necessary, you may comment this part out)
// Start of backend testing part
function SendTestRequestToServer(selected_method, selected_url_path, selected_body = null)
{
    test_request = new XMLHttpRequest();

    test_request.onreadystatechange = function()
    {
        if (test_request.readyState == XMLHttpRequest.DONE)
        {
            if (test_request.status == 200)
            {
                console.log(`Response received: ${test_request.responseText}`);
            }
            else
            {
                console.log(`Response status code: ${test_request.status}`);
            }
        }
    }

    test_request.open(selected_method.toUpperCase(), selected_url_path, true);

    if (selected_body == null)
    {
        test_request.send();
    }
    else
    {
        test_request.send(selected_body);
    }
}

SendTestRequestToServer("GET", "/get_all_health_articles");
// End of backend testing part
*/