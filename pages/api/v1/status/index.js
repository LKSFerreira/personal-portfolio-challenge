// pages/api/v1/status/index.js

function status(request, response) {
  response.status(200).send("ok");
}

export default status;