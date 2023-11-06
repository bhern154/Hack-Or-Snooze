"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  appendStoriesToPage(storyList.stories, $allStoriesList);
}
$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $loginForm.hide()
  $signupForm.hide()
  appendStoriesToPage(storyList.stories, $allStoriesList);
}

/** Show submit form when "submit" nav link is clicked */

function submitClick(evt) {
  console.debug("submitClick", evt);
  $submitForm.show();
}
$navSubmit.on("click", submitClick);

/** Show favorited stories container when "favorites" nav link is clicked */

async function favoritesClick(evt) {
  console.debug("favoritesClick", evt);
  await updateUserStories();
  hidePageComponents();
  $favoritesStories.show();
  appendStoriesToPage(currentUser.favorites, $allFavoritedStoriesList);
}
$navfavorites.on("click", favoritesClick);

/** Show user's stories container when "My Stories" nav link is clicked */

async function myStoriesClick(evt) {
  console.debug("favoritesClick", evt);
  await updateUserStories();
  hidePageComponents();
  $myStories.show();
  appendStoriesToPage(currentUser.ownStories, $allMyStoriesList);
}
$navStories.on("click", myStoriesClick);