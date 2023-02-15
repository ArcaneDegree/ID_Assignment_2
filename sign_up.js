const FastDocAPI = LoadFastDocAPI();

let name_input_box = document.getElementById("name_input_box");

let email_address_input_box = document.getElementById("email_address_input_box");

let passwd_input_box = document.getElementById("passwd_input_box");

let sign_up_form = document.getElementById("sign_up_form");

let sign_up_status_box = document.getElementById("sign_up_status_box");

let sign_up_status_box_p = document.getElementById("sign_up_status_box_p");

let return_to_homepage_btn = document.getElementById("return_to_homepage_btn");

let input_boxes_arr = document.getElementsByClassName("inputBox");

function OnInputBoxFocused()
{
    sign_up_status_box.style.display = "none";
}

sign_up_status_box.style.display = "none";

for (let current_input_box_index = 0; current_input_box_index < input_boxes_arr.length; current_input_box_index++)
{
    input_boxes_arr[current_input_box_index].addEventListener("focus", OnInputBoxFocused);
}

sign_up_form.addEventListener("submit", (submit_event) =>
{
    submit_event.preventDefault();

    // alert("Form submitted.");

    sign_up_status_box_p.innerText = "Creating new account...";

    sign_up_status_box.style.display = "flex";

    FastDocAPI.SignUpNewMember(name_input_box.value, email_address_input_box.value, passwd_input_box.value, (request_obj) =>
    {
        if (request_obj.status == 200)
        {
            sign_up_status_box_p.innerText = request_obj.responseText;
        }
        else
        {
            sign_up_status_box_p.innerText = "An error occurred on the server while attempting to create your account. Please try again.";
        }
    });
});

return_to_homepage_btn.addEventListener("click", (mouse_event_obj) =>
{
    window.location.href = "/index.html";
});