let server_url = "http://localhost:3000";
$(document).ready(function () {
  function setErrorMessage(message) {
    $("#error-message").text(message);
    $("#error-message").show();
  }

  $("button[type='submit']").click(function () {
    console.log("submit");
    setErrorMessage("");
    let username = $("#username").val();
    let password = $("#password").val();
    if (username === "" || password === "") {
      setErrorMessage("Username and password cannot be empty.");
      return;
    }

    $.ajax({
      url: `${server_url}/logic/login`,
      method: "POST",
      // timeout: 1500,
      data: { username, password },
      success: function (res) {
        if (res.code === 200) {
          setErrorMessage("Login success.");
          browser.runtime.sendMessage({ type: "login-success", data: res });
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
    setErrorMessage("");
    console.log("register");
    let username = $("#username").val();
    let password = $("#password").val();
    $.ajax({
      url: `${server_url}/user/create`,
      method: "POST",
      // timeout: 1500,
      data: { username, password, ignore: true, source: "stylish" },
      success: function (res) {
        if (res.code === 200) {
          setErrorMessage("Register success. Please login in");
          browser.runtime.sendMessage({ type: "popup", data: res });
          $("button[type='submit']").show();
          $("button[type='register']").hide();
          $("#register-success").show();
        } else {
          setErrorMessage(res.msg);
        }
      },
      error: function (err) {
        setErrorMessage(err.statusText);
      },
    });
  });

  $("#register-a").click(function () {
    $("button[type='submit']").hide();
    $("button[type='register']").show();
  });

  $("#contact-author").click(function () {
    $("#close-contact-info").show();
    $("#contact-info-img").show();
  });

  $("#close-contact-info").click(function () {
    console.log("hide");
    $("#close-contact-info").hide();
    $("#contact-info-img").hide();
  });
});
