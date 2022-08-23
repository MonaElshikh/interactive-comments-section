var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import modal from "../js/modal-popup.js";
const url = "https://monaelshikh.github.io/interactive-comments-section/data/data.json";
const commentsDiv = document.querySelector(".comments");
let result;
let _commentObject;
let _replyObject;
let currentUser;
let mainContainer = document.querySelector(".container");
let divContainer;
function addToLocalStorage(source) {
    localStorage.setItem("comment-app", JSON.stringify(source));
}
function getFromLocalStorage() {
    if (localStorage.getItem("comment-app")) {
        return JSON.parse(localStorage.getItem("comment-app") || "");
    }
    return false;
}
function addDataToPage() {
    commentsDiv.innerHTML = "";
    let data = getFromLocalStorage();
    currentUser = data.currentUser.username;
    if (data.comments.length > 0) {
        data.comments.forEach((comment) => {
            if (commentsDiv) {
                commentsDiv.appendChild(createCommentOrReplyBox(comment, "comment"));
                if (comment.replies.length > 0) {
                    let repliesDiv = document.createElement("div");
                    repliesDiv.className = "replies";
                    comment.replies.forEach((reply) => {
                        repliesDiv.appendChild(createCommentOrReplyBox(reply, "reply"));
                    });
                    commentsDiv.appendChild(repliesDiv);
                }
            }
        });
        if (commentsDiv) {
            commentsDiv.appendChild(createAddCommentOrReplyBox(data, "Send"));
        }
    }
}
function createCommentOrReplyBox(item, className) {
    let commentDiv = document.createElement("div");
    commentDiv.className = className;
    commentDiv.setAttribute("data-index", item.id);
    let commentDataDiv = document.createElement("div");
    commentDataDiv.className = `${className}-data`;
    let commentHeaderDiv = document.createElement("div");
    commentHeaderDiv.className = `${className}-header`;
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
    let commentBody = document.createElement("div");
    commentBody.className = `${className}-body`;
    let commentContent = document.createElement("p");
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
    }
    else {
        updateButton.addEventListener("click", () => {
            updateComment(_commentObject, _replyObject);
        });
    }
    cancelButton.addEventListener("click", cancelEditMode);
    editModeDiv.appendChild(editModeTxt);
    editModeDiv.appendChild(cancelButton);
    editModeDiv.appendChild(updateButton);
    commentBody.appendChild(editModeDiv);
    if (className == "reply") {
        commentContent.innerHTML = `@${item.replyingTo}`;
    }
    commentContent.innerHTML.length > 0
        ? (commentContent.innerHTML += ` ${item.content}`)
        : (commentContent.innerHTML = item.content);
    commentBody.appendChild(commentContent);
    commentDataDiv.appendChild(commentBody);
    let commentFooterDiv = document.createElement("div");
    commentFooterDiv.className = `${className}-footer`;
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
    if (isCurrentUser(currentUser, item)) {
        commentFooterDiv.appendChild(createActionsButtons());
        let youSpan = document.createElement("span");
        youSpan.className = "current-user";
        youSpan.innerHTML = "you";
        userName.appendChild(youSpan);
    }
    else {
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
function createAddCommentOrReplyBox(data, buttonName) {
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
    }
    else {
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
function createActionsButtons() {
    let actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";
    let deleteDiv = document.createElement("div");
    deleteDiv.className = "delete";
    let delImg = document.createElement("img");
    delImg.src = "images/icon-delete.svg";
    delImg.alt = "delete";
    let delButton = document.createElement("button");
    delButton.innerHTML = "Delete";
    deleteDiv.addEventListener("click", openDeletePopup);
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
function isCurrentUser(username, item) {
    if (username === item.user.username)
        return true;
    return false;
}
function openReplyBox() {
    var _a;
    const overlyDiv = document.createElement("div");
    overlyDiv.className = "overly";
    overlyDiv.appendChild(createAddCommentOrReplyBox(result, "Reply"));
    mainContainer.appendChild(overlyDiv);
    (_a = mainContainer
        .querySelector(".overly > div")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
}
function cancelReply() {
    var _a;
    (_a = mainContainer.querySelector(".overly")) === null || _a === void 0 ? void 0 : _a.remove();
}
function openEditBox(event) {
    console.log(event.target);
    divContainer = event.target.parentNode.parentNode.parentNode.parentNode;
    let commentParagraph = divContainer.querySelector("P");
    let commentEditModeTxt = divContainer.querySelector(".edit-mode");
    commentEditModeTxt.classList.remove("hide");
    commentEditModeTxt.querySelector("textarea").value =
        commentParagraph.innerHTML;
    commentParagraph.classList.add("hide");
    if (divContainer.className == "comment") {
        _commentObject = result.comments.filter((comment) => comment.id == divContainer.dataset.index)[0];
        console.log("from if comment section", _replyObject);
    }
    else {
        result.comments.forEach((comment) => {
            _replyObject = comment.replies.filter((reply) => reply.id == divContainer.dataset.index)[0];
            if (_replyObject) {
                _commentObject = comment;
            }
        });
    }
}
function cancelEditMode() {
    let commentParagraph = divContainer.querySelector("P");
    let commentEditModeTxt = divContainer.querySelector(".edit-mode");
    commentParagraph.classList.remove("hide");
    commentEditModeTxt.classList.add("hide");
}
function openDeletePopup(event) {
    divContainer = event.target.parentNode.parentNode.parentNode.parentNode;
    const myModal = new modal("del-modal", false);
    myModal.open("Are you sure you want to delete this comment? this will remove the comment and can not be undo", "Delete Comment");
}
function closeModal(modal, modalContent) {
    modalContent.remove();
    modal.style.display = "none";
}
function deletePopupEventsHandler() {
    document.addEventListener("click", (event) => {
        let modal = event.target.parentNode.parentNode.parentNode;
        let modalContent = event.target.parentNode.parentNode;
        if (event.target.id == "btnNo") {
            closeModal(modal, modalContent);
        }
        else if (event.target.id == "btnYes") {
            deleteComment();
            closeModal(modal, modalContent);
        }
    });
}
function updateScore(event) {
    let parent = event.target.parentNode.parentNode.parentNode;
    let action = event.target.innerHTML == "+" ? "plus" : "minus";
    let scoreValue = 0;
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
    if (parent.className == "comment") {
        result.comments.forEach((comment) => {
            if (comment.id == parent.dataset.index) {
                comment.score = scoreValue;
            }
        });
    }
    else {
        result.comments.forEach((comment) => {
            if (comment.replies.length > 0) {
                comment.replies.forEach((reply) => {
                    if (reply.id == parent.dataset.index) {
                        reply.score = scoreValue;
                    }
                });
            }
        });
    }
    addToLocalStorage(result);
}
function lodaData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (getFromLocalStorage()) {
            result = getFromLocalStorage();
        }
        else {
            let data = (yield fetch(url)).json();
            result = yield data;
            addToLocalStorage(result);
        }
        addDataToPage();
    });
}
function addNewComment(buttonName) {
    let commentTxt;
    if (buttonName.toLowerCase() == "reply") {
        let popUpDiv = document.querySelector(".pop");
        commentTxt = popUpDiv.querySelector("#add-comment");
        if (commentTxt.value == "")
            return false;
        if (divContainer.className == "comment") {
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
            result.comments.forEach((comment) => {
                if (comment.id == _commentObject.id) {
                    comment.replies.unshift(_replyObject);
                }
            });
        }
        else {
            result.comments.forEach((comment) => {
                if (comment.replies.length > 0) {
                    comment.replies.forEach((reply, index) => {
                        if (reply.id == _commentObject.id) {
                            let newReply = {
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
        addToLocalStorage(result);
        addDataToPage();
        cancelReply();
        return true;
    }
    else {
        commentTxt = document.querySelector("#add-comment");
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
function updateComment(comment, reply, hasReply = false) {
    result.comments.forEach((_comment) => {
        let txt = divContainer.querySelector(".edit-mode textarea");
        if (_comment.id == comment.id) {
            if (hasReply) {
                if (reply) {
                    _comment.replies.forEach((_reply) => {
                        if (_reply.id == reply.id) {
                            _reply.content = txt.value.substring(txt.value.indexOf(" "));
                            divContainer.querySelector("P").innerHTML = _reply.content;
                        }
                    });
                }
            }
            else {
                _comment.content = txt.value;
                divContainer.querySelector("P").innerHTML = _comment.content;
            }
        }
    });
    addToLocalStorage(result);
    cancelEditMode();
}
function deleteComment() {
    if (divContainer.className == "comment") {
        result.comments = result.comments.filter((comment) => comment.id != divContainer.dataset.index);
    }
    else {
        result.comments.forEach((comment) => {
            if (comment.replies.length > 0) {
                comment.replies = comment.replies.filter((reply) => reply.id != divContainer.dataset.index);
            }
        });
    }
    addToLocalStorage(result);
    addDataToPage();
}
lodaData();
deletePopupEventsHandler();
//# sourceMappingURL=main.js.map