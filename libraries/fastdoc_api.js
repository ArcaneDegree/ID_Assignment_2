function LoadFastDocAPI()
{
    var current_cors_api_key = "63e0ee103bc6b255ed0c46f7";

    var db_host_name = "interactivedevasg2db-e461.restdb.io";

    var current_working_dir_path = "";

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
    // the QueryDB function must have the following parameters:
    // 1.) request (type: XMLHttpRequest)
    function QueryDB(selected_table_name, selected_action, request_body_obj, callback_function)
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

                // console.log("QueryDB result body value: " + body_obj_arr);

                // console.log("QueryDB result body stringified value: " + JSON.stringify(body_obj_arr));

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
            console.log("Error in QueryDB function: Invalid/unsupported action passed into QueryDB function.");
        }
    }

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

    // Note: The callback function passed as the third argument into the this
    // function must have the following parameters:
    // 1. request (type: XMLHttpRequest)
    function SendRequestToServerLocalDB(selected_command_execution_mode, new_command_obj_arr, response_received_callback_function)
    {
        let request = new XMLHttpRequest();

        request.open("POST", "/fastdoc/localdb", true);

        request.onreadystatechange = function ()
        {
            if (request.readyState == XMLHttpRequest.DONE)
            {
                response_received_callback_function(request);
            }
        }

        request.send(JSON.stringify({
            command_execution_mode: selected_command_execution_mode,
            command_obj_arr: new_command_obj_arr
        }));
    }

    function AddNewMember(new_member_name, new_member_passwd, new_member_email_address)
    {
        SendRequestToServerLocalDB("single",
        [
            new LocalDBCommand(
                `INSERT INTO Member
                (Name, Passwd, EmailAddress, PrivilegeType, CurrentStatus)
                VALUES (
                    '${new_member_name}',
                    '${new_member_passwd}',
                    '${new_member_email_address}',
                    1,
                    0
                );`,
                [],
                null
            )
        ],
        (request_obj) =>
        {
            if (request_obj.status == 200)
            {
                console.log(`New member named '${new_member_name}' added to the server's local database successfully.`);
            }
            else
            {
                console.log(`An error occurred while attempting to add a new member named '${new_member_name}' to the server's local database. Response status code: ${request_obj.status}.`);
            }
        });
    }

    return {
        LocalDBCommand: LocalDBCommand,
        SendRequestToServerLocalDB: SendRequestToServerLocalDB,
        AddNewMember: AddNewMember
    };
}