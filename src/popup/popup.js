$(document).ready(function () {
  $("button").click(function () {
    let username = $("#username").val();
    let password = $("#password").val();
    $.ajax({
      url: "http://localhost:3000/logic/login",
      method: "POST",
      data: { username, password },
      success: function (res) {
        browser.runtime.sendMessage({ type: "popup", data: res });
      },
      error: function (err) {
        // TODO: The error message should be different based on the error
        $("#error-message").show();
        browser.runtime.sendMessage({ type: "popup-error", data: {} });
      },
    });
  });
});
