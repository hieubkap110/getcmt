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

function cleanComment(comment) {
  let cleanedComment = comment
    .replace(/Đúng với mô tả:[^\n]*\n/g, "")
    .replace(/Chất lượng sản phẩm:[^\n]*\n\n/g, "")
    .replace(/Công dụng:[^\n]*\n/g, "")
    .replace(/Đối tượng sử dụng:[^\n]*\n/g, "")
    .replace(/Mùi hương:[^\n]*\n/g, "")
    .replace(/Phù hợp với loại da:[^\n]*\n/g, "")
    .replace(/Chất liệu:[^\n]*\n/g, "")
    .replace(/Độ bền:[^\n]*\n/g, "")
    .replace(/Kiểu dáng:[^\n]*\n/g, "")
    .replace(/Chất lượng sản phẩm:[^\n]*\n/g, "")
    .replace(/Độ tuổi sử dụng:[^\n]*\n/g, "")
    .replace(/Khả năng thấm hút:[^\n]*\n/g, "")
    .replace(/Độ dày:[^\n]*\n/g, "")
    .replace(/^\s*[\r\n]/gm, "");
  return cleanedComment.trim();
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
    const cleanedComment = cleanComment(current.comment);
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
        ratingColumn.classList.add("d-flex");
        ratingColumn.innerHTML = generateStarIcons(commentObj.rating_star);

        const actionColumn = document.createElement("td");
        actionColumn.classList.add("d-flex", "align-items-center");

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

        actionColumn.appendChild(editButton);
        actionColumn.appendChild(deleteButton);

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
        commentListItem.textContent = commentObj.comment;

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
      cleanComment(editedCommentText);
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
      return '<div class="fas fa-star rating-star"></div>';
    } else {
      return '<i class="fas fa-star empty-star"></i>';
    }
  });

  return starIcons.join("");
}

// Initial display of comments
displayComments(jsonArray);
