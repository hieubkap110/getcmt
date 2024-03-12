var jsonArray = [];
let editedIndex = -1;
let viewMode = "table";

function addJsonData() {
  var inputData = document.getElementById("input-data").value;

  try {
    var parsedData = JSON.parse(inputData);
    parsedData = parsedData.data.ratings;

    if (Array.isArray(parsedData)) {
      jsonArray = jsonArray.concat(parsedData);
    } else {
      jsonArray.push(parsedData);
    }

    displayComments(jsonArray);

    document.getElementById("input-data").value = "";
  } catch (error) {
    alert("Chưa thêm dữ liệu");
  }
}

const commentsListDiv = document.getElementById("commentsList");
const totalCommentsParagraph = document.getElementById("totalComments");
const commentListView = document.getElementById("commentListView");
const tableContainer = document.querySelector(".table-container");
const commentListContainer = document.querySelector(".comment-list-container");

function cleanComment(comment, templateTags = []) {
  let cleanedComment = comment;

  // Loại bỏ từ khóa trong templateTags
  templateTags.forEach(keyword => {
    cleanedComment = cleanedComment.replace(new RegExp(`${keyword}:[^\n]*\n`, 'g'), '');
  });

  // Loại bỏ các dòng trắng và khoảng trắng ở đầu và cuối chuỗi
  cleanedComment = cleanedComment.replace(/^\s*[\r\n]/gm, "").trim();

  return cleanedComment;
}


function shuffleArray() {
  for (let i = jsonArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jsonArray[i], jsonArray[j]] = [jsonArray[j], jsonArray[i]];
  }
  displayComments(jsonArray);
}

function displayComments(commentsArray) {
  commentsListDiv.innerHTML = "";
  commentListView.innerHTML = "";

  let uniqueComments = commentsArray.reduce((acc, current, index) => {
    const cleanedComment = cleanComment(current.comment, current.template_tags);
    if (
      cleanedComment &&
      !acc.find((comment) => cleanComment(comment.comment) === cleanedComment)
    ) {
      acc.push({ ...current, comment: cleanedComment });
    }
    return acc;
  }, []);

  uniqueComments.forEach((commentObj, index) => {
    if (commentObj.comment) {
      if (viewMode === "table") {
        const commentContainer = document.createElement("tr");

        // Thêm cột số thứ tự
        const indexColumn = document.createElement("td");
        indexColumn.textContent = index + 1;

        const commentColumn = document.createElement("td");
        commentColumn.innerHTML = highlightSearchKeyword(commentObj.comment);

        const authorColumn = document.createElement("td");
        authorColumn.textContent = commentObj.author_username;

        const submitTimeColumn = document.createElement("td");
        submitTimeColumn.textContent = submitTimeColumn.textContent = moment(
          commentObj.submit_time * 1000
        ).format("DD/MM/YYYY, h:mm:ss");
        const ratingColumn = document.createElement("td");
        ratingColumn.innerHTML = generateStarIcons(commentObj.rating_star);

        const actionColumn = document.createElement("td");
        const actionColumnDiv = document.createElement("div");
        actionColumnDiv.classList.add("d-flex");
        actionColumn.appendChild(actionColumnDiv);

        // Edit button
        const editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-primary", "edit-button");
        editButton.innerHTML = "Sửa";
        editButton.onclick = () => openEditModal(commentObj.cmtid);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "delete-button");
        deleteButton.innerHTML = "Xoá";
        deleteButton.onclick = () => deleteComment(commentObj.cmtid);

        actionColumnDiv.appendChild(editButton);
        actionColumnDiv.appendChild(deleteButton);

        // Thêm cột vào dòng
        commentContainer.appendChild(indexColumn);
        commentContainer.appendChild(commentColumn);
        commentContainer.appendChild(authorColumn);
        commentContainer.appendChild(submitTimeColumn);
        commentContainer.appendChild(ratingColumn);
        commentContainer.appendChild(actionColumn);

        commentsListDiv.appendChild(commentContainer);
      } else if (viewMode === "list") {
        const commentListItem = document.createElement("li");
        commentListItem.textContent = commentObj.comment.replace(/\n/g, ' ');
        commentListView.appendChild(commentListItem);
      }
    }
  });

  totalCommentsParagraph.textContent = `Tổng số comment: ${uniqueComments.length}`;
  toggleViewElements();
}

function toggleViewElements() {
  if (viewMode === "table") {
    tableContainer.style.display = "block";
    commentListContainer.style.display = "none";
  } else if (viewMode === "list") {
    tableContainer.style.display = "none";
    commentListContainer.style.display = "block";
  }
}

function deleteComment(cmtid) {
  const index = jsonArray.findIndex((commentObj) => commentObj.cmtid === cmtid);
  if (index !== -1) {
    jsonArray.splice(index, 1);
    displayComments(jsonArray);
  }
}

function openEditModal(cmtid) {
  const commentObj = jsonArray.find((comment) => comment.cmtid === cmtid);
  if (commentObj) {
    editedIndex = jsonArray.indexOf(commentObj);
    const editedCommentText = commentObj.comment;
    document.getElementById("editedComment").value =
      cleanComment(editedCommentText, commentObj.template_tags).replace(/\n/g, ' ');
    new bootstrap.Modal(document.getElementById("editModal")).show();
  }
}

function saveEditedComment() {
  if (editedIndex !== -1) {
    const editedComment = document.getElementById("editedComment").value;
    jsonArray[editedIndex].comment = editedComment;
    displayComments(jsonArray);
    // Đóng modal
    document.getElementById("editModal").querySelector(".btn-close").click();
  }
}

function toggleView() {
  viewMode = viewMode === "table" ? "list" : "table";
  displayComments(jsonArray);
}

let searchKeyword = "";

function searchComments() {
  searchKeyword = document.getElementById("searchInput").value.toLowerCase();
  const filteredComments = jsonArray.filter((commentObj) =>
    commentObj.comment.toLowerCase().includes(searchKeyword)
  );
  displayComments(filteredComments);
}

function highlightSearchKeyword(comment) {
  if (searchKeyword !== "") {
    const regex = new RegExp(searchKeyword, "gi");
    return comment.replace(
      regex,
      (match) => `<span class="highlight">${match}</span>`
    );
  } else {
    return comment;
  }
}

function generateStarIcons(rating) {
  const starIcons = Array.from({ length: 5 }, (_, index) => {
    if (index < rating) {
      return '<i class="fas fa-star rating-star"></i>';
    } else {
      return '<i class="far fa-star empty-star"></i>';
    }
  });

  return starIcons.join("");
}

// Initial display of comments
displayComments(jsonArray);
