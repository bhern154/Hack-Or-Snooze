"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  appendStoriesToPage(storyList.stories, $allStoriesList);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup");
  const hostName = story.getHostName();
  return $(`
      <li class="${story.storyId}">
        <span class="star"><i class="far fa-star"></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <p class="story-author">by ${story.author}</p>
        <p class="story-user">posted by ${story.username}</p>
      </li>
      <hr class="solid">
    `);
}

function emptyStoryLists(){
  $allStoriesList.empty();
  $allFavoritedStoriesList.empty();
  $allMyStoriesList.empty();
}

/** Gets list of stories from storyList or currentUser, generates their HTML, and puts on page. */
function appendStoriesToPage(stories, $storiesBlock) {
  console.debug("appendStoriesToPage");
  emptyStoryLists();
  stories.forEach(story => $storiesBlock.append(generateStoryMarkup(story)));
  $storiesBlock.show();
  fillFavorites(stories);
  appendTrashIcons(stories);
  $(".star").on("click", favoriteStory); //add listener for star favorite clicks
}

/** Gets new story info from UI, calls addStory, and puts on page. */
async function submitNewStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();
  const author = $("#submit-author").val();
  const title = $("#submit-title").val();
  const url = $("#submit-url").val();
  await storyList.addStory(currentUser, {title, author, url});
  $submitForm.hide();
  // appendStoriesToPage(storyList.stories, $allStoriesList);
  await getAndShowStoriesOnStart();
}

$submitForm.on("submit", submitNewStory);

/* Cancel new story submission - hides submit HTML block. */
function cancelSubmit(evt){
  console.debug("cancelSubmit");
  evt.preventDefault();
  $submitForm.hide();
}

$cancelSubmitForm.on("click", cancelSubmit);