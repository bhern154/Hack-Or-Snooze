"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $allStoriesList.show();
  updateNavOnLogin();
}

//get list of user's favorites
async function requestUserFavorites(){
    const request = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      params: {
        token: currentUser.loginToken,
      },
      method: "GET",
    });
    return request;
}

function fillFavorites(stories){
  const favoriteIds = currentUser.favorites.map(story => (story.storyId));
  stories.forEach(item => {
    if (favoriteIds.includes(item.storyId)){
      $(`.${item.storyId}`)[0].children[0].children[0].className = "fa-star fas";
    }
  });
}

function appendTrashIcons(stories){
  const myStoryIds = currentUser.ownStories.map(story => (story.storyId));
  stories.forEach(item => {
    if (myStoryIds.includes(item.storyId)){
      $(`.${item.storyId} .star`).after("<span class='trash'><i class='fa fa-trash-o'></i></span>");
    }
  });
  $(".trash").on("click", deleteStory);
}

async function favoriteStory(evt){
  const idClicked = evt.target.parentElement.parentElement.className;
  const favoriteIds = currentUser.favorites.map(item => item.storyId);
  //api requests to favorite (POST) or unfavorite (DELETE) a story
  if(!favoriteIds.includes(idClicked)){
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${idClicked}`,
      data: {
        token: currentUser.loginToken,
      },
      method: "POST",
    });
    evt.target.className = "fa-star fas"; //make star solid/filled
  } else {
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${idClicked}`,
      data: {
        token: currentUser.loginToken,
      },
      method: "DELETE",
    });
    evt.target.className = "far fa-star"; //make star empty/outlined
  }
}

async function updateUserStories() {
  const request = await axios({
    url: `${BASE_URL}/users/${currentUser.username}`,
    params: {
      token: currentUser.loginToken,
    },
    method: "GET",
  });

  const myFavorites = request.data.user.favorites.map(story => new Story(story));
  currentUser.favorites = new StoryList(myFavorites).stories;

  const myStories = request.data.user.stories.map(story => new Story(story));
  currentUser.ownStories = new StoryList(myStories).stories;
}

async function deleteStory(evt){
  const idClicked = evt.target.parentElement.parentElement.className;
  $(evt.target.parentElement).parent()[0].remove();
  //api request to DELETE a story
  const response = await axios({
    url: `${BASE_URL}/stories/${idClicked}`,
    data: {
      token: currentUser.loginToken,
    },
    method: "DELETE",
  });
}