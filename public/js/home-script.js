//EN COURS...

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submit_status_button")
    .addEventListener("click", function () {
      const status_val = document.getElementById("statuses_textarea").value;
      const user_status = { user_status: status_val };
      console.log("status_val", status_val);
      document.getElementById("statuses_textarea").value = "";

      fetch("/user_status/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user_status),
      })
        .then((response) => response.json())
        .then((saved_status) => {
          console.log("Response from server:", saved_status);
          window.location.reload();
          const listItem = document.createElement("li");
          listItem.classList.add("clearfix");
          listItem.innerHTML = `<img src=${saved_status.profile_pic}><div class='poster_name'>${saved_status.firstname}</div><p>${status_val}</p>`;
          document.querySelector(".user_statuses").appendChild(listItem);
        })
        .catch((error) => {
          console.error("Error during status posting:", error);
        });
    });

  document.querySelectorAll(".delete_status_button").forEach((button) => {
    button.addEventListener("click", function () {
      const listItem = this.closest("li");
      const statusId = listItem.getAttribute("data-id");
      fetch(`/user_status/${statusId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            listItem.remove();
            location.reload();
          } else {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
        })
        .catch((error) => {
          console.error("Error deleting status:", error);
        });
    });
  });

  document.querySelectorAll(".delete_comment_button").forEach((button) => {
    button.addEventListener("click", function () {
      const commentId = this.closest("p").getAttribute("data-comment-id");
      if (!commentId) {
        console.error("Comment ID is missing or invalid.");
        return;
      }

      fetch(`/comment/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.reload();
          } else {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
        })
        .catch((error) => {
          console.error("Error deleting comment:", error);
        });
    });
  });

  document.querySelectorAll(".comment_form").forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const statusId = this.getAttribute("data-id");
      const commentText = this.querySelector(
        'textarea[name="comment_text"]'
      ).value;

      fetch(`/user_status/${statusId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment_text: commentText }),
      })
        .then((response) => response.json())
        .then((savedComment) => {
          const commentList =
            this.closest(".user_status_item").querySelector(".comments-list");
          const commentElement = document.createElement("p");
          commentElement.textContent = `Commentaire: ${savedComment.comment_text}`;
          commentList.appendChild(commentElement);

          this.querySelector('textarea[name="comment_text"]').value = "";
        })
        .catch((error) => {
          console.error("Error during comment posting:", error);
        });
    });
  });
});
