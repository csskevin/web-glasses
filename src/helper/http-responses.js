class Responses {
    appNotFound(response)
    {
        response.statusMessage = "App could not be found!";
        response.status(404).end();
    }

    FileNotFound(response)
    {
        response.statusMessage = "File not found!";
        response.status(404).end();
    }

    FileNotAccessible(response)
    {
        response.statusMessage = "File not accessible!";
        response.status(500).end();
    }

    invalidRequestBody(response)
    {
        response.statusMessage = "Invalid Request Body!";
        response.status(403).end();
    }

    methodNotAllowed(response)
    {
        response.statusMessage = "Method not allowed!";
        response.status(403).end();
    }

    permissionNotGranted(response)
    {
        response.statusMessage = "Permission could not be granted!";
        response.status(403).end();
    }
}

module.exports = new Responses();