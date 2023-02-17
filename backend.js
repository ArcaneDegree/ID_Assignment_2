const Http = require("http");

const FileSystem = require("fs");

const Request = require("request");

const URL = require("url");

const Path = require("path");

const SQLite3 = require("sqlite3");

const JsonWebToken = require("jsonwebtoken");

const required_field_definitions_obj = {
    get_health_article: ["selected_health_article_id", "selected_health_article_title"],
    add_new_health_article: ["Title", "Content"]
};

const secret_key = "4jQI7In!F<o~lPgeARzD6ewD<w=ft5";

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

var http_server = null;

var port_num = 8080;

var host_name = "";

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

    CheckIfTableExistsInLocalDB("FastDocClinic", (table_exists) =>
    {
        if (table_exists == false)
        {
            CreateFastDocClinicTable();
        }
    });
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

function GetFileExtensionFromFileName(file_name)
{
    let current_file_name_dot_separated_parts_arr = file_name.split(".");

    return current_file_name_dot_separated_parts_arr[current_file_name_dot_separated_parts_arr.length - 1];
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

function RetrieveLanIPInfo()
{
    details_file_text = FileSystem.readFileSync(current_working_dir_path + "/details.txt", "utf8");

    details_file_lines = details_file_text.split("\n");

    for (current_line_index = 0; current_line_index < details_file_lines.length; current_line_index++)
    {
        detail_key_val_entry = details_file_lines[current_line_index].split(":");

        if (detail_key_val_entry[0] == "lan_ip")
        {
            return detail_key_val_entry[1];
        }
    }

    return "localhost";
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
                CurrentStatus int,
                MemberImgFilePath varchar(300)
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
                PreviewTitle varchar(1000),
                HealthArticleURLLink varchar(8000),
                HealthArticlePostCreationDate varchar(100),
                HealthArticlePostImgFilePath varchar(300)
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
                Description varchar(1000),
                DoctorImgFilePath varchar(300)
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
                TransactionMethod int,
                FullName varchar(200),
                EmailAddress varchar(200),
                Address varchar(200),
                City varchar(200),
                State varchar(200),
                PostalCode varchar(200),
                CardholderName varchar(200),
                CreditCardNumber varchar(200),
                ExpiryMonth int,
                ExpiryYear int,
                CVV int
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

// The result passed into the result_received_callback_function is of type boolean, it is
// true if the table exists, otherwise it is false.
function CheckIfTableExistsInLocalDB(selected_table_name, result_received_callback_function)
{
    ExecuteCommandStrOnLocalDB(`SELECT COUNT(*) AS 'Count' FROM sqlite_master WHERE type='table' AND name='${selected_table_name}';`,
    (rows) =>
    {
        // console.log("Type of rows: " + typeof rows);

        // console.log("Value of rows: " + JSON.stringify(rows));

        if (rows[0].Count > 0)
        {
            result_received_callback_function(true);
        }
        else
        {
            result_received_callback_function(false);
        }
    });
}

function CreateFastDocClinicTable()
{
    /*
    FastDocClinic
    -> FastDocClinicID => int (Primary Key)
    -> RegionName => varchar(500)
    -> DistrictName => varchar(500)
    */

    ExecuteCommandStrOnLocalDB(`
    CREATE TABLE FastDocClinic (
    FastDocClinicID INTEGER PRIMARY KEY,
    RegionName varchar(500),
    DistrictName varchar(500)
    );
    `,
    null);
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
    // console.log("\nCurrent command string in ExecuteCommandOnLocalDB: " + command_obj.command_str);

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

// Note: The function passed into the rows_received_callback_function parameter of this function must
// contain the following parameters:
// 1.) rows (Type: Array) (Type details: Array of Objects, each Object represents a row in the
// specified database table)
function ExecuteCommandStrOnLocalDB(command_str, rows_received_callback_function)
{
    ExecuteCommandOnLocalDB(new LocalDBCommand(
        command_str,
        [],
        rows_received_callback_function
    ),
    null);
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

function SendInvalidRequestResponse(response_obj)
{
    SendStatusCode400Response(response_obj, "An invalid request was received by the server.");
}

function SendAccessDeniedResponse(response_obj)
{
    SendStatusCode400Response(response_obj, "Access denied. Unauthorized access to this webpage is strictly forbidden.");
}

function SendInvalidTokenResponse(response_obj)
{
    SendStatusCode400Response(response_obj, "An invalid token was received by the server.");
}

function GenerateSessionToken()
{
    return {
        email_address: "",
        passwd: ""
    };
}

// Returns the token Object with a signature.
function SignToken(token_obj)
{
    token_obj.sig = JsonWebToken.sign(token_obj, secret_key);

    return token_obj;
}

// Checks if any values of fields in the token Object has been modified by performing a signature
// check/verification. Returns null if the signature has been modified or if any other errors or
// exceptions occur during the token verification process, otherwise returns an Object containing
// all the fields of the original token Object except for the field containing the signature.
function VerifyToken(token_signature_str)
{
    let payload_obj = null;

    try
    {
        payload_obj = JsonWebToken.verify(token_signature_str, secret_key);
    }
    catch (exception)
    {
        // console.log("Exception occurred: " + exception.message);

        return null;
    }

    return payload_obj;
}

// Procedure for handling requests for files (e.g. HTML files, CSS files and JS files) for 
// a webpage when it is being loaded. This function returns true if the server recognizes the
// request as a valid file request, otherwise it returns false.
// Sample request url for a file named 'script.js': /script.js
// Status after testing: Working.
function HandleFileRequest(request_url_path, response_obj)
{
    let request_url_path_parts_arr = request_url_path.split("/");

    let possible_url_path_file_name = request_url_path_parts_arr[request_url_path_parts_arr.length - 1];

    let possible_request_url_result_file_path = SearchAllDirsForFile(possible_url_path_file_name, current_working_dir_path);

    if (possible_request_url_result_file_path != "")
    {
        // console.log("Request URL path parts: " + JSON.stringify(request_url_path_parts_arr));

        let possible_url_path_file_extension = GetFileExtensionFromFileName(request_url_path_parts_arr[request_url_path_parts_arr.length - 1]);

        // Authorization is not required for the landing/home page, however, for other pages it might
        // be required.
        if (possible_url_path_file_extension == "html" && possible_url_path_file_name != "index.html")
        {
            let session_token_obj = VerifyToken(request_url_path_parts_arr[request_url_path_parts_arr.length - 2]);

            if (session_token_obj == null)
            {
                SendAccessDeniedResponse(response_obj);

                return true;
            }

            if (possible_url_path_file_name == "payment.html")
            {
                SendAccessDeniedResponse(response_obj);

                return true;
            }

            if (possible_url_path_file_name == "sign_up.html")
            {
                if (session_token_obj.email_address != "" || session_token_obj.passwd != "")
                {
                    SendAccessDeniedResponse(response_obj);

                    return true;
                }
            }
        }

        if (possible_url_path_file_extension == "html")
        {
            response_obj.writeHead(200, {"Content-Type" : "text/html"});
        }
        else if (possible_url_path_file_extension == "css")
        {
            response_obj.writeHead(200, {"Content-Type" : "text/css"});
        }
        else if (possible_url_path_file_extension == "js")
        {
            response_obj.writeHead(200, {"Content-Type" : "application/javascript"});

            // console.log(`JS file request received. File name requested: '${file_name}'`);
        }
        else if (possible_url_path_file_extension == "ico")
        {
            let favicon_ico_file_read_stream = FileSystem.createReadStream(favicon_ico_file_path);

            favicon_ico_file_read_stream.on("open", () =>
            {
                response_obj.writeHead(200, {"Content-Type" : "image/ico"});

                favicon_ico_file_read_stream.pipe(response_obj);
            });

            favicon_ico_file_read_stream.on("error", (error) =>
            {
                response_obj.writeHead(404, {"Content-Type" : "text/html"});

                response_obj.write("Status: Not Found.");
            });
        }
        else if (possible_url_path_file_extension == "png")
        {
            response_obj.writeHead(200, {"Content-Type" : `image/png`});
        }
        else if (possible_url_path_file_extension == "jpg" || possible_url_path_file_extension == "jpeg")
        {
            response_obj.writeHead(200, {"Content-Type" : `image/jpeg`});
        }
        else if (possible_url_path_file_extension == "bmp" || possible_url_path_file_extension == "avif")
        {
            // console.log("Image request received.");

            response_obj.writeHead(200, {"Content-Type" : `image/png`});
        }

        response_obj.write(FileSystem.readFileSync(possible_request_url_result_file_path));

        response_obj.end();

        return true;
    }
    else
    {
        return false;
    }
}

// Note: The function passed in the request_body_str_init_callback_function parameter of this function
// must take in the following parameters:
// 1.) request_body_str (Type: String)
function GetRequestBodyStrFromRequestObj(request_obj, request_body_str_init_callback_function)
{
    let request_body_str = "";

    request_obj.on("data", (chunk) =>
    {
        request_body_str += chunk;
    });

    request_obj.on("end", () =>
    {
        request_body_str_init_callback_function(request_body_str);
    });
}

// Note: The function passed in the request_body_obj_init_callback_function parameter of this function
// must take in the following parameters:
// 1.) request_body_obj (Type: Object)
function GetRequestBodyObjFromRequestObj(request_obj, request_body_obj_init_callback_function)
{
    GetRequestBodyStrFromRequestObj(request_obj, (request_body_str) =>
    {
        let request_body_obj = ParseRequestBody(request_body_str);

        if (request_body_obj == null)
        {
            return;
        }

        request_body_obj_init_callback_function(request_body_obj);
    });
}

// Note: The function passed into the is_logged_in_bool_received_callback_function parameter of this
// function must take in the following parameters:
// 1.) is_logged_in (Type: Boolean) (The value of is_logged_in will be true if the user is logged in,
// otherwise the value of is_logged_in will be false)
function IsUserLoggedIn(session_token_payload_obj, is_logged_in_bool_received_callback_function)
{
    ExecuteCommandStrOnLocalDB(`SELECT * FROM Member WHERE EmailAddress = '${session_token_payload_obj.email_address}' AND Passwd = '${session_token_payload_obj.passwd}';`,
    (rows) =>
    {
        if (rows.length > 0)
        {
            is_logged_in_bool_received_callback_function(true);
        }
        else
        {
            is_logged_in_bool_received_callback_function(false);
        }
    });
}

function GetClinicDistrictNames(rows_received_callback_function)
{
    ExecuteCommandStrOnLocalDB("SELECT DistrictName FROM FastDocClinic;",
    rows_received_callback_function);
}

// Note: Certain Chrome browser extensions are known to cause an error on the website with the following
// message: 'Unchecked runtime.lastError: The message port closed before a response was received'. To
// fix this error and prevent it from occurring, the Chrome browser extension causing this error must
// be identified and then disabled. This error is known to be caused by certain Chrome browser
// extensions and not by the website or web application itself.
function HandleRequest(request, response)
{
    let request_url = URL.parse(request.url, true);

    // console.log("Request url: " + request.url);

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
    else if (request_url.pathname == "/get_session_token")
    {
        response.writeHead(200, {"Content-Type": "text/plaintext"});

        response.write(SignToken(GenerateSessionToken()).sig);

        response.end();
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/login_to_acc")
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
                SendInvalidRequestResponse(response);

                return;
            }

            let token_payload_obj = VerifyToken(request_body_obj.session_token);

            if (token_payload_obj == null)
            {
                SendInvalidTokenResponse(response);

                return;
            }

            ExecuteCommandOnLocalDB(new LocalDBCommand(
                `SELECT EmailAddress, Passwd FROM Member WHERE EmailAddress = '${request_body_obj.email_address}' AND Passwd = '${request_body_obj.passwd}';`,
                [],
                (rows) =>
                {
                    response.writeHead(200, {"Content-Type": "text/plaintext"});

                    if (rows.length == 0)
                    {
                        response.write("Invalid login credentials provided.");
                    }
                    else
                    {
                        response.write(SignToken({
                            email_address: request_body_obj.email_address,
                            passwd: request_body_obj.passwd
                        }).sig);
                    }

                    response.end();
                }
            ),
            null
            );
        });
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/logout_of_acc")
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
                SendInvalidRequestResponse(response);

                return;
            }

            let session_token_payload_obj = VerifyToken(request_body_obj.session_token);

            if (session_token_payload_obj == null)
            {
                SendInvalidTokenResponse(response);

                return;
            }

            session_token_payload_obj.email_address = "";

            session_token_payload_obj.passwd = "";

            // console.log("Session token payload object: " + JSON.stringify(session_token_payload_obj));

            response.writeHead(200, {"Content-Type": "text/plaintext"});

            response.write(SignToken(session_token_payload_obj).sig);

            response.end();
        });
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_info_for_doctor_cards")
    {
        ExecuteCommandOnLocalDB(new LocalDBCommand(
            "SELECT Name, Specialization, DoctorImgFilePath FROM Doctor;",
            [],
            null
        ),
        response);
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_info_for_doctor_review_cards")
    {
        ExecuteCommandOnLocalDB(new LocalDBCommand(
            "SELECT Member.Name, Member.MemberImgFilePath, DoctorReview.ReviewStarCount, DoctorReview.Content FROM DoctorReview INNER JOIN Member ON DoctorReview.ReviewingMemberID = Member.MemberID;",
            [],
            null
        ),
        response);
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_info_for_health_article_cards")
    {
        ExecuteCommandOnLocalDB(new LocalDBCommand(
            "SELECT PreviewTitle, HealthArticleURLLink, HealthArticlePostImgFilePath, HealthArticlePostCreationDate FROM HealthArticlePost;",
            [],
            null
        ),
        response);
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_service_booking_page_link")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            let session_token_obj = VerifyToken(request_body_obj.session_token);

            // console.log("Session token Object: " + JSON.stringify(session_token_obj));

            if (session_token_obj == null)
            {
                SendAccessDeniedResponse(response);

                return;
            }

            if (session_token_obj.email_address == "" || session_token_obj.passwd == "")
            {
                SendAccessDeniedResponse(response);

                return;
            }

            response.writeHead(200, {"Content-Type": "text/plaintext"});

            response.write("/" + request_body_obj.session_token + "/service_booking.html");

            response.end();
        });
    }
    else if (request_url.pathname == "/get_sign_up_page_link")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            let session_token_obj = VerifyToken(request_body_obj.session_token);

            if (session_token_obj == null)
            {
                SendInvalidTokenResponse(response);

                return;
            }

            response.writeHead(200, {"Content-Type": "text/plaintext"});

            response.write("/" + request_body_obj.session_token + "/sign_up.html");

            response.end();
        });
    }
    else if (request_url.pathname == "/sign_up_new_member")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            if (request_body_obj.new_member_name == "" || request_body_obj.new_member_email_address == "" || request_body_obj.new_member_passwd == "")
            {
                response.writeHead(200, {"Content-Type": "text/plaintext"});

                response.write("Invalid name/email address/password entered in. Please try again and ensure that your name, email address and password are not blank.");

                response.end();

                return;
            }

            if (request_body_obj.new_member_email_address.includes("@") == false || request_body_obj.new_member_email_address.includes(".") == false)
            {
                response.writeHead(200, {"Content-Type": "text/plaintext"});

                response.write("Invalid email address entered in. Please try again.");

                response.end();

                return;
            }

            ExecuteCommandOnLocalDB(new LocalDBCommand(
                `SELECT * FROM Member WHERE EmailAddress = '${request_body_obj.new_member_email_address}';`,
                [],
                (rows) =>
                {
                    if (rows.length > 0)
                    {
                        response.writeHead(200, {"Content-Type": "text/plaintext"});

                        response.write("Another account with the same email address that you have entered in already exists. Please try again with a different email address.");

                        response.end();

                        return;
                    }

                    ExecuteCommandOnLocalDB(new LocalDBCommand(
                        `INSERT INTO MEMBER
                        (Name, Passwd, EmailAddress, PrivilegeType, CurrentStatus)
                        VALUES
                        (
                            '${request_body_obj.new_member_name}',
                            '${request_body_obj.new_member_passwd}',
                            '${request_body_obj.new_member_email_address}',
                            ${PrivilegeType.NormalMember},
                            ${ActivityStatusType.Offline}
                        );`,
                        [],
                        () =>
                        {
                            response.writeHead(200, {"Content-Type": "text/plaintext"});

                            response.write("New account created successfully.");

                            response.end();
                        }
                    ));
                }
            ),
            null);
        });
    }
    else if (request_url.pathname == "/get_all_doctor_names")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            let session_token_payload_obj = VerifyToken(request_body_obj.session_token);

            if (session_token_payload_obj == null)
            {
                SendAccessDeniedResponse(response);

                return;
            }

            // Use the session token payload Object to check if the client is actually a member. If not,
            // then they are not authorized to perform this request and will be denied access to the
            // requested information.
            ExecuteCommandStrOnLocalDB(`SELECT * FROM Member WHERE EmailAddress = '${session_token_payload_obj.email_address}' AND Passwd = '${session_token_payload_obj.passwd}';`,
            (rows) =>
            {
                // Check if client is not a member.
                if (rows.length == 0)
                {
                    SendAccessDeniedResponse(response);

                    return;
                }

                ExecuteCommandStrOnLocalDB(`SELECT Name FROM Doctor;`,
                (rows) =>
                {
                    response.writeHead(200, {"Content-Type": "application/json"});

                    response.write(JSON.stringify(rows));

                    response.end();
                });
            });
        });
    }
    else if (request_url.pathname == "/is_logged_in")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            let session_token_payload_obj = VerifyToken(request_body_obj.session_token);

            if (session_token_payload_obj == null)
            {
                SendAccessDeniedResponse(response);

                return;
            }

            IsUserLoggedIn(session_token_payload_obj, (is_logged_in) =>
            {
                response.writeHead(200, {"Content-Type": "text/plaintext"});

                response.write(is_logged_in.toString());

                response.end();
            });
        });
    }
    else if (request_url.pathname == "/get_clinic_district_names")
    {
        GetRequestBodyObjFromRequestObj(request, (request_body_obj) =>
        {
            let session_token_payload_obj = VerifyToken(request_body_obj.session_token);

            if (session_token_payload_obj == null)
            {
                SendAccessDeniedResponse(response);

                return;
            }

            IsUserLoggedIn(session_token_payload_obj, (is_logged_in) =>
            {
                if (is_logged_in == false)
                {
                    SendAccessDeniedResponse(response);

                    return;
                }

                GetClinicDistrictNames((rows) =>
                {
                    response.writeHead(200, {"Content-Type": "application/json"});

                    response.write(JSON.stringify(rows));

                    response.end();
                });
            });
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
    else
    {
        // Procedure for handling requests for files (e.g. HTML files, CSS files and JS files) for 
        // a webpage when it is being loaded.
        let is_file_request = HandleFileRequest(request_url.pathname, response);

        // Procedure for handling other requests which do not have procedures implemented for them yet
        // or are invalid or unrecognized by the server.
        // Status after testing: Working.
        if (is_file_request == false)
        {
            SendStatusCode400Response(response, "Bad Request. An unrecognized/invalid request was sent to the server.");
        }
    }
}

ResolveCurrentWorkingDirPath();

current_full_access_api_key = RetrieveDBFullAccessAPIKey();

host_name = RetrieveLanIPInfo();

// console.log("Host: " + host_name);

InitLocalDB();

http_server = Http.createServer(HandleRequest);

http_server.listen(port_num, host_name, OnHttpServerStartListening);