//#region  Declaration
import { commentApp, commentObject, replyObject } from "./commentApp.js";
import modal from "../js/modal-popup.js";
// const url = "../data/data.json";
const url =
  "https://monaelshikh.github.io/interactive-comments-section/data/data.json";
const commentsDiv = <HTMLDivElement>document.querySelector(".comments");
let result: commentApp;
let _commentObject: commentObject;
let _replyObject: replyObject;
let currentUser: string;
let mainContainer = <HTMLElement>document.querySelector(".container");
let divContainer: any;
//#endregion
//#region Functions
function addToLocalStorage(source: {}) {
  localStorage.setItem("comment-app", JSON.stringify(source));
}
function getFromLocalStorage() {
  if (localStorage.getItem("comment-app")) {
    return JSON.parse(localStorage.getItem("comment-app") || "");
  }
  return false;
}
// function to create elements and add it to the page dom.
function addDataToPage() {
  commentsDiv.innerHTML = "";
  // get data from local storage
  let data: commentApp = getFromLocalStorage();
  currentUser = data.currentUser.username;
  if (data.comments.length > 0) {
    data.comments.forEach((comment: any) => {
      if (commentsDiv) {
        // create comment box for each comment object in data
        commentsDiv.appendChild(createCommentOrReplyBox(comment, "comment"));
        // if comment has replies load them
        if (comment.replies.length > 0) {
          let repliesDiv = document.createElement("div");
          repliesDiv.className = "replies";
          comment.replies.forEach((reply: any) => {
            repliesDiv.appendChild(createCommentOrReplyBox(reply, "reply"));
          });
          commentsDiv.appendChild(repliesDiv);
        }
      }
    });
    // add the -add new comment box - at bottom
    if (commentsDiv) {
      commentsDiv.appendChild(createAddCommentOrReplyBox(data, "Send"));
    }
  }
}
// function to create a comment or reply box
function createCommentOrReplyBox(item: any, className: string): any {
  // create the comment box
  let commentDiv = <HTMLDivElement>document.createElement("div");
  commentDiv.className = className;
  commentDiv.setAttribute("data-index", item.id);
  // create comment data that contains the header and the body
  let commentDataDiv = document.createElement("div");
  commentDataDiv.className = `${className}-data`;
  // crerate comment header that will contain the image, name and created at
  let commentHeaderDiv = document.createElement("div");
  commentHeaderDiv.className = `${className}-header`;
  //   create the img,h2 and h3
  let userImg = document.createElement("img");
  userImg.src = item.user.image.webp;
  userImg.alt = "userImage";
  let userName = document.createElement("h2");
  userName.innerHTML = item.user.username;
  let createdAt = document.createElement("h3");
  createdAt.innerHTML = item.createdAt;
  commentHeaderDiv.appendChild(userImg);
  commentHeaderDiv.appendChild(userName);
  commentHeaderDiv.appendChild(createdAt);
  commentDataDiv.appendChild(commentHeaderDiv);
  commentDiv.appendChild(commentDataDiv);
  //   create comment body
  let commentBody = document.createElement("div");
  commentBody.className = `${className}-body`;
  let commentContent = document.createElement("p");
  // create edit mode box
  let editModeDiv = document.createElement("div");
  editModeDiv.className = "edit-mode";
  editModeDiv.classList.add("hide");
  let editModeTxt = document.createElement("textarea");
  let updateButton = document.createElement("button");
  let cancelButton = document.createElement("button");
  cancelButton.className = "cancel";
  cancelButton.innerHTML = "Cancel";
  updateButton.innerHTML = "update";
  if (className == "reply") {
    updateButton.addEventListener("click", () => {
      updateComment(_commentObject, _replyObject, true);
    });
  } else {
    updateButton.addEventListener("click", () => {
      updateComment(_commentObject, _replyObject);
    });
  }
  cancelButton.addEventListener("click", cancelEditMode);
  editModeDiv.appendChild(editModeTxt);
  editModeDiv.appendChild(cancelButton);
  editModeDiv.appendChild(updateButton);
  commentBody.appendChild(editModeDiv);
  //
  if (className == "reply") {
    commentContent.innerHTML = `@${item.replyingTo}`;
  }
  commentContent.innerHTML.length > 0
    ? (commentContent.innerHTML += ` ${item.content}`)
    : (commentContent.innerHTML = item.content);
  commentBody.appendChild(commentContent);
  commentDataDiv.appendChild(commentBody);
  // create the comment footer that contains the score and reply and actions
  let commentFooterDiv = document.createElement("div");
  commentFooterDiv.className = `${className}-footer`;
  // create score div
  let scoreDiv = document.createElement("div");
  scoreDiv.className = "score";
  let plusSpan = document.createElement("span");
  plusSpan.innerHTML = "+";
  plusSpan.addEventListener("click", updateScore);
  let minSpan = document.createElement("span");
  minSpan.innerHTML = "-";
  minSpan.addEventListener("click", updateScore);
  let ValueSpan = document.createElement("span");
  ValueSpan.innerHTML = item.score.toString();
  scoreDiv.appendChild(plusSpan);
  scoreDiv.appendChild(ValueSpan);
  scoreDiv.appendChild(minSpan);
  commentFooterDiv.appendChild(scoreDiv);

  // if the owner is the current user /
  //1- add actions buttons instead of reply button
  //2- add you flag
  if (isCurrentUser(currentUser, item)) {
    commentFooterDiv.appendChild(createActionsButtons());
    let youSpan = document.createElement("span");
    youSpan.className = "current-user";
    youSpan.innerHTML = "you";
    userName.appendChild(youSpan);
  } else {
    // create reply section div
    let replySectionDiv = document.createElement("div");
    replySectionDiv.className = "reply-section";
    let replyImg = document.createElement("img");
    replyImg.src = "images/icon-reply.svg";
    replyImg.alt = "reply Image";
    replySectionDiv.appendChild(replyImg);
    let replyBtn = document.createElement("button");
    replyBtn.className = "btn-reply";
    replyBtn.innerHTML = "Reply";
    replySectionDiv.appendChild(replyBtn);
    commentFooterDiv.appendChild(replySectionDiv);
    replySectionDiv.addEventListener("click", () => {
      _commentObject = item;
      divContainer = commentDiv;
      openReplyBox();
    });
  }
  commentDiv.appendChild(commentFooterDiv);
  return commentDiv;
}
// function to create -add new comment- box or popup if reply on comment.
function createAddCommentOrReplyBox(data: any, buttonName: string): any {
  let addCommentDiv = document.createElement("div");
  addCommentDiv.className = "add-comment";
  let commentTxt = document.createElement("textarea");
  commentTxt.setAttribute("placeholder", "Add comment...");
  commentTxt.setAttribute("id", "add-comment");
  let imgBtnDiv = document.createElement("div");
  imgBtnDiv.className = "img-btn";
  let currentUserImg = document.createElement("img");
  currentUserImg.src = data.currentUser.image.webp;
  currentUserImg.alt = "current user";
  let sendBtn = document.createElement("button");
  sendBtn.className = "btn-send";
  sendBtn.innerHTML = buttonName;
  if (buttonName.toLowerCase() == "reply") {
    addCommentDiv.classList.add("pop");
    let cancelReplybtn = document.createElement("button");
    cancelReplybtn.innerHTML = "Cancel";
    cancelReplybtn.className = "cancel";
    cancelReplybtn.addEventListener("click", cancelReply);
    imgBtnDiv.appendChild(cancelReplybtn);
  } else {
    addCommentDiv.classList.remove("pop");
  }
  imgBtnDiv.appendChild(sendBtn);
  addCommentDiv.appendChild(currentUserImg);
  addCommentDiv.appendChild(commentTxt);
  addCommentDiv.appendChild(imgBtnDiv);

  sendBtn.addEventListener("click", () => {
    addNewComment(sendBtn.innerHTML);
  });
  return addCommentDiv;
}
// function to create actions button that will appear in reply box if the owner is the current user.
function createActionsButtons() {
  let actionsDiv = document.createElement("div");
  actionsDiv.className = "actions";
  // delete section
  let deleteDiv = document.createElement("div");
  deleteDiv.className = "delete";
  let delImg = document.createElement("img");
  delImg.src = "images/icon-delete.svg";
  delImg.alt = "delete";
  let delButton = document.createElement("button");
  delButton.innerHTML = "Delete";
  deleteDiv.addEventListener("click", openDeletePopup);

  // edit section
  let editDiv = document.createElement("div");
  editDiv.className = "edit";
  deleteDiv.appendChild(delImg);
  deleteDiv.appendChild(delButton);
  let editImg = document.createElement("img");
  editImg.src = "images/icon-edit.svg";
  editImg.alt = "edit";
  let editButton = document.createElement("button");
  editButton.innerHTML = "Edit";
  editDiv.addEventListener("click", openEditBox);
  editDiv.appendChild(editImg);
  editDiv.appendChild(editButton);
  actionsDiv.appendChild(deleteDiv);
  actionsDiv.appendChild(editDiv);
  return actionsDiv;
}
// function to check if the reply user is the current user.
function isCurrentUser(username: string, item: any): boolean {
  if (username === item.user.username) return true;
  return false;
}
// function to open reply popup
function openReplyBox() {
  const overlyDiv = document.createElement("div");
  overlyDiv.className = "overly";
  overlyDiv.appendChild(createAddCommentOrReplyBox(result, "Reply"));
  mainContainer.appendChild(overlyDiv);
  // scroll to pop up position.
  mainContainer
    .querySelector(".overly > div")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}
// function to close reply popup.
function cancelReply() {
  mainContainer.querySelector(".overly")?.remove();
}
// function to open edit mode
function openEditBox(event: any) {
  // get the parent comment or reply div
  console.log(event.target);
  divContainer = event.target.parentNode.parentNode.parentNode.parentNode;
  //hide comment paragraph and show edit mode div and bind vlaues
  let commentParagraph = divContainer.querySelector("P");
  let commentEditModeTxt = divContainer.querySelector(".edit-mode");
  commentEditModeTxt.classList.remove("hide");
  commentEditModeTxt.querySelector("textarea").value =
    commentParagraph.innerHTML;
  commentParagraph.classList.add("hide");

  // check if it is a main comment or a reply
  if (divContainer.className == "comment") {
    _commentObject = result.comments.filter(
      (comment: commentObject) => comment.id == divContainer.dataset.index
    )[0];
    console.log("from if comment section", _replyObject);
  } else {
    result.comments.forEach((comment: any) => {
      _replyObject = comment.replies.filter(
        (reply: replyObject) => reply.id == divContainer.dataset.index
      )[0];
      if (_replyObject) {
        _commentObject = comment;
      }
    });
  }
}
// function to cancel edit mode
function cancelEditMode() {
  let commentParagraph = divContainer.querySelector("P");
  let commentEditModeTxt = divContainer.querySelector(".edit-mode");
  commentParagraph.classList.remove("hide");
  commentEditModeTxt.classList.add("hide");
}
// function to open delete popup.
function openDeletePopup(event: any) {
  divContainer = event.target.parentNode.parentNode.parentNode.parentNode;
  // create modal instance and open it.
  const myModal = new modal("del-modal", false);
  myModal.open(
    "Are you sure you want to delete this comment? this will remove the comment and can not be undo",
    "Delete Comment"
  );
}
// function to close delete modal.
function closeModal(modal: any, modalContent: any) {
  modalContent.remove();
  modal.style.display = "none";
}
// function handel delete modal popup events
function deletePopupEventsHandler() {
  document.addEventListener("click", (event: any) => {
    // get the modal and the modal content
    let modal = event.target.parentNode.parentNode.parentNode;
    let modalContent = event.target.parentNode.parentNode;
    if (event.target.id == "btnNo") {
      // close the modal
      closeModal(modal, modalContent);
    } else if (event.target.id == "btnYes") {
      // delete the comments
      deleteComment();
      closeModal(modal, modalContent);
    }
  });
}
// function to update score
function updateScore(event: any) {
  // get comment/reply parent div
  let parent = event.target.parentNode.parentNode.parentNode;
  // increment or decrement score.
  let action = event.target.innerHTML == "+" ? "plus" : "minus";
  let scoreValue: number = 0;
  switch (action) {
    case "plus":
      scoreValue = parseInt(event.target.nextElementSibling.innerHTML);
      scoreValue += 1;
      event.target.nextElementSibling.innerHTML = scoreValue;
      break;
    case "minus":
      scoreValue = parseInt(event.target.previousElementSibling.innerHTML);
      scoreValue > 0 ? (scoreValue -= 1) : (scoreValue = 0);
      event.target.previousElementSibling.innerHTML = scoreValue;
      break;
  }
  // update score in sotrage
  if (parent.className == "comment") {
    result.comments.forEach((comment: commentObject) => {
      if (comment.id == parent.dataset.index) {
        comment.score = scoreValue;
      }
    });
  } else {
    result.comments.forEach((comment: commentObject) => {
      if (comment.replies.length > 0) {
        comment.replies.forEach((reply: replyObject) => {
          if (reply.id == parent.dataset.index) {
            reply.score = scoreValue;
          }
        });
      }
    });
  }
  addToLocalStorage(result);
}
//#region  CRUD Operations
// function to load data from json file.
async function lodaData() {
  if (getFromLocalStorage()) {
    result = getFromLocalStorage();
  } else {
    let data = (await fetch(url)).json();
    result = await data;
    addToLocalStorage(result);
  }
  addDataToPage();
}
// add new comment
function addNewComment(buttonName: string) {
  let commentTxt: any;
  // if the clicked button is replly
  if (buttonName.toLowerCase() == "reply") {
    // create popup to add the reply and get the comment value
    let popUpDiv = document.querySelector(".pop") as HTMLDivElement;
    commentTxt = popUpDiv.querySelector("#add-comment") as HTMLInputElement;
    if (commentTxt.value == "") return false;
    // if the reply is for main comment
    if (divContainer.className == "comment") {
      // fill _replyComment object with user reply
      _replyObject = {
        id: Date.now(),
        content: commentTxt.value,
        createdAt: new Date().toLocaleDateString(),
        score: 0,
        replyingTo: _commentObject.user.username,
        user: {
          image: {
            png: result.currentUser.image.png,
            webp: result.currentUser.image.webp,
          },
          username: result.currentUser.username,
        },
      };
      // update the result comments > the current main comment and add the reply to thier replies array
      result.comments.forEach((comment: any) => {
        if (comment.id == _commentObject.id) {
          comment.replies.unshift(_replyObject);
        }
      });
    } else {
      result.comments.forEach((comment: commentObject) => {
        if (comment.replies.length > 0) {
          comment.replies.forEach((reply: replyObject, index) => {
            if (reply.id == _commentObject.id) {
              let newReply: replyObject = {
                id: Date.now(),
                content: commentTxt.value,
                createdAt: new Date().toLocaleDateString(),
                score: 0,
                replyingTo: reply.user.username,
                user: {
                  image: {
                    png: result.currentUser.image.png,
                    webp: result.currentUser.image.webp,
                  },
                  username: result.currentUser.username,
                },
              };
              comment.replies.splice(index + 1, 0, newReply);
            }
          });
        }
      });
    }
    // update the local storage and the page.
    addToLocalStorage(result);
    addDataToPage();
    cancelReply();
    return true;
  } else {
    commentTxt = <HTMLTextAreaElement>document.querySelector("#add-comment");
    if (commentTxt.value == "") {
      return false;
    }
    _commentObject = {
      id: Date.now(),
      content: commentTxt.value,
      createdAt: new Date().toLocaleDateString(),
      score: 0,
      user: {
        image: {
          png: result.currentUser.image.png,
          webp: result.currentUser.image.webp,
        },
        username: result.currentUser.username,
      },
      replies: [],
    };
    result.comments.unshift(_commentObject);
    commentTxt.value = "";
    addToLocalStorage(result);
    addDataToPage();
    mainContainer.scrollIntoView({ behavior: "smooth" });
    return true;
  }
}
// function to update comment content.
function updateComment(
  comment: commentObject,
  reply?: replyObject,
  hasReply: boolean = false
) {
  result.comments.forEach((_comment) => {
    let txt = divContainer.querySelector(".edit-mode textarea");
    if (_comment.id == comment.id) {
      if (hasReply) {
        if (reply) {
          _comment.replies.forEach((_reply: replyObject) => {
            if (_reply.id == reply.id) {
              _reply.content = txt.value.substring(txt.value.indexOf(" "));
              divContainer.querySelector("P").innerHTML = _reply.content;
            }
          });
        }
      } else {
        _comment.content = txt.value;
        divContainer.querySelector("P").innerHTML = _comment.content;
      }
    }
  });
  addToLocalStorage(result);
  cancelEditMode();
}
// function to delete comment
function deleteComment() {
  // if the it is a main comment
  if (divContainer.className == "comment") {
    result.comments = result.comments.filter(
      (comment: commentObject) => comment.id != divContainer.dataset.index
    );
  } else {
    // else it is a reply
    result.comments.forEach((comment: commentObject) => {
      if (comment.replies.length > 0) {
        comment.replies = comment.replies.filter(
          (reply: replyObject) => reply.id != divContainer.dataset.index
        );
      }
    });
  }
  addToLocalStorage(result);
  addDataToPage();
}
//#endregion
//#endregion
//#region Calls
lodaData();
deletePopupEventsHandler();
//#endregion
