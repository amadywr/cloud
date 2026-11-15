// Jokes page: fetch a random joke from icanhazdadjoke.com and show it.
// The request goes straight from the visitor's browser to the joke API.
// Our server only sends this file; it never talks to the API itself.

const JOKE_URL = "https://icanhazdadjoke.com/";

const jokeEl = document.getElementById("joke");
const button = document.getElementById("new-joke");

async function loadJoke() {
  // Disable the button while loading so fast clicks don't fire many requests.
  button.disabled = true;
  jokeEl.textContent = "Loading a joke…";

  try {
    // Without "Accept: application/json" this API returns a whole HTML page.
    const response = await fetch(JOKE_URL, {
      headers: { Accept: "application/json" },
    });

    // fetch() only throws on network failure. A 404 or 500 still "succeeds",
    // so check the status code ourselves.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json(); // { id, joke, status }

    // textContent (not innerHTML) so the API can never inject HTML into our page.
    jokeEl.textContent = data.joke;
  } catch (error) {
    console.error("Could not load a joke:", error);
    jokeEl.textContent = "Couldn't load a joke right now. Try again in a moment.";
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", loadJoke);

// Load the first joke as soon as the page opens.
loadJoke();
