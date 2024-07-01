document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search_term");
  const searchForm = document.getElementById("search_friends_form");

  searchInput.addEventListener("keyup", function () {
    const searchQuery = this.value.trim();

    if (searchQuery === "") {
      document.getElementById("search_results_container").innerHTML = "";
      return;
    }

    fetch(`/search_friends?search_term=${searchQuery}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        document.getElementById("search_results_container").innerHTML = data;
      })
      .catch((error) => {
        console.error("Error searching for friends:", error);
      });
  });

  searchForm.addEventListener("submit", function (event) {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      event.preventDefault();
      window.location.href = `/search_friends?search_term=${searchQuery}`;
    }
  });
});
