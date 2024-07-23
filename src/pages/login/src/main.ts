import $ from "jquery";
import "./output.css";

const serverUrl = import.meta.env.VITE_SERVER;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
      <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          class="mx-auto h-10 w-auto"
          src="./stylish-reader.svg"
          alt="Your Company"
        />
        <h2
          class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Sign in to your account
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6">
          <div>
            <label
              for="username"
              class="block text-sm font-medium leading-6 text-gray-900"
              >User Name</label
            >
            <div class="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Password</label
              >
              <!-- <div class="text-sm">
                <a
                  href="#"
                  class="font-semibold text-pink-600 hover:text-pink-500"
                  >Forgot password?</a
                >
              </div> -->
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              id="login-btn"
              class="flex w-full justify-center rounded-md bg-pink-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
            >
              Sign in
            </button>
              <button
              style="display:none"
              id="register-btn"
              type="submit"
              class="flex w-full justify-center rounded-md bg-pink-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
              >
              Register
              </button>
          </div>
        </form>

        <p class="mt-4 text-center text-pink-700" id="error-message">
          <span></span>
        </p>
        
        <p class="mt-7 text-center text-sm text-gray-500 cursor-pointer">
          <span id="not-a-member">Not a member?</span>
          <span style="display:none" id="want-to-login">I want to</span>
          <a 
            class="cursor-pointer font-semibold leading-6 text-pink-600 hover:text-pink-500"
            >
            <span style="cursor:pointer" id="register-span">Register Here</span>
            <span style="cursor:pointer;display:none" id="login-span">Login</span>
            </a
          >
        </p>
       
      </div>
    </div>
`;

// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
$(function () {
  $("#register-span").on("click", function () {
    console.log("register span clicked...");
    $("#register-btn").show();
    $("#login-span").show();
    $("#want-to-login").show();
    $("#login-btn").hide();
    $("#register-span").hide();
    $("#not-a-member").hide();
  });

  $("#login-span").on("click", function () {
    console.log("login span clicked...");
    $("#register-btn").hide();
    $("#login-span").hide();
    $("#want-to-login").hide();
    $("#login-btn").show();
    $("#register-span").show();
    $("#not-a-member").show();
  });

  $("#register-btn").on("click", function (event) {
    event.preventDefault();
  });

  $("#login-btn").on("click", function (event) {
    event.preventDefault();
    const username = $("#username").val();
    const password = $("#password").val();

    $.ajax({
      url: `${serverUrl}/logic/login`,
      method: "POST",
      // timeout: 1500,
      data: { username, password },
      success: function (res) {
        if (res.code === 200) {
          browser.runtime.sendMessage({ type: "login-success", data: res });
          $("#error-message").text("Login success");
        } else {
          $("#error-message").text(res.msg);
          clearErrorMessageAfterTimeout();
        }
      },
      error: function (err) {
        $("#error-message").text(err.statusText);
        clearErrorMessageAfterTimeout();
      },
    });
  });
});

function clearErrorMessageAfterTimeout() {
  setTimeout(() => {
    $("#error-message").text("");
  }, 2380);
}
