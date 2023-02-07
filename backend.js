const Http = require("http");

const FileSystem = require("fs");

const Request = require("request");

const URL = require("url");

const required_field_definitions_obj = {
    get_health_article: ["selected_health_article_id", "selected_health_article_title"],
    add_new_health_article: ["Title", "Content"]
};

var http_server = null;

var port_num = 8080;

var host_name = "localhost";

/*
Previously current_working_dir_path value:
C:/Poly/Interactive_Development_Y1S2/ASG2/ID_Assignment_2
*/
var current_working_dir_path = __dirname;

var current_full_access_api_key = RetrieveDBFullAccessAPIKey();

var db_host_name = "interactivedevasg2db-e461.restdb.io";

function OnHttpServerStartListening()
{
    console.log("Started listening on port " + port_num + ".");
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

function SendStatusCode400Response(response_text = "Bad Request")
{
    response.writeHead(400, {"Content-Type": "text/plain"});

    response.write(response_text);

    response.end();
}

function ParseRequestBody(request_body_data)
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
        SendStatusCode400Response();
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

        SendStatusCode400Response(response_text);
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

function HandleRequest(request, response)
{
    // console.log(request.url);

    let request_url = URL.parse(request.url, true);

    // Procedure for handling initial request for landing page HTML file.
    // Status after testing: Working.
    if (request_url.pathname == "/")
    {
        response.writeHead(200, {"Content-Type" : "text/html"});

        response.write(FileSystem.readFileSync(SearchAllDirsForFile("index.html", current_working_dir_path)));

        response.end();
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_members_data")
    {
        // console.log("Received get_members_data request.");

        SendRequestToDB("GET", "member", response);
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_all_health_articles")
    {
        SendRequestToDB("GET", "health-article-post", response);
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/get_health_article")
    {
        let request_body = "";

        request.on("data", (chunk) =>
        {
            request_body += chunk;
        });

        request.on("end", () =>
        {
            let request_details_obj = ParseRequestBody(request_body);
            
            if (request_details_obj == null)
            {
                return;
            }

            /*
            if (CheckForRequiredFieldsInRequestBodyObj(request_body_obj, request_url.pathname).length > 0)
            {
                return;
            }
            */

            // console.log("Request details obj: " + request_details_obj);

            // console.log("Request details obj selected_health_article_id value: " + request_details_obj.selected_health_article_id);
            
            // console.log("Type of request_details_obj: " + typeof request_details_obj);

            SendRequestToDB("GET", "health-article-post", response, `?q={"HealthArticlePostID": ${request_details_obj.selected_health_article_id}}`); 
        });
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/add_new_health_article")
    {
        let request_body = "";

        request.on("data", (chunk) =>
        {
            request_body += chunk;
        });

        request.on("end", () =>
        {
            let request_body_obj = ParseRequestBody(request_body);

            if (request_body_obj == null)
            {
                return;
            }

            /*
            if (CheckForRequiredFieldsInRequestBodyObj(request_body_obj, request_url.pathname).length > 0)
            {
                return;
            }
            */

            // console.log("Request body obj in JSON format: " + JSON.stringify(request_body_obj));

            SendRequestToDB("POST", "health-article-post", response, "", request_body_obj);
        });
    }
    // Status after testing: Working.
    else if (request_url.pathname == "/update_health_article")
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

            QueryDB("GET", "health-article-post", `?q={"HealthArticlePostID": ${request_body_obj.HealthArticlePostID}}`, "", (error, responseObj, body_obj_arr) =>
            {
                if (error != null)
                {
                    throw new Error(error);
                }

                body_obj_arr = JSON.parse(body_obj_arr);

                let health_article_post_db_sys_id = body_obj_arr[0]._id;

                // console.log("QueryDB result body value: " + body_obj_arr);

                // console.log("QueryDB result body stringified value: " + JSON.stringify(body_obj_arr));

                // console.log("Request body obj JSON string value: " + JSON.stringify(request_body_obj));

                SendRequestToDB("PUT", "health-article-post", response, `/${health_article_post_db_sys_id}`, request_body_obj);
            });
        });
    }
    // Procedure for handling requests for files (e.g. HTML files, CSS files and JS files) for 
    // a webpage when it is being loaded.
    // Sample request url for a file named 'script.js': /script.js
    // Status after testing: Working.
    else
    {
        // console.log(`Handling request for file with name '${request.url.replace("/", "")}'.`);

        let file_extension = request.url.split(".")[1];

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
        }

        corresponding_file_path = SearchAllDirsForFile(request.url.replace("/", ""), current_working_dir_path);

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
}

http_server = Http.createServer(HandleRequest);

http_server.listen(port_num, host_name, OnHttpServerStartListening);