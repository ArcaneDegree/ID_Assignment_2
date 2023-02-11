const FastDocAPI = LoadFastDocAPI();

const max_review_stars = 5;

function CreateDoctorCard(doctor_name, doctor_specialization, doctor_img_file_path)
{
  /*
  Blueprint for intended end result doctor card element:

  <div class="column">
    <div class="card">
      <div class="img-container">
        <img src="/images/pixomatic_1572877090227.png" />
      </div>
      <h3>Bryant Hall</h3>
      <br>
      <div class="role">General Doctor</div>
      <br>
      <div class="icons">
        <a href="#">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="#">
          <i class="fab fa-linkedin"></i>
        </a>
        <a href="#">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
    </div>
  </div>
  */

  let column_div = document.createElement("div");

  column_div.className = "column";

  let card_div = document.createElement("div");

  card_div.className = "card";

  let img_container_div = document.createElement("div");

  img_container_div.className = "img-container";

  let doctor_img = document.createElement("img");

  doctor_img.src = doctor_img_file_path;

  let doctor_name_h3_header = document.createElement("h3");

  doctor_name_h3_header.textContent = doctor_name;

  // Add line breaks manually later on
  
  let doctor_role_div = document.createElement("div");

  doctor_role_div.className = "role";

  doctor_role_div.innerText = doctor_specialization;

  let icons_div = document.createElement("div");

  icons_div.className = "icons";

  let twitter_icon_a = document.createElement("a");

  twitter_icon_a.href = "#";

  let twitter_icon_i = document.createElement("i");

  twitter_icon_i.className = "fab fa-twitter";

  let linkedin_icon_a = document.createElement("a");

  linkedin_icon_a.href = "#";

  let linkedin_icon_i = document.createElement("i");

  linkedin_icon_i.className = "fab fa-linkedin";

  let envelope_icon_a = document.createElement("a");

  envelope_icon_a.href = "#";

  let envelope_icon_i = document.createElement("i");

  envelope_icon_i.className = "fas fa-envelope";

  twitter_icon_a.appendChild(twitter_icon_i);

  linkedin_icon_a.appendChild(linkedin_icon_i);

  envelope_icon_a.appendChild(envelope_icon_i);

  img_container_div.appendChild(doctor_img);

  icons_div.appendChild(twitter_icon_a);

  icons_div.appendChild(linkedin_icon_a);

  icons_div.appendChild(envelope_icon_a);

  card_div.appendChild(img_container_div);

  card_div.appendChild(doctor_name_h3_header);

  card_div.appendChild(document.createElement("br"));

  card_div.appendChild(doctor_role_div);

  card_div.appendChild(document.createElement("br"));

  card_div.appendChild(icons_div);

  column_div.appendChild(card_div);

  return column_div;
}

// Initializes the doctor cards under the "Our Doctors" section of the webpage.
function InitDoctorCards()
{
  FastDocAPI.GetAllDoctors((request_obj) =>
  {
    // console.log("Response received: " + request_obj.responseText);

    let doctor_obj_arr = JSON.parse(request_obj.responseText);

    // console.log("Response received in InitDoctorCards function: " + request_obj.responseText);

    let doctor_cards_div = document.getElementById("doctor_cards_div");

    doctor_cards_div.innerHTML = "";

    for (let doctor_index = 0; doctor_index < doctor_obj_arr.length; doctor_index++)
    {
      doctor_cards_div.appendChild(CreateDoctorCard(
        doctor_obj_arr[doctor_index].Name,
        doctor_obj_arr[doctor_index].Specialization,
        doctor_obj_arr[doctor_index].DoctorImgFilePath
      ));
    }
  });
}

function CreateDoctorReviewCard(member_name, member_img_file_path, review_star_count, review_content)
{
  /*
  Blueprint for doctor review card element:

  <div class="col">
    <div class="review">
      <img src="images/blueshirtman.jpeg" alt="">
      <div class="name">Frank</div>
      <div class="stars">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="far fa-star"></i>
      </div>
        
      <p>
          "Dr. Hall is a competent and knowledgeable doctor. My visit was pleasant and I felt heard and understood. The only reason I give 4 stars instead of 5 is due to a slight wait time during the online meeting."
      </p>
    </div>
  </div>
  */

  let col_div = document.createElement("div");
  
  col_div.className = "col";

  let review_div = document.createElement("div");

  review_div.className = "review";

  let member_img = document.createElement("img");

  member_img.src = member_img_file_path;

  let name_div = document.createElement("div");

  name_div.className = "name";

  name_div.innerText = member_name;

  let stars_div = document.createElement("div");

  stars_div.className = "stars";

  for (let index = 0; index < review_star_count; index++)
  {
    let star_i = document.createElement("i");

    star_i.className = "fas fa-star";

    stars_div.appendChild(star_i);
  }

  for (let index = 0; index < max_review_stars - review_star_count; index++)
  {
    let star_i = document.createElement("i");

    star_i.className = "far fa-star";

    stars_div.appendChild(star_i);
  }

  let review_content_p = document.createElement("p");

  review_content_p.innerText = `"` + review_content + `"`;

  review_div.appendChild(member_img);

  review_div.appendChild(name_div);

  review_div.appendChild(stars_div);

  review_div.appendChild(review_content_p);

  col_div.appendChild(review_div);

  return col_div;
}

// Initializes the doctor review cards under the "Reviews" section of the webpage.
function InitDoctorReviewCards()
{
  FastDocAPI.SendRequestToServerDB(
    "single",
    [
      new FastDocAPI.LocalDBCommand(
        "SELECT * FROM DoctorReview INNER JOIN Member ON DoctorReview.ReviewingMemberID = Member.MemberID;",
        [],
        null
      )
    ],
    (request_obj) =>
    {
      let doctor_review_cards_div = document.getElementById("doctor_review_cards_div");

      let doctor_review_obj_arr = JSON.parse(request_obj.responseText);

      doctor_review_cards_div.innerHTML = "";

      // console.log("Response received in InitDoctorReviewCards function: " + request_obj.responseText);

      for (let doctor_review_index = 0; doctor_review_index < doctor_review_obj_arr.length; doctor_review_index++)
      {
        doctor_review_cards_div.appendChild(CreateDoctorReviewCard(
          doctor_review_obj_arr[doctor_review_index].Name,
          doctor_review_obj_arr[doctor_review_index].MemberImgFilePath,
          doctor_review_obj_arr[doctor_review_index].ReviewStarCount,
          doctor_review_obj_arr[doctor_review_index].Content
        ));
      }
    }
  );
}

function AddHealthArticlePostTestDataToServerDB()
{
  // Issue: There was a ' character (a single quotation mark character, which is a special
  // character in SQLite) in the "isn't" word in the first column's value, causing an SQLite
  // error with the following message to be thrown: "SQLITE_ERROR: near "t": syntax error".
  
  // Solution: Have a function that scans for these special characters and appends an escape
  // character in front of each special character.

  /*
  // Bad version of statement 1 (gives an error)
  FastDocAPI.AddHealthArticlePost(
    "Fungal infections are becoming more common. Why isn't there a vaccine?",
    "https://www.nbcnews.com/health/health-news/fungal-infections-are-becoming-common-isnt-vaccine-rcna68791",
    "images/230203-candida-fungi-mn-1500-80eef0.webp",
    null
  );
  */

  // Good version of statement 1 (does not give an error)
  FastDocAPI.AddHealthArticlePost(
    "Fungal infections are becoming more common. Why isnt there a vaccine?",
    "https://www.nbcnews.com/health/health-news/fungal-infections-are-becoming-common-isnt-vaccine-rcna68791",
    "images/230203-candida-fungi-mn-1500-80eef0.webp",
    null
  );

  // Good (does not give an error)
  FastDocAPI.AddHealthArticlePost(
    "Norovirus appears to be spreading as rate of positive tests spikes.",
    "https://www.nbcnews.com/health/health-news/norovirus-spreading-symptoms-rcna69928",
    "images/230209-norovirus-annual-high-kh-57749a.webp",
    null
  );

  // Good (does not give an error)
  FastDocAPI.AddHealthArticlePost(
    "A calorie-restricted diet may slow aging in healthy adults, research finds.",
    "https://www.nbcnews.com/health/health-news/calorie-restricted-diet-may-slow-aging-healthy-adults-science-shows-rcna69562",
    "images/230208-small-salad-stock-calorie-restriction-mn-1615-416493.webp",
    null
  );
}

function CreateHealthArticleCard(health_article_preview_title, health_article_url_link, health_article_img_file_path, health_article_creation_date_str)
{
  /*
  Blueprint for health article card element:

  <div>
    <div class="articles-box">
      <div class="articles-img">
        <img src="images/230203-candida-fungi-mn-1500-80eef0.webp" alt="Article" class="center2">
      </div>
    </div>
    
    <div class="articles-text">
      <span>10 Feb 2023 / Microorganism</span>
      <a href="#" class="articles-title">Fungal infections are becoming more common. Why isn't there a vaccine?</a>
      <a href="https://www.nbcnews.com/health/health-news/fungal-infections-are-becoming-common-isnt-vaccine-rcna68791">Read More</a>
    </div>
  </div>
  */

  let article_container_div = document.createElement("div");

  let articles_box_div = document.createElement("div");

  articles_box_div.className = "articles-box";

  let articles_img_div = document.createElement("div");

  articles_img_div.className = "articles-img";

  let article_img = document.createElement("img");

  article_img.src = health_article_img_file_path;

  article_img.alt = "Article";

  article_img.className = "center2";

  let articles_text_div = document.createElement("div");

  articles_text_div.className = "articles-text";

  let article_creation_date_str_span = document.createElement("span");

  let health_article_creation_date_obj = FastDocAPI.ConvertDateTimeStrToDateObj(health_article_creation_date_str + " 00:00:00");

  article_creation_date_str_span.innerText = health_article_creation_date_obj.getDate() + " " + FastDocAPI.GetMonthNameFromDateStr(health_article_creation_date_str) + " " + health_article_creation_date_obj.getFullYear();

  let articles_title_a = document.createElement("a");

  articles_title_a.href = "#";

  articles_title_a.className = "articles-title";

  articles_title_a.innerText = health_article_preview_title;

  let article_url_link_a = document.createElement("a");

  article_url_link_a.href = health_article_url_link;

  article_url_link_a.innerText = "Read More";

  articles_img_div.appendChild(article_img);

  articles_box_div.appendChild(articles_img_div);

  articles_text_div.appendChild(article_creation_date_str_span);

  articles_text_div.appendChild(articles_title_a);

  articles_text_div.appendChild(article_url_link_a);

  article_container_div.appendChild(articles_box_div);

  article_container_div.appendChild(articles_text_div);

  return article_container_div;
}

function InitHealthArticleCards()
{
  FastDocAPI.GetAllHealthArticlePosts((request_obj) =>
  {
    let health_articles_container_div = document.getElementById("health_articles_container");

    let health_article_post_obj_arr = JSON.parse(request_obj.responseText);

    health_articles_container_div.innerHTML = "";

    for (let index = 0; index < health_article_post_obj_arr.length; index++)
    {
      health_articles_container_div.appendChild(
        CreateHealthArticleCard(
          health_article_post_obj_arr[index].PreviewTitle,
          health_article_post_obj_arr[index].HealthArticleURLLink,
          health_article_post_obj_arr[index].HealthArticlePostImgFilePath,
          health_article_post_obj_arr[index].HealthArticlePostCreationDate
        )
      );
    }
  });
}

sessionStorage.setItem("current_user_session", null);

InitDoctorCards();

InitDoctorReviewCards();

InitHealthArticleCards();

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
                modal.style.display = "none";
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

login_form.addEventListener("submit", (submit_event) =>
{
  submit_event.preventDefault();

  // alert("Processing form submission.");

  FastDocAPI.GetMembers(
    [
      `EmailAddress = '${email_address_input_box.value}'`,
      `Passwd = '${passwd_input_box.value}'`
    ],
    (request_obj) =>
    {
      // console.log("Response received: " + request_obj.responseText);

      let member_obj_arr = JSON.parse(request_obj.responseText);

      if (member_obj_arr.length == 0)
      {
        // Login unsuccessful.
        // alert("Incorrect credentials entered.");
      }
      else
      {
        // Login successful.
        // alert("Logged in successfully.");

        sessionStorage.setItem("current_user_session", JSON.stringify(
          {
            MemberID: member_obj_arr[0].MemberID,
            EmailAddress: member_obj_arr[0].EmailAddress
          }
        ));

        email_address_input_box.value = "";

        passwd_input_box.value = "";

        login_form_div.style.display = "none";

        nav_bar_login_logout_btn.textContent = "Logout";
      }
    }
  );

  // alert("Form submission processed fully.");
});

nav_bar_login_logout_btn.addEventListener("click", (mouse_event) =>
{
  // alert("Login nav bar button was clicked.");

  // If the user is currently logged in to an account, logout of the account.
  if (JSON.parse(sessionStorage.getItem("current_user_session")) != null)
  {
    login_form_div.style.display = "none";

    sessionStorage.setItem("current_user_session", null);

    nav_bar_login_logout_btn.textContent = "Login";
  }
  // If the user is not logged into an account, show the login form.
  else
  {
    login_form_div.style.display = "block";

    // alert("Opened login form.");
  }
});

// Loader

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