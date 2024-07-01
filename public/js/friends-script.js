document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search_term");

  searchInput.addEventListener("keyup", function () {
    const searchQuery = this.value.trim();

    if (searchQuery === "") {
      document.getElementById("search_results_container").innerHTML = "";
      return;
    }
    document
      .getElementById("search_find")
      .addEventListener("click", function (event) {
        event.preventDefault();

        const searchQuery = document.getElementById("search_term").value.trim();

        if (searchQuery === "") {
          console.log("Empty search query");
          return;
        }

        window.location.href = `http://localhost:3000/search_friends?search_term=${searchQuery}`;
      });

    fetch(`/search_friends?search_term=${searchQuery}`)
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
});
