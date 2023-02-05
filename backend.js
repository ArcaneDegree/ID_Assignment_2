var Http = require("http");

var FileSystem = require("fs");

var http_server = null;

var dbg_mode = true;

var port_num = 8080;

var host_name = "localhost";

var current_working_dir_path = "C:/Poly/Interactive_Development_Y1S2/ASG2/ID_Assignment_2";

function OnHttpServerStartListening()
{
    if (dbg_mode == true)
    {
        console.log("Started listening on port 8080.");
    }
}

function HandleRequest(request, response)
{
    if (request.url = "/")
    {
        if (dbg_mode == true)
        {
            console.log("Received initial request.");
        }

        response.writeHead(200, {"Content-Type" : "text/html"});

        response.write(FileSystem.readFileSync(current_working_dir_path + "/homepage.html"));

        response.end();
    }
    else
    {
        let file_extension = request.url.split(".")[1];

        if (file_extension == ".html")
        {
            response.writeHead(200, {"Content-Type" : "text/html"});
        }
        else if (file_extension == ".css")
        {
            response.writeHead(200, {"Content-Type" : "text/css"});
        }
        else if (file_extension == ".js")
        {
            response.writeHead(200, {"Content-Type" : "application/javascript"});
        }

        response.write(FileSystem.readFileSync(current_working_dir_path + request.url));

        response.end();
    }
}

http_server = Http.createServer(HandleRequest);

http_server.listen(port_num, host_name, OnHttpServerStartListening);