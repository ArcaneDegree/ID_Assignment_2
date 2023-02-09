const Http = require("http");

const FileSystem = require("fs");

const Request = require("request");

const URL = require("url");

const Path = require("path");

const SQLite3 = require("sqlite3");

const required_field_definitions_obj = {
    get_health_article: ["selected_health_article_id", "selected_health_article_title"],
    add_new_health_article: ["Title", "Content"]
};

var http_server = null;

var port_num = 8080;

var host_name = "localhost";

var correct_base_dir_name = "ID_Assignment_2";

/*
Previously current_working_dir_path value:
C:/Poly/Interactive_Development_Y1S2/ASG2/ID_Assignment_2
*/
var current_working_dir_path = __dirname;

var current_full_access_api_key = "";

var db_host_name = "interactivedevasg2db-e461.restdb.io";

var favicon_ico_file_path = "/favicon_io/favicon.ico";

var default_local_db_file_name = "fastdoc_database.db";

function OnHttpServerStartListening()
{
    console.log("Started listening on port " + port_num + ".");
}

function ResolveCurrentWorkingDirPath()
{
    let current_working_dir_path_parts = current_working_dir_path.split("\\");

    while (current_working_dir_path_parts[current_working_dir_path_parts.length - 1] != correct_base_dir_name)
    {
        // console.log("Current dir name: " + current_working_dir_path_parts[current_working_dir_path_parts.length - 1]);

        current_working_dir_path = Path.resolve(current_working_dir_path, "../");

        current_working_dir_path_parts = current_working_dir_path.split("\\");
    }

    // console.log("Resolved current working dir path: " + current_working_dir_path);
}

// Recursively searches for a file with the same name as the selected file name (parameter 1), looking
// through all files and directories under the specified directory path (parameter 2), as well as
// subdirectories under those directories if required, returns "" if no file was found at all, 
// otherwise returns a string containing the file path of the file with the same name as the 
// selected file name.
function SearchAllDirsForFile(file_name, working_dir_path)
{
    // console.log(`Checking directory at path '${working_dir_path}' for '${file_name}' file.`);

    let result_file_path = "";

    let working_dir_path_file_list = FileSystem.readdirSync(working_dir_path);

    for (let currentFileIndex = 0; currentFileIndex < working_dir_path_file_list.length; currentFileIndex++)
    {
        if (working_dir_path_file_list[currentFileIndex] == ".git" || working_dir_path_file_list[currentFileIndex] == ".gitignore")
        {
            continue;
        }

        if (working_dir_path_file_list[currentFileIndex] == file_name)
        {
            result_file_path = working_dir_path + "/" + file_name;

            break;
        }

        if (FileSystem.statSync(working_dir_path + "/" + working_dir_path_file_list[currentFileIndex]).isDirectory() == true)
        {
            result_file_path = SearchAllDirsForFile(file_name, working_dir_path + "/" + working_dir_path_file_list[currentFileIndex]);

            if (result_file_path != "")
            {
                break;
            }
        }
    }

    // console.log(`Result file path obtained: '${result_file_path}'`);

    return result_file_path;
}

// Returns a string containing the full access API key if the key was found in the details.txt file, 
// otherwise returns "" (an empty string).
function RetrieveDBFullAccessAPIKey()
{
    details_file_text = FileSystem.readFileSync(current_working_dir_path + "/details.txt", "utf8");

    details_file_lines = details_file_text.split("\n");

    for (current_line_index = 0; current_line_index < details_file_lines.length; current_line_index++)
    {
        detail_key_val_entry = details_file_lines[current_line_index].split(":");

        if (detail_key_val_entry[0] == "full_access_api_key")
        {
            return detail_key_val_entry[1];
        }
    }

    return "";
}

function GetDBTablePath(table_name)
{
    return `/rest/${table_name.toLowerCase()}`;
}

function SendRequestToDB(selected_method, selected_table_name, response, selected_query = "", selected_body = null)
{
    let options = {
        method: `${selected_method.toUpperCase()}`,
        url: `https://${db_host_name}${GetDBTablePath(selected_table_name)}${selected_query}`,
        headers: 
        {   'cache-control': 'no-cache',
            'x-apikey': `${current_full_access_api_key}`
        }
    };

    if (selected_body != null)
    {
        options.body = selected_body;
        options.json = true;
        options.headers["content-type"] = 'application/json';
    }

    // console.log(`Current url in options object: ${options.url}`);

    Request(options, function(error, responseObj, body)
    {
        if (error != null)
        {
            throw new Error(error);
        }

        // console.log(`Response body: ${body}`);

        response.writeHead(200, {"Content-Type" : "application/json"});

        if (typeof body != "string")
        {
            body = JSON.stringify(body);
        }

        response.write(body);

        response.end();
    });
}

function SendStatusCode400Response(response_obj, response_text = "Bad Request")
{
    response_obj.writeHead(400, {"Content-Type": "text/plain"});

    response_obj.write(response_text);

    response_obj.end();
}

function ParseRequestBody(request_body_data, response)
{
    // console.log(request_body_data);

    let request_details_obj = null;

    try
    {
        // console.log(`Request body: ${request_body_data}`);

        request_details_obj = JSON.parse(request_body_data);
    }
    catch(error)
    {
        console.log(`Error in ParseRequestBody function: ${error.message}`);

        request_details_obj = null;
    }

    if (request_details_obj == null)
    {
        SendStatusCode400Response(response);
    }

    return request_details_obj;
}

function CheckForRequiredFieldsInRequestBodyObj(request_body_obj, request_url_pathname)
{
    let field_names_list = required_field_definitions_obj[request_url_pathname.replace("/", "")];

    let undefined_field_names_list = [];

    for (let field_name_index = 0; field_name_index < field_names_list.length; field_name_index++)
    {
        if (request_body_obj[field_names_list[field_name_index]] == undefined)
        {
            undefined_field_names_list.push(field_names_list[field_name_index]);
        }
    }

    if (undefined_field_names_list.length > 0)
    {
        let response_text = "Bad Request. The response body is missing the following required fields:";

        for (let undefined_field_name_index = 0; undefined_field_name_index < undefined_field_names_list.length; undefined_field_name_index++)
        {
            response_text += "\n" + undefined_field_names_list[undefined_field_name_index];
        }

        SendStatusCode400Response(response, response_text);
    }

    return undefined_field_names_list;
}

/*
Note: The callback function passed into this function must have the following parameters:
1.) error
2.) responseObj
3.) body_obj_arr (The response body represented as a JSON formatted string which when parsed returns an array of Objects)
*/
function QueryDB(selected_method, selected_table_name, selected_query = "", selected_body = "", callback_function)
{
    let options = {
        method: `${selected_method.toUpperCase()}`,
        url: `https://${db_host_name}${GetDBTablePath(selected_table_name)}${selected_query}`,
        headers: 
        {   'cache-control': 'no-cache',
            'x-apikey': `${current_full_access_api_key}`
        }
    };

    if (selected_body != "")
    {
        options.body = selected_body;
        options.json = true;
        options.headers["content-type"] = 'application/json';
    }

    // console.log(`Current url in options object: ${options.url}`);

    Request(options, callback_function);
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

// Opens a connection to the local SQLite database on the server. If there is no SQLite database on the 
// server, a new SQLite database along with the relevant tables and columns will be created.
function ConnectToLocalDB()
{
    local_db = new SQLite3.Database(current_working_dir_path + "/" + default_local_db_file_name, SQLite3.OPEN_READWRITE | SQLite3.OPEN_CREATE, (error) =>
    {
        if (error != null)
        {
            console.log("Error occurred in InitLocalDB function: " + error.message);
        }

        // console.log(`Successfully established a connection with the ${default_local_db_file_name} database.`);
    });

    return local_db;
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

function InitLocalDB()
{
    if (FileSystem.existsSync(current_working_dir_path + "/" + default_local_db_file_name) == false)
    {
        console.log("Local database not found on server. Creating new local database...");

        let local_db = ConnectToLocalDB();

        local_db.close();

        let create_member_table_command_obj = new LocalDBCommand(
            `CREATE TABLE Member (
                MemberID INTEGER PRIMARY KEY,
                Name varchar(200),
                Passwd varchar(100),
                EmailAddress varchar(200),
                PrivilegeType int,
                CurrentStatus int
            );
            `,
            [],
            () =>
            {
                console.log("Member table created successfully.");
            }
        );

        let create_health_article_post_table_command_obj = new LocalDBCommand(
            `CREATE TABLE HealthArticlePost (
                HealthArticlePostID INTEGER PRIMARY KEY,
                Title varchar(1000),
                Content varchar(8000)
            );
            `,
            [],
            () =>
            {
                console.log("HealthArticlePost table created successfully.");
            }
        );

        let create_health_article_post_reaction_table_command_obj = new LocalDBCommand(
            `CREATE TABLE HealthArticlePostReaction (
                HealthArticlePostReactionID INTEGER PRIMARY KEY,
                MemberID int,
                ReactionType int
            );
            `,
            [],
            () =>
            {
                console.log("HealthArticlePostReaction table created successfully.");
            }
        );

        let create_health_article_comment_table_command_obj = new LocalDBCommand(
            `CREATE TABLE HealthArticleComment (
                HealthArticleCommentID INTEGER PRIMARY KEY,
                MemberID int,
                Content varchar(8000)
            );
            `,
            [],
            () =>
            {
                console.log("HealthArticleComment table created successfully.");
            }
        );

        let create_doctor_table_command_obj = new LocalDBCommand(
            `CREATE TABLE Doctor (
                DoctorID INTEGER PRIMARY KEY,
                Name varchar(200),
                EmailAddress varchar(200),
                Specialization varchar(200),
                Description varchar(1000)
            );
            `,
            [],
            () =>
            {
                console.log("Doctor table created successfully.");
            }
        );

        let create_doctor_review_table_command_obj = new LocalDBCommand(
            `CREATE TABLE DoctorReview (
                DoctorReviewID INTEGER PRIMARY KEY,
                ReviewingMemberID int,
                ReviewedDoctorID int,
                ReviewStarCount int,
                Content varchar(8000)
            );
            `,
            [],
            () =>
            {
                console.log("DoctorReview table created successfully.");
            }
        );

        let create_appointment_booking_table_command_obj = new LocalDBCommand(
            `CREATE TABLE AppointmentBooking (
                AppointmentBookingID INTEGER PRIMARY KEY,
                BookingMemberID int,
                BookedDoctorID int,
                AppointmentBookingCreationDateTime varchar(100),
                AppointmentDateTime varchar(100)
            );
            `,
            [],
            () =>
            {
                console.log("AppointmentBooking table created successfully.");
            }
        );

        let create_fastdoc_transaction_table_command_obj = new LocalDBCommand(
            `CREATE TABLE FastDocTransaction (
                TransactionID INTEGER PRIMARY KEY,
                OriginMemberID int,
                AssociatedAppointmentBookingID int,
                TransactionAmount money,
                TransactionMethod int
            );
            `,
            [],
            () =>
            {
                console.log("Transaction table created successfully.");
            }
        );

        let create_consultation_table_command_obj = new LocalDBCommand(
            `CREATE TABLE Consultation (
                ConsultationID INTEGER PRIMARY KEY,
                ConsultingMemberID int,
                ConsultantDoctorID int,
                AssociatedAppointmentBookingID int
            );
            `,
            [],
            () =>
            {
                console.log("Consultation table created successfully.");
            }
        );

        let local_db_tables_creation_command_obj_arr = [
            create_member_table_command_obj,
            create_health_article_post_table_command_obj,
            create_health_article_post_reaction_table_command_obj,
            create_health_article_comment_table_command_obj,
            create_doctor_table_command_obj,
            create_doctor_review_table_command_obj,
            create_appointment_booking_table_command_obj,
            create_fastdoc_transaction_table_command_obj,
            create_consultation_table_command_obj
        ];

        ExecuteCommandsInParallelOnLocalDB(local_db_tables_creation_command_obj_arr);
    }
}

// Executes a specified command on the local SQLite database located on the server. This function does
// not handle the connection to the local database and disconnection from the local database.
function RunCommandOnLocalDB(db_obj, command_obj, response_obj = null)
{
    db_obj.all(command_obj.command_str, command_obj.params_arr, (err, rows) =>
    {
        if (err != null)
        {
            console.log("Error occurred in ExecuteCommandOnLocalDB function: " + err.message);

            throw err;
        }

        if (command_obj.callback_func != null)
        {
            command_obj.callback_func(rows);
        }

        if (response_obj != null)
        {
            response_obj.writeHead(200, {"Content-Type" : "application/json"});

            response_obj.write(JSON.stringify(rows));

            response_obj.end();
        }
    });
}

// Executes a specified command on the local SQLite database located on the server, automatically
// handles the connection to the local database and disconnection from the local database.
function ExecuteCommandOnLocalDB(command_obj, response_obj = null)
{
    let local_db = ConnectToLocalDB();

    RunCommandOnLocalDB(local_db, command_obj, response_obj);

    local_db.close();
}

function ExecuteCommandsSequentiallyOnLocalDB(command_obj_arr, response_obj)
{
    let local_db = ConnectToLocalDB();

    local_db.serialize(() =>
    {
        for (let current_command_index = 0; current_command_index < command_obj_arr.length; current_command_index++)
        {
            RunCommandOnLocalDB(local_db, command_obj_arr[current_command_index], response_obj);
        }
    });

    local_db.close();
}

function ExecuteCommandsInParallelOnLocalDB(command_obj_arr, response_obj)
{
    let local_db = ConnectToLocalDB();

    local_db.parallelize(() => {
        for (let current_command_index = 0; current_command_index < command_obj_arr.length; current_command_index++)
        {
            RunCommandOnLocalDB(local_db, command_obj_arr[current_command_index], response_obj);
        }
    });

    local_db.close();
}

function InsertTestDataIntoLocalDBTable(test_data_file_path, selected_table_name)
{
    let test_data_file_content_str = FileSystem.readFileSync(test_data_file_path, "utf-8");

    let test_row_obj_arr = JSON.parse(test_data_file_content_str);

    let table_insertion_command_objs_arr = [];

    if (selected_table_name.toLowerCase() == "member")
    {
        for (let current_row_index = 0; current_row_index < test_row_obj_arr.length; current_row_index++)
        {
            table_insertion_command_objs_arr.push(new LocalDBCommand(
                `INSERT INTO ${selected_table_name} 
                (Name, Passwd, EmailAddress, PrivilegeType, CurrentStatus) 
                VALUES(
                    '${test_row_obj_arr[current_row_index].Name}',
                    '${test_row_obj_arr[current_row_index].Passwd}',
                    '${test_row_obj_arr[current_row_index].EmailAddress}',
                    ${test_row_obj_arr[current_row_index].PrivilegeType},
                    ${test_row_obj_arr[current_row_index].CurrentStatus}
                    );
                `,
                [],
                null
            ));
        }
    }

    ExecuteCommandsSequentiallyOnLocalDB(table_insertion_command_objs_arr);

    console.log(`Inserted test data into the '${selected_table_name}' table successfully.`);
}

// Note: Certain Chrome browser extensions are known to cause an error on the website with the following
// message: 'Unchecked runtime.lastError: The message port closed before a response was received'. To
// fix this error and prevent it from occurring, the Chrome browser extension causing this error must
// be identified and then disabled. This error is known to be caused by certain Chrome browser
// extensions and not by the website or web application itself.
function HandleRequest(request, response)
{
    let request_url = URL.parse(request.url, true);

    //console.log("Request url: " + request.url);

    // console.log("Request url pathname: " + request_url.pathname);

    // console.log("Request url path split('/') element at index 0: " + request_url.pathname.split("/")[0]);

    // console.log("Request url split('/') length: " + request_url.pathname.split("/").length);

    // Procedure for handling initial request for landing page HTML file.
    // Status after testing: Working.
    if (request_url.pathname == "/")
    {
        response.writeHead(200, {"Content-Type" : "text/html"});

        response.write(FileSystem.readFileSync(SearchAllDirsForFile("index.html", current_working_dir_path)));

        response.end();
    }
    else if (request_url.pathname == "/fastdoc/localdb")
    {
        let request_body_str = "";

        request.on("data", (chunk) =>
        {
            request_body_str += chunk;
        });

        request.on("end", () =>
        {
            let request_body_obj = ParseRequestBody(request_body_str);

            if (request_body_obj == null)
            {
                return;
            }

            request_body_obj.command_execution_mode = request_body_obj.command_execution_mode.toLowerCase();

            if (request_body_obj.command_execution_mode == "single")
            {
                ExecuteCommandOnLocalDB(request_body_obj.command_obj_arr[0], response);
            }
            else if (request_body_obj.command_execution_mode == "sequential")
            {
                ExecuteCommandsSequentiallyOnLocalDB(request_body_obj.command_obj_arr, response);
            }
            else if (request_body_obj.command_execution_mode == "parallel")
            {
                ExecuteCommandsInParallelOnLocalDB(request_body_obj.command_obj_arr, response);
            }
            else
            {
                SendStatusCode400Response(response, "Bad Request. The 'command_execution_mode' field in the request body has been set to an incorrect value. The value assigned to this field can only be: 1.) single\n2.) sequential\n3.) parallel\n");
            
                return;
            }
        });
    }
    // Status after testing: Working.
    else if (request_url.pathname.split("/").length == 4 && request_url.pathname.split("/")[1] == "fastdoc")
    {
        // console.log("table_action request received.");

        let selected_table_name = request_url.pathname.split("/")[2];

        let selected_action = request_url.pathname.split("/")[3];

        // console.log("Selected table name: " + selected_table_name);

        // console.log("Selected action: " + selected_action);

        // Status after testing: Working.
        if (selected_action == "get_all")
        {
            SendRequestToDB("GET", selected_table_name, response);
        }
        // Status after testing: Working.
        else if (selected_action == "get")
        {
            let request_body_str = "";

            request.on("data", (chunk) =>
            {
                request_body_str += chunk;
            });

            request.on("end", () =>
            {
                // console.log("request_body_str value: " + request_body_str);

                let request_body_obj = ParseRequestBody(request_body_str, response);

                if (request_body_obj == null)
                {
                    return;
                }

                let query_str = "?q=";

                query_str += JSON.stringify(request_body_obj);

                SendRequestToDB("GET", selected_table_name, response, query_str, null);
                });
        }
        // Status after testing: Working.
        else if (selected_action == "add")
        {
            let request_body_str = "";

            request.on("data", (chunk) =>
            {
                request_body_str += chunk;
            });

            request.on("end", () =>
            {
                let request_body_obj = ParseRequestBody(request_body_str, response);

                if (request_body_obj == null)
                {
                    return;
                }

                SendRequestToDB("POST", selected_table_name, response, "", request_body_obj);
            });
        }
        // Status after testing: Working.
        else if (selected_action == "update")
        {
            let request_body_str = "";

            request.on("data", (chunk) =>
            {
                request_body_str += chunk;
            });

            request.on("end", () =>
            {
                let request_body_obj = ParseRequestBody(request_body_str, response);

                if (request_body_obj == null)
                {
                    return;
                }

                let selected_table_main_id_attrib_name = DeriveStandardIdentifierAttribNameFromTableName(selected_table_name);

                // console.log("selected_table_main_id_attrib_name value: " + selected_table_main_id_attrib_name);

                QueryDB("GET", selected_table_name, `?q={"${selected_table_main_id_attrib_name}": ${request_body_obj[selected_table_main_id_attrib_name]}}`, "", (error, responseObj, body_obj_arr) =>
                {
                    if (error != null)
                    {
                        throw new Error(error);
                    }

                    body_obj_arr = JSON.parse(body_obj_arr);

                    let selected_record_db_sys_id = body_obj_arr[0]._id;

                    // console.log("QueryDB result body value: " + body_obj_arr);

                    // console.log("QueryDB result body stringified value: " + JSON.stringify(body_obj_arr));

                    // console.log("Request body obj JSON string value: " + JSON.stringify(request_body_obj));

                    SendRequestToDB("PUT", selected_table_name, response, `/${selected_record_db_sys_id}`, request_body_obj);
                });
            });
        }
        // Status after testing: Working.
        else if (selected_action == "delete")
        {
            let request_body_str = "";

            request.on("data", (chunk) =>
            {
                request_body_str += chunk;
            });

            request.on("end", () =>
            {
                let request_body_obj = ParseRequestBody(request_body_str, response);

                if (request_body_obj == null)
                {
                    return;
                }

                let query_str = "/*?q=";

                query_str += JSON.stringify(request_body_obj);

                SendRequestToDB("DELETE", selected_table_name, response, query_str, null);
            });
        }
    }
    // Procedure for handling requests for files (e.g. HTML files, CSS files and JS files) for 
    // a webpage when it is being loaded.
    // Sample request url for a file named 'script.js': /script.js
    // Status after testing: Working.
    else if (request.url.split(".").length == 2)
    {
        // console.log(`Handling request for file with name '${request.url.replace("/", "")}'.`);

        let file_path_parts_arr = request.url.split(".")[0].split("/");

        let file_name = file_path_parts_arr[file_path_parts_arr.length - 1];

        let file_extension = request.url.split(".")[1];

        // console.log(`Current file name requested: ${file_name}`);

        if (file_extension == "html")
        {
            response.writeHead(200, {"Content-Type" : "text/html"});
        }
        else if (file_extension == "css")
        {
            response.writeHead(200, {"Content-Type" : "text/css"});
        }
        else if (file_extension == "js")
        {
            response.writeHead(200, {"Content-Type" : "application/javascript"});

            // console.log(`JS file request received. File name requested: '${file_name}'`);
        }
        else if (file_extension == "ico")
        {
            let favicon_ico_file_read_stream = FileSystem.createReadStream(favicon_ico_file_path);

            favicon_ico_file_read_stream.on("open", () =>
            {
                response.writeHead(200, {"Content-Type" : "image/ico"});

                favicon_ico_file_read_stream.pipe(response);
            });

            favicon_ico_file_read_stream.on("error", (error) =>
            {
                response.writeHead(404, {"Content-Type" : "text/html"});

                response.write("Status: Not Found.");
            });
        }
        else if (file_extension == "png")
        {
            response.writeHead(200, {"Content-Type" : `image/png`});
        }
        else if (file_extension == "jpg" || file_extension == "jpeg")
        {
            response.writeHead(200, {"Content-Type" : `image/jpeg`});
        }
        else if (file_extension == "bmp" || file_extension == "avif")
        {
            // console.log("Image request received.");

            response.writeHead(200, {"Content-Type" : `image/png`});
        }

        corresponding_file_path = SearchAllDirsForFile(file_name + "." + file_extension, current_working_dir_path);

        if (corresponding_file_path == "")
        {
            response.statusCode = 404;

            response.write("Status: Not Found.");
        }
        else
        {
            response.write(FileSystem.readFileSync(corresponding_file_path));
        }

        response.end();
    }
    // Procedure for handling other requests which do not have procedures implemented for them yet
    // or are invalid or unrecognized by the server.
    // Status after testing: Working.
    else
    {
        SendStatusCode400Response(response, "Bad Request. An unrecognized/invalid request was sent to the server.");
    }
}

ResolveCurrentWorkingDirPath();

current_full_access_api_key = RetrieveDBFullAccessAPIKey();

InitLocalDB();

http_server = Http.createServer(HandleRequest);

http_server.listen(port_num, host_name, OnHttpServerStartListening);