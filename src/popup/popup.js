$(document).ready(function () {
  function setErrorMessage(message) {
    $("#error-message").text(message);
    $("#error-message").show();
  }
  $("button[type='submit']").click(function () {
    setErrorMessage("");
    let username = $("#username").val();
    let password = $("#password").val();
    if (username === "" || password === "") {
      setErrorMessage("Username and password cannot be empty.");
      return;
    }
    $.ajax({
      url: "http://localhost:3000/logic/login",
      method: "POST",
      // timeout: 1500,
      data: { username, password },
      success: function (res) {
        if (res.code === 200) {
          setErrorMessage("Login success.");
          browser.runtime.sendMessage({ type: "popup", data: res });
        } else {
          setErrorMessage(res.msg);
        }
      },
      error: function (err) {
        setErrorMessage(err.statusText);
      },
    });
  });
  $("button[type='register']").click(function () {
    $.ajax({
      url: "http://localhost:3000/logic/login",
      method: "POST",
      // timeout: 1500,
      data: { username, password },
      success: function (res) {
        if (res.code === 200) {
          setErrorMessage("Login success.");
          browser.runtime.sendMessage({ type: "popup", data: res });
        } else {
          setErrorMessage(res.msg);
        }
      },
      error: function (err) {
        setErrorMessage(err.statusText);
      },
    });
    $("button[type='submit']").show();
    $("button[type='register']").hide();
    $("#register-success").show();
  });
  $("#register-a").click(function () {
    $("button[type='submit']").hide();
    $("button[type='register']").show();
  });
});
