// const { request, get } = require("http");

swift = document.querySelector(".swift");
swift.onclick = function() {
    navBar = document.querySelector(".nav-bar");
    navBar.classList.toggle("active");
}

/*
// For backend testing purposes only (Do not remove this, if necessary, you may comment this part out)
// Start of backend testing part
function SendTestRequestToServer(selected_method, selected_url_path, selected_body_str = "")
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

    if (selected_body_str == "")
    {
        test_request.send();
    }
    else
    {
        // console.log(JSON.stringify(selected_body));

        test_request.send(selected_body_str);
    }
}

SendTestRequestToServer("PUT", "/update_health_article", JSON.stringify({
    HealthArticlePostID: 7,
    Title: "The benefits of eating oranges",
    Content: "Eating oranges can benefit a person in several different ways. For instance, an orange a day might still be able to keep the doctor away..."
}));
// End of backend testing part
*/