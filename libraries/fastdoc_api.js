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

    // Status after testing: Working.
    // Constructor method for the LocalDBCommand class
    // Note: The callback function passed into the 3rd argument for this method must contain the following
    // parameters:
    // 1. rows (type: Not known)
    function LocalDBCommand(new_command_str, new_params_arr, new_callback_func)
    {
        this.command_str = new_command_str;

        this.params_arr = new_params_arr;

        this.callback_func = new_callback_func;
    }

    // Status after testing: Working.
    // Note: This function is meant to serve as a base helper function as well.
    // Note: The callback function passed as the third argument into the this
    // function must have the following parameters:
    // 1. request (type: XMLHttpRequest)
    function SendRequestToServerDB(selected_command_execution_mode, new_command_obj_arr, response_received_callback_function)
    {
        let request = new XMLHttpRequest();

        request.open("POST", "/fastdoc/localdb", true);

        request.onreadystatechange = function ()
        {
            if (request.readyState == XMLHttpRequest.DONE)
            {
                if (response_received_callback_function != null)
                {
                    response_received_callback_function(request);
                }
            }
        }

        request.send(JSON.stringify({
            command_execution_mode: selected_command_execution_mode,
            command_obj_arr: new_command_obj_arr
        }));
    }

    // Status after testing: Pending.
    // Note: This function is meant to serve as a base helper function.
    // Note: Format for filter statement: "{attribute}={value} AND {attribute}={value} AND..."
    // If the data type of attribute is varchar() or anything related to text, ensure that
    // its value is encased in single quotation marks (e.g. {attribute}='{value}').
    function GetCommandStrWithFilterStatement(command_str, filter_statement_str)
    {
        let result_command_str = command_str;

        if (filter_statement_str != "")
        {
            result_command_str += ` WHERE ${filter_statement_str}`;
        }

        return result_command_str;
    }

    // Status after testing: Working.
    // Note: This function is meant to serve as a base helper function.
    function GetFilterStatementStrFromFilterArr(filter_arr = [])
    {
        if (filter_arr == null)
        {
            filter_arr = [];
        }

        let result_filter_statement_str = "";

        for (let current_filter_index = 0; current_filter_index < filter_arr.length; current_filter_index++)
        {
            result_filter_statement_str += `${filter_arr[current_filter_index]}`;

            if (current_filter_index < filter_arr.length - 1)
            {
                result_filter_statement_str += ` AND `;
            }
        }

        return result_filter_statement_str;
    }

    // Status after testing: Working.
    // Note: This function is meant to serve as a base helper function.
    function GetValuesStrFromValuesArr(values_arr)
    {
        if (values_arr == null)
        {
            values_arr = [];
        }

        let result_values_str = "";

        for (let current_value_index = 0; current_value_index < values_arr.length; current_value_index++)
        {
            result_values_str += `${values_arr[current_value_index]}`;

            if (current_value_index < values_arr.length - 1)
            {
                result_values_str += `, `;
            }
        }

        return result_values_str;
    }

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

    // Status after testing: Working.
    // Note: Values of attributes of d data type of varchar or anything related to text/strings
    // must be encased/wrapped in single quotation marks (e.g. '{new varchar value}').
    function AddRowToServerDBTable(selected_table_name, column_names, new_values, response_received_callback_function)
    {
        if (column_names == "" || new_values == "")
        {
            return;
        }

        let result_command_str = `INSERT INTO ${selected_table_name} (${column_names}) VALUES(${new_values});`;

        // console.log("Result command string for adding new row: " + result_command_str);

        SendRequestToServerDB("single",
        [
            new LocalDBCommand(
                result_command_str,
                [],
                null
            )
        ],
        response_received_callback_function);
    }

    // Status after testing: Working.
    // Note: This function is meant to serve as a base helper function as well.
    // Note: Format for filter statement: "{attribute}={value} AND {attribute}={value} AND..."
    // If the data type of attribute is varchar() or anything related to text, ensure that
    // its value is encased in single quotation marks (e.g. {attribute}='{value}').
    function GetRowsFromServerDBTableWithFilter(selected_table_name, filter_statement_str, response_received_callback_function)
    {
        // console.log("Filter statement string: " + filter_statement_str);

        let result_command_str = GetCommandStrWithFilterStatement(`SELECT * FROM ${selected_table_name}`, filter_statement_str) + ";";

        // console.log("Result command string: " + result_command_str);

        SendRequestToServerDB("single",
        [
            new LocalDBCommand(
                result_command_str,
                [],
                null
            )
        ],
        response_received_callback_function);
    }

    // Status after testing: Working.
    function GetAllRowsFromServerDBTable(selected_table_name, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter(selected_table_name, "", response_received_callback_function);
    }

    // Status after testing: Working.
    // Format for updated_values_str parameter: {updated attribute}={updated value},{updated attribute}={updated value},...
    // If the data type of attribute is varchar() or anything related to text, ensure that
    // its value is encased in single quotation marks (e.g. {attribute}='{value}').
    function UpdateRowsInServerDBTableWithFilter(selected_table_name, filter_statement_str, updated_values_str, response_received_callback_function)
    {
        if (updated_values_str == "")
        {
            return;
        }

        let result_command_str = GetCommandStrWithFilterStatement(`UPDATE ${selected_table_name} SET ${updated_values_str}`, filter_statement_str) + ";";

        SendRequestToServerDB("single", 
        [
            new LocalDBCommand(
                result_command_str,
                [],
                null
            )
        ],
        response_received_callback_function);
    }

    // Status after testing: Working.
    function DeleteRowsInServerDBTableWithFilter(selected_table_name, filter_statement_str, response_received_callback_function)
    {
        let result_command_str = GetCommandStrWithFilterStatement(`DELETE FROM ${selected_table_name}`, filter_statement_str) + ";";

        SendRequestToServerDB("single",
        [
            new LocalDBCommand(
                result_command_str,
                [],
                null
            )
        ],
        response_received_callback_function);
    }

    // Note: The implementations of these API functions work with the server's local database and
    // not the remote RestDB database.
    // Note: Restrictions imposed on new member registrations:
    // 1.) New member's name cannot be the same as the names of other registered members.
    // 2.) New member's email address cannot be the same as the email addresses of other registered
    // members.
    // Note: datetime format for all datetime attributes is 'DD/MM/YYYY hh:mm:ss'.
    
    // API functions for working with the Member table.
    
    // Status after testing: Working.
    function AddNewMember(new_member_name, new_member_passwd, new_member_email_address, response_received_callback_function = null)
    {
        AddRowToServerDBTable(
        "Member",
        "Name, Passwd, EmailAddress, PrivilegeType, CurrentStatus",
        `'${new_member_name}',
        '${new_member_passwd}',
        '${new_member_email_address}',
        1,
        0`,
        response_received_callback_function);
    }

    // Status after testing: Working.
    // Note: For any of the parameters in this function, if not applicable, pass in null.
    function GetMembers(filter_arr, response_received_callback_function)
    {
        let result_filter_statement_str = GetFilterStatementStrFromFilterArr(filter_arr);

        // console.log("Result filter statement string from GetMembers: " + result_filter_statement_str);

        GetRowsFromServerDBTableWithFilter("Member", result_filter_statement_str, response_received_callback_function);
    }

    // Status after testing: Working.
    // Note: For any of the parameters in this function, if not applicable, pass in null.
    function UpdateMembers(filter_arr, updated_values_arr, response_received_callback_function)
    {
        let result_filter_statement_str = GetFilterStatementStrFromFilterArr(filter_arr);

        let result_updated_values_str = GetValuesStrFromValuesArr(updated_values_arr);

        // console.log("Result updated values string in UpdateMembers: " + result_updated_values_str);

        UpdateRowsInServerDBTableWithFilter("Member", result_filter_statement_str, result_updated_values_str, response_received_callback_function);
    }

    // Status after testing: Working.
    function DeleteMembers(filter_arr, response_received_callback_function)
    {
        let filter_statement_str = GetFilterStatementStrFromFilterArr(filter_arr);

        DeleteRowsInServerDBTableWithFilter("Member", filter_statement_str, response_received_callback_function);
    }

    // API functions for working with the HealthArticlePost table

    // Status after testing: Pending.
    function AddHealthArticlePost(preview_title, health_article_url_link, health_article_post_img_file_path, response_received_callback_function)
    {
        AddRowToServerDBTable("HealthArticlePost", "PreviewTitle, HealthArticleURLLink, HealthArticlePostCreationDate, HealthArticlePostImgFilePath", `'${preview_title}', '${health_article_url_link}', '${ConvertDateObjToDateStr(new Date(Date.now()))}', '${health_article_post_img_file_path}'`, response_received_callback_function);
    }

    // Status after testing: Pending.
    function GetHealthArticlePosts(filter_arr, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter(
            "HealthArticlePost",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetAllHealthArticlePosts(response_received_callback_function)
    {
        GetHealthArticlePosts(null, response_received_callback_function);
    }

    // Status after testing: Pending.
    function DeleteHealthArticlePosts(filter_arr, response_received_callback_function)
    {
        DeleteRowsInServerDBTableWithFilter(
            "HealthArticlePost",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // API functions for working with the Doctor table.

    // Status after testing: Pending
    function AddDoctor(doctor_name, doctor_email_address, doctor_specialization, doctor_description, doctor_img_file_path, response_received_callback_function)
    {
        AddRowToServerDBTable(
            "Doctor",
            "Name, EmailAddress, Specialization, Description, DoctorImgFilePath",
            `'${doctor_name}',
            '${doctor_email_address}',
            '${doctor_specialization}',
            '${doctor_description}',
            '${doctor_img_file_path}'
            `,
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetDoctors(filter_arr, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter(
            "Doctor",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetAllDoctors(response_received_callback_function)
    {
        GetDoctors(null, response_received_callback_function);
    }

    // Status after testing: Pending.
    function DeleteDoctors(filter_arr, response_received_callback_function)
    {
        DeleteRowsInServerDBTableWithFilter(
            "Doctor",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // API functions for working with the DoctorReview table.

    // Status after testing: Pending.
    function AddDoctorReview(reviewing_member_id, reviewed_doctor_id, review_star_count, content)
    {
        AddRowToServerDBTable(
            "DoctorReview",
            "ReviewingMemberID, ReviewedDoctorID, ReviewStarCount, Content",
            `${reviewing_member_id}, ${reviewed_doctor_id}, ${review_star_count}, '${content}'`,
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetDoctorReviews(filter_arr, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter(
            "DoctorReview",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetAllDoctorReviews(response_received_callback_function)
    {
        GetDoctorReviews(null, response_received_callback_function);
    }

    // Status after testing: Pending.
    function DeleteDoctorReviews(filter_arr, response_received_callback_function)
    {
        DeleteRowsInServerDBTableWithFilter(
            "DoctorReview",
            GetFilterStatementStrFromFilterArr(filter_arr),
            response_received_callback_function
        );
    }

    // API functions for working with the AppointmentBooking table.

    // Status after testing: Working.
    function AddAppointmentBooking(booking_member_id, booked_doctor_id, appointment_date_time_str, response_received_callback_function)
    {
        let current_time_str = ConvertDateObjToDateTimeStr(new Date(Date.now()));

        // console.log("Current time string: " + current_time_str);

        AddRowToServerDBTable(
            "AppointmentBooking",
            "BookingMemberID, BookedDoctorID, AppointmentBookingCreationDateTime, AppointmentDateTime",
            `${booking_member_id}, ${booked_doctor_id}, '${current_time_str}', '${appointment_date_time_str}'`,
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetAppointmentBookings(filter_arr, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter("AppointmentBooking", GetFilterStatementStrFromFilterArr(filter_arr), response_received_callback_function);
    }

    // Status after testing: Pending.
    function GetAllAppointmentBookings(response_received_callback_function)
    {
        GetAppointmentBookings(null, response_received_callback_function);
    }

    // Status after testing: Working.
    function DeleteAppointmentBookings(filter_arr, response_received_callback_function)
    {
        let filter_statement_str = GetFilterStatementStrFromFilterArr(filter_arr);

        DeleteRowsInServerDBTableWithFilter("AppointmentBooking", filter_statement_str, response_received_callback_function);
    }

    // API functions for working with the FastDocTransaction table.

    // Status after testing: Working.
    function AddFastDocTransaction(origin_member_id, associated_appointment_booking_id, transaction_amount, transaction_method, full_name, email_address, address, city, state, postal_code, cardholder_name, credit_card_number_str, expiry_month, expiry_year, cvv, response_received_callback_function)
    {
        AddRowToServerDBTable(
            "FastDocTransaction",
            `
            OriginMemberID,
            AssociatedAppointmentBookingID,
            TransactionAmount,
            TransactionMethod,
            FullName,
            EmailAddress,
            Address,
            City,
            State,
            PostalCode,
            CardholderName,
            CreditCardNumber,
            ExpiryMonth,
            ExpiryYear,
            CVV
            `,
            `
            ${origin_member_id},
            ${associated_appointment_booking_id},
            ${transaction_amount},
            ${transaction_method},
            '${full_name}',
            '${email_address}',
            '${address}',
            '${city}',
            '${state}',
            '${postal_code}',
            '${cardholder_name}',
            '${credit_card_number_str}',
            ${expiry_month},
            ${expiry_year},
            ${cvv}
            `,
            response_received_callback_function
        );
    }

    // Status after testing: Pending.
    function GetFastDocTransactions(filter_arr, response_received_callback_function)
    {
        GetRowsFromServerDBTableWithFilter("FastDocTransaction", GetFilterStatementStrFromFilterArr(filter_arr), response_received_callback_function);
    }

    // Status after testing: Pending.
    function GetAllFastDocTransactions(response_received_callback_function)
    {
        GetFastDocTransactions(null, response_received_callback_function);
    }

    // Status after testing: Working.
    function DeleteFastDocTransactions(filter_arr, response_received_callback_function)
    {
        let filter_statement_str = GetFilterStatementStrFromFilterArr(filter_arr);

        DeleteRowsInServerDBTableWithFilter("FastDocTransaction", filter_statement_str, response_received_callback_function);
    }

    // API functions for miscellaneous utilities.

    // Status after testing: Pending.
    // The value of date_str must be in the following format: DD/MM/YYYY
    function GetMonthNameFromDateStr(date_str)
    {
        let month_num = parseInt(date_str.split("/")[1]);

        let date_obj = new Date();

        date_obj.setMonth(month_num - 1);

        return date_obj.toLocaleString("en-US", {month: "long"});
    }

    return {
        // Exposed API variables/constants
        TransactionMethod: TransactionMethod,
        PrivilegeType: PrivilegeType,
        ActivityStatusType: ActivityStatusType,

        // Exposed API functions
        QueryRestDB: QueryRestDB,
        LocalDBCommand: LocalDBCommand,
        SendRequestToServerDB: SendRequestToServerDB,
        AddRowToServerDBTable: AddRowToServerDBTable,
        GetRowsFromServerDBTableWithFilter: GetRowsFromServerDBTableWithFilter,
        GetAllRowsFromServerDBTable: GetAllRowsFromServerDBTable,
        UpdateRowsInServerDBTableWithFilter: UpdateRowsInServerDBTableWithFilter,
        DeleteRowsInServerDBTableWithFilter: DeleteRowsInServerDBTableWithFilter,
        // Member API functions
        AddNewMember: AddNewMember,
        GetMembers: GetMembers,
        UpdateMembers: UpdateMembers,
        DeleteMembers: DeleteMembers,
        // HealthArticlePost API functions
        AddHealthArticlePost: AddHealthArticlePost,
        GetHealthArticlePosts: GetHealthArticlePosts,
        GetAllHealthArticlePosts: GetAllHealthArticlePosts,
        DeleteHealthArticlePosts: DeleteHealthArticlePosts,
        // Doctor API functions
        AddDoctor: AddDoctor,
        GetDoctors: GetDoctors,
        GetAllDoctors: GetAllDoctors,
        DeleteDoctors: DeleteDoctors,
        // DoctorReview API functions
        AddDoctorReview: AddDoctorReview,
        GetDoctorReviews: GetDoctorReviews,
        GetAllDoctorReviews: GetAllDoctorReviews,
        DeleteDoctorReviews: DeleteDoctorReviews,
        // AppointmentBooking API functions
        AddAppointmentBooking: AddAppointmentBooking,
        GetAppointmentBookings: GetAppointmentBookings,
        GetAllAppointmentBookings: GetAllAppointmentBookings,
        DeleteAppointmentBookings: DeleteAppointmentBookings,
        // FastDocTransaction API functions
        AddFastDocTransaction: AddFastDocTransaction,
        GetFastDocTransactions: GetFastDocTransactions,
        GetAllFastDocTransactions: GetAllFastDocTransactions,
        DeleteFastDocTransactions: DeleteFastDocTransactions,
        // Miscellaneous utility API functions
        GetMonthNameFromDateStr: GetMonthNameFromDateStr,
        ConvertDateObjToDateStr: ConvertDateObjToDateStr,
        ConvertDateObjToDateTimeStr: ConvertDateObjToDateTimeStr,
        ConvertDateTimeStrToDateObj: ConvertDateTimeStrToDateObj
    };
}