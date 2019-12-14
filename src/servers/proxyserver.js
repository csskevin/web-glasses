var httpProxy = require("http-proxy");
var http = require("http");
var url = require("url");
var net = require('net');

function interceptHTTPDomains(url_parts)
{
  var protocol = url_parts.protocol;
  var host = url_parts.host;
  // Intercept for *.web-glasses.local to route to local server
  if(host.includes("web-glasses.local"))
  {
    var webserver_port = process.env.WEBGLASSES_WEB_PORT || 6000;
    host = "127.0.0.1:" + webserver_port;
  } 
  return protocol + "//" + host;
}

function onClientConnect(request, response)
{
  var url_parts = url.parse(request.url);

  var target = interceptHTTPDomains(url_parts);
  var proxy = httpProxy.createProxyServer({});
  proxy.on("error", onProxyError.bind(null, response));
  proxy.web(request, response, {target});
}

function onProxyError(connected_client_response)
{
  connected_client_response.end();
}

var proxy_port = process.env.WEBGLASSES_PROXY_PORT || 6001;
var server = http.createServer(onClientConnect).listen(proxy_port);

var regex_hostport = /^([^:]+)(:([0-9]+))?$/;
var getHostPortFromString = function (hostString, defaultPort) {
  var host = hostString;
  var port = defaultPort;
  var result = regex_hostport.exec(hostString);
  if (result != null) {
    host = result[1];
    if (result[2] != null) {
      port = result[3];
    }
  }
  return { host, port };
};

server.addListener('connect', function (req, socket, bodyhead) {
  var hostPort = getHostPortFromString(req.url, 443);
  var hostDomain = hostPort.host;
  var port = parseInt(hostPort.port);

  var proxySocket = new net.Socket();
  proxySocket.connect(port, hostDomain, function () {
      proxySocket.write(bodyhead);
      socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    }
  );

  proxySocket.on('data', function (chunk) {
    socket.write(chunk);
  });

  proxySocket.on('end', function () {
    socket.end();
  });

  proxySocket.on('error', function () {
    socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
    socket.end();
  });

  socket.on('data', function (chunk) {
    proxySocket.write(chunk);
  });

  socket.on('end', function () {
    proxySocket.end();
  });

  socket.on('error', function () {
    proxySocket.end();
  });
});