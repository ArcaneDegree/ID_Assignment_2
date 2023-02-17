function LoadFastDocAPI()
{
    var current_cors_api_key = "63e0ee103bc6b255ed0c46f7";

    var db_host_name = "interactivedevasg2db-e461.restdb.io";

    var current_working_dir_path = "";

    const TransactionMethod = {
        CreditCard: 0
    }

    const PrivilegeType = {
        Guest: 0,
        NormalMember: 1,
        Doctor: 2,
        Administrator: 3
    }

    const ActivityStatusType = {
        Offline: 0,
        Online: 1
    }

    const FastDocServiceType = {
        OnlineDoctorConsultation: 0,
        ClinicAppointment: 1,
        MedicalCertificate: 2,
        HealthScreening: 3,
        Vaccination: 4,
        BehavioralHealthService: 5
    }

    // Note: The function passed to the response_received_callback_function parameter of this function
    // should take in the following parameters:
    // 1.) request_obj (Type: XMLHttpRequest)
    function SendRequestToServer(request_url, request_method, request_body_str, response_received_callback_function)
    {
        let request = new XMLHttpRequest();

        request.open(request_method.toUpperCase(), request_url, true);

        request.addEventListener("readystatechange", (event_obj) =>
        {
            if (request.readyState == XMLHttpRequest.DONE)
            {
                if (response_received_callback_function != null)
                {
                    response_received_callback_function(request);
                }
            }
        });

        request.send(request_body_str);
    }

    function GetCharCountInStr(str, selected_char)
    {
        let selected_char_occurrence_count = 0;

        for (let current_char_index = 0; current_char_index < str.length; current_char_index++)
        {
            if (str[current_char_index] == selected_char)
            {
                selected_char_occurrence_count++;
            }
        }

        return selected_char_occurrence_count;
    }

    function ReplaceCharInStrAt(new_char, replacement_index, str)
    {
        if (replacement_index > str.length - 1 || replacement_index < 0)
        {
            return str;
        }

        return str.substring(0, replacement_index) + new_char + str.substring(replacement_index + 1);
    }

    function CapitalizeStr(str)
    {
        str = ReplaceCharInStrAt(str[0].toUpperCase(), 0, str.toLowerCase());

        return str;
    }

    function DeriveStandardIdentifierAttribNameFromTableName(table_name)
    {
        let alt_table_name = "";

        let dash_count = GetCharCountInStr(table_name, '-');

        if (dash_count > 0)
        {
            let table_name_parts = table_name.split("-");

            for (let table_name_part_index = 0; table_name_part_index < table_name_parts.length; table_name_part_index++)
            {
                alt_table_name += CapitalizeStr(table_name_parts[table_name_part_index]);
            }
        }
        else
        {
            alt_table_name = CapitalizeStr(table_name);
        }

        alt_table_name += "ID";

        return alt_table_name;
    }

    function GetDBTablePath(table_name)
    {
        return `/rest/${table_name.toLowerCase()}`;
    }

    // The callback function passed into the SendRequestToRestDB function must have the
    // following parameters:
    // 1.) request (type: XMLHttpRequest)
    function SendRequestToRestDB(selected_method, selected_table_name, selected_query, selected_body_obj, callback_function)
    {
        let settings = {
            "url": `https://${db_host_name}${GetDBTablePath(selected_table_name)}${selected_query}`,
            "method": selected_method.toUpperCase(),
            "headers": {
            "content-type": "application/json",
            "x-apikey": `${current_cors_api_key}`,
            "cache-control": "no-cache"
            }
        };

        $.ajax(settings).done(callback_function);

        /*
        let db_request = new XMLHttpRequest();

        db_request.withCredentials = true;

        if (callback_function != null)
        {
            db_request.addEventListener("readystatechange", function()
            {
                if (db_request.readyState == XMLHttpRequest.DONE)
                {
                    callback_function(db_request);
                }
            });
        }

        db_request.open(selected_method.toUpperCase(), `https://${db_host_name}${GetDBTablePath(selected_table_name)}${selected_query}`);

        db_request.setRequestHeader("content-type", "application/json");

        db_request.setRequestHeader("x-apikey", current_cors_api_key);

        db_request.setRequestHeader("cache-control", "no-cache");

        db_request.send(selected_body_obj);
        */
    }

    function ParseRequestBody(request_body_str)
    {
        // console.log(request_body_str);

        let request_details_obj = null;

        try
        {
            // console.log(`Request body: ${request_body_str}`);

            request_details_obj = JSON.parse(request_body_str);
        }
        catch(error)
        {
            console.log(`Error in ParseRequestBody function: ${error.message}`);

            request_details_obj = null;
        }

        if (request_details_obj == null)
        {
            console.log("Error in ParseRequestBody function: request_details_obj is null.");
        }

        return request_details_obj;
    }

    // Just like in the SendRequestToRestDB function, the callback function passed into
    // the QueryRestDB function must have the following parameters:
    // 1.) request (type: XMLHttpRequest)
    function QueryRestDB(selected_table_name, selected_action, request_body_obj, callback_function)
    {
        request_body_obj.session_token = sessionStorage.getItem("session_token");

        // Status after testing: Working.
        if (selected_action == "get_all")
        {
            SendRequestToRestDB("GET", selected_table_name, "", null, callback_function);
        }
        // Status after testing: Working.
        else if (selected_action == "get")
        {
            if (request_body_obj == null)
            {
                return;
            }

            let query_str = "?q=";

            query_str += JSON.stringify(request_body_obj);

            SendRequestToRestDB("GET", selected_table_name, query_str, null, callback_function);
        }
        // Status after testing: Pending.
        else if (selected_action == "add")
        {
            if (request_body_obj == null)
            {
                return;
            }

            SendRequestToRestDB("POST", selected_table_name, "", request_body_obj, callback_function);
        }
        // Status after testing: Pending.
        else if (selected_action == "update")
        {
            let selected_table_main_id_attrib_name = DeriveStandardIdentifierAttribNameFromTableName(selected_table_name);

            // console.log("selected_table_main_id_attrib_name value: " + selected_table_main_id_attrib_name);

            SendRequestToRestDB("GET", selected_table_name, `?q={"${selected_table_main_id_attrib_name}": ${request_body_obj[selected_table_main_id_attrib_name]}}`, null, (request_obj) =>
            {
                let body_obj_arr = JSON.parse(request_obj.responseText);

                let selected_record_db_sys_id = body_obj_arr[0]._id;

                // console.log("QueryRestDB result body value: " + body_obj_arr);

                // console.log("QueryRestDB result body stringified value: " + JSON.stringify(body_obj_arr));

                // console.log("Request body obj JSON string value: " + JSON.stringify(request_body_obj));

                SendRequestToRestDB("PUT", selected_table_name, `/${selected_record_db_sys_id}`, request_body_obj, callback_function);
            });
        }
        // Status after testing: Pending.
        else if (selected_action == "delete")
        {
            if (request_body_obj == null)
            {
                return;
            }

            let query_str = "/*?q=";

            query_str += JSON.stringify(request_body_obj);

            SendRequestToRestDB("DELETE", selected_table_name, query_str, null, callback_function);
        }
        // Status after testing: Pending.
        else
        {
            console.log("Error in QueryRestDB function: Invalid/unsupported action passed into QueryRestDB function.");
        }
    }

    // Note: The implementations of these API functions work with the server's local database and
    // not the remote RestDB database.
    // Note: Restrictions imposed on new member registrations:
    // 1.) New member's name cannot be the same as the names of other registered members.
    // 2.) New member's email address cannot be the same as the email addresses of other registered
    // members.
    // Note: datetime format for all datetime attributes is 'DD/MM/YYYY hh:mm:ss'.

    // API functions for miscellaneous utilities.

    // Status after testing: Working.
    // Note: This function is meant to serve as a base helper function.
    // Note: The format for the datetime string returned is 'DD/MM/YYYY hh:mm:ss'.
    function ConvertDateObjToDateTimeStr(date_obj)
    {
        let date_year = date_obj.getFullYear();

        let date_month = date_obj.getMonth() + 1;

        let date_day = date_obj.getDate();

        let date_hour = date_obj.getHours();

        let date_minute = date_obj.getMinutes();

        let date_second = date_obj.getSeconds();

        return `${date_day}/${date_month}/${date_year} ${date_hour}:${date_minute}:${date_second}`;
    }

    // Status after testing: Pending.
    // Note: This function is meant to serve as a base helper function.
    // Note: The format for the datetime string passed into this function should be
    // 'DD/MM/YYYY hh:mm:ss'.
    function ConvertDateTimeStrToDateObj(date_str)
    {
        let date_part_str = date_str.split(" ")[0];

        let time_part_str = date_str.split(" ")[1];

        let day_num = parseInt(date_part_str.split("/")[0]);

        let month_num = parseInt(date_part_str.split("/")[1]);

        let year_num = parseInt(date_part_str.split("/")[2]);

        let hour_num = parseInt(time_part_str.split(":")[0]);

        let minute_num = parseInt(time_part_str.split(":")[1]);

        let second_num = parseInt(time_part_str.split(":")[2]);

        return new Date(year_num, month_num - 1, day_num, hour_num, minute_num, second_num, 0);
    }

    // Status after testing: Pending.
    // Note: This function is meant to serve as a base helper function.
    function ConvertDateObjToDateStr(date_obj)
    {
        let date_year = date_obj.getFullYear();

        let date_month = date_obj.getMonth() + 1;

        let date_day = date_obj.getDate();

        return `${date_day}/${date_month}/${date_year}`;
    }

    // Status after testing: Pending.
    // The value of date_str must be in the following format: DD/MM/YYYY
    function GetMonthNameFromDateStr(date_str)
    {
        let month_num = parseInt(date_str.split("/")[1]);

        let date_obj = new Date();

        date_obj.setMonth(month_num - 1);

        return date_obj.toLocaleString("en-US", {month: "long"});
    }

    function GetSessionToken()
    {
        SendRequestToServer("/get_session_token", "GET", "", (request_obj) =>
        {
            sessionStorage.setItem("session_token", request_obj.responseText);
        });
    }

    function LoginToAccount(email_address, passwd, response_received_callback_function)
    {
        SendRequestToServer("/login_to_acc", "POST", JSON.stringify(
            {
                email_address: email_address,
                passwd: passwd,
                session_token: sessionStorage.getItem("session_token")
            }
        ),
        response_received_callback_function
        );
    }

    function LogoutOfAccount(response_received_callback_function)
    {
        SendRequestToServer("/logout_of_acc", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }), response_received_callback_function);
    }

    function GetInfoForDoctorCards(response_received_callback_function)
    {
        SendRequestToServer("/get_info_for_doctor_cards", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }), response_received_callback_function);
    }

    async function CreateDoctorCard(doctor_name, doctor_specialization, doctor_img_file_path)
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

        doctor_cards_div.appendChild(column_div);
    }

    // Initializes the doctor cards under the "Our Doctors" section of the webpage.
    async function InitDoctorCards(doctor_cards_div)
    {
        GetInfoForDoctorCards((request_obj) =>
        {
            // console.log("Response received: " + request_obj.responseText);

            let doctor_obj_arr = JSON.parse(request_obj.responseText);

            // console.log("Response received in InitDoctorCards function: " + request_obj.responseText);

            doctor_cards_div.innerHTML = "";

            for (let doctor_index = 0; doctor_index < doctor_obj_arr.length; doctor_index++)
            {
                CreateDoctorCard(
                    doctor_obj_arr[doctor_index].Name,
                    doctor_obj_arr[doctor_index].Specialization,
                    doctor_obj_arr[doctor_index].DoctorImgFilePath
                );
            }
        })
    }

    function GetInfoForDoctorReviewCards(response_received_callback_function)
    {
        SendRequestToServer("/get_info_for_doctor_review_cards", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    async function CreateDoctorReviewCard(member_name, member_img_file_path, review_star_count, review_content)
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

        doctor_review_cards_div.appendChild(col_div);
    }

    // Initializes the doctor review cards under the "Reviews" section of the webpage.
    async function InitDoctorReviewCards(doctor_review_cards_div)
    {
        GetInfoForDoctorReviewCards((request_obj) =>
        {
            let doctor_review_obj_arr = JSON.parse(request_obj.responseText);

            doctor_review_cards_div.innerHTML = "";

            // console.log("Response received in InitDoctorReviewCards function: " + request_obj.responseText);

            for (let doctor_review_index = 0; doctor_review_index < doctor_review_obj_arr.length; doctor_review_index++)
            {
                CreateDoctorReviewCard(
                doctor_review_obj_arr[doctor_review_index].Name,
                doctor_review_obj_arr[doctor_review_index].MemberImgFilePath,
                doctor_review_obj_arr[doctor_review_index].ReviewStarCount,
                doctor_review_obj_arr[doctor_review_index].Content
                );
            }
        });
    }

    function GetInfoForHealthArticleCards(response_received_callback_function)
    {
        SendRequestToServer("/get_info_for_health_article_cards", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    async function CreateHealthArticleCard(health_article_preview_title, health_article_url_link, health_article_img_file_path, health_article_creation_date_str)
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

        health_articles_container_div.appendChild(article_container_div);
    }

    async function InitHealthArticleCards(health_articles_container_div)
    {
        GetInfoForHealthArticleCards((request_obj) =>
        {
            let health_article_post_obj_arr = JSON.parse(request_obj.responseText);

            health_articles_container_div.innerHTML = "";

            for (let index = 0; index < health_article_post_obj_arr.length; index++)
            {
                CreateHealthArticleCard
                (
                    health_article_post_obj_arr[index].PreviewTitle,
                    health_article_post_obj_arr[index].HealthArticleURLLink,
                    health_article_post_obj_arr[index].HealthArticlePostImgFilePath,
                    health_article_post_obj_arr[index].HealthArticlePostCreationDate
                );
            }
        });
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

    function GetServiceBookingPageLink(response_received_callback_function)
    {
        SendRequestToServer("/get_service_booking_page_link", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    function GetSignUpPageLink(response_received_callback_function)
    {
        SendRequestToServer("/get_sign_up_page_link", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    function SignUpNewMember(new_member_name, new_member_email_address, new_member_passwd, response_received_callback_function)
    {
        SendRequestToServer("/sign_up_new_member", "POST", JSON.stringify({
            new_member_name: new_member_name,
            new_member_email_address: new_member_email_address,
            new_member_passwd: new_member_passwd,
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    function GetAllDoctorNames(response_received_callback_function)
    {
        SendRequestToServer("/get_all_doctor_names", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    function IsLoggedIn(response_received_callback_function)
    {
        SendRequestToServer("/is_logged_in", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    function GetClinicDistrictLocationNames(response_received_callback_function)
    {
        SendRequestToServer("/get_clinic_district_names", "POST", JSON.stringify({
            session_token: sessionStorage.getItem("session_token")
        }),
        response_received_callback_function);
    }

    return {
        // Exposed API variables/constants
        TransactionMethod: TransactionMethod,
        PrivilegeType: PrivilegeType,
        ActivityStatusType: ActivityStatusType,
        FastDocServiceType: FastDocServiceType,

        // Exposed API functions
        QueryRestDB: QueryRestDB,
        GetSessionToken: GetSessionToken,
        LoginToAccount: LoginToAccount,
        LogoutOfAccount: LogoutOfAccount,
        InitDoctorCards: InitDoctorCards,
        InitDoctorReviewCards: InitDoctorReviewCards,
        InitHealthArticleCards: InitHealthArticleCards,
        GetServiceBookingPageLink: GetServiceBookingPageLink,
        GetSignUpPageLink: GetSignUpPageLink,
        SignUpNewMember: SignUpNewMember,
        GetAllDoctorNames: GetAllDoctorNames,
        IsLoggedIn: IsLoggedIn,
        GetClinicDistrictLocationNames: GetClinicDistrictLocationNames,
        
        // Exposed utility API functions
        GetMonthNameFromDateStr: GetMonthNameFromDateStr,
        ConvertDateObjToDateStr: ConvertDateObjToDateStr,
        ConvertDateObjToDateTimeStr: ConvertDateObjToDateTimeStr,
        ConvertDateTimeStrToDateObj: ConvertDateTimeStrToDateObj,
    };
}