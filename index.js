async function loadWebserver()
{
    require("./src/servers/webserver");
}

async function loadProxyserver()
{
    require("./src/servers/proxyserver");
}

loadWebserver();
loadProxyserver();