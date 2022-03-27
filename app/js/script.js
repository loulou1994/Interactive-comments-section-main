const mainContainer = document.querySelector("main"); // Wraps the whole comments'section besides the user's input box
const deleteBtns = document.querySelectorAll(".overlay button"); // Buttons in the modal box on comment's deletion validation

let scoreList = []; // Storing every comment's score 
let rmScore;
let rmElement; // The comment to delete on delete btn click
let createdAtId = 0;

// Retrieve data from JSON file
const getData = async () => {
  let data = await fetch("data.json");
  return await data.json();
};

// Load comments from JSON file.
const loadContentMarkup = async () => {
  let content =  JSON.parse(localStorage.getItem('comments')) || await getData();

  !localStorage.getItem('comments') && localStorage.setItem('comments', JSON.stringify(content));

  content.comments.forEach(comment => {
    const replyMsg = comment.replies;
    const replyWrapper = comment.user.username === "juliusomo" ? loadComments(comment, null, true) : loadComments(comment);

    if (replyMsg) {
      replyMsg.forEach(reply => {
        if(reply.user.username == "juliusomo"){
          loadComments(reply, null, true, replyWrapper);
        }else{
          loadComments(reply, null, null, replyWrapper);
        }
      });
    }
  });

  userInputBox(content.currentUser);
};

// insert a user input box for a reply
const postUserBox = async (userBox, replyTo) => {
  let userData = await getData();
  userData = userData.currentUser;
  userInputBox(userData, userBox, replyTo);
};

// Post comment / reply to one
const postUserComment = async (value, mainNested, replyTo) => {
  let userData = await getData();
  userData = userData.currentUser;
  mainNested === mainContainer ? loadComments(userData, value, true) : loadComments(userData, value, true, mainNested, replyTo)
};

//Delete comment or not;
deleteBtns.forEach(btn => {
  btn.addEventListener('click', deleteComment);
});

loadContentMarkup();

// users' comment/reply box markup
function loadComments(commentData, userMsg, userInput, subWrapper, replyTo) {
  const theWrapper = subWrapper ? subWrapper : mainContainer;
  const divWrapper = document.createElement("div");
  const articleEl = document.createElement("article");
  const divEl = document.createElement("div");
  const imgEl = document.createElement("img");
  const spanEl = document.createElement("span");
  const postDate = userMsg ? createDate(++createdAtId) : createDate(commentData.id);
  const paragraph = document.createElement("p");
  const scoreContainer = document.createElement("div");
  const plusButton = document.createElement("button");
  const imgEl_btn = document.createElement("img");
  const spanEl_btn = document.createElement("span");
  const minusButton = document.createElement("button");
  const imgEl2_btn = document.createElement("img");
  const buttonEl_2 = userInput ? null : document.createElement("button");
  const imgEl_btn2 = document.createElement("img");

  divWrapper.className = subWrapper ? "grid nested-inputBox" : "flow";
  divWrapper.dataset.id = userMsg ? createdAtId : commentData.id;
  articleEl.className = "grid pd-full card";
  divEl.className = "flex card__user";
  imgEl.alt = "alt";
  imgEl.src = (userInput && userMsg) ? commentData.image.webp : commentData.user.image.webp;
  spanEl.className = "fs-bold fs-300";
  spanEl.textContent = (userInput && userMsg) ? commentData.username : commentData.user.username;
  paragraph.className = "card__comment";
  paragraph.textContent = userMsg ? userMsg : commentData.content;
  scoreContainer.className = "card__comment-score flex blue-mod fs-bold bg-str-lt-gray ";
  plusButton.dataset.score = "plus";
  imgEl_btn.className = "vote-button";
  imgEl_btn.alt = "Upvote-button";
  imgEl_btn.src = "./assets/icon-plus.svg";
  spanEl_btn.className = "score";
  spanEl_btn.textContent = userMsg ? 0 : commentData.score;
  minusButton.dataset.score = "minus";
  imgEl2_btn.className = "vote-button";
  imgEl2_btn.alt = "downvote-button";
  imgEl2_btn.src = "./assets/icon-minus.svg";
  imgEl_btn2.className = "reply-icon";
  imgEl_btn2.alt = "reply-icon";
  imgEl_btn2.src = "./assets/icon-reply.svg";
  
  if(!userMsg){
    createdAtId = createdAtId < commentData.id ? commentData.id : createdAtId;
    scoreList.push(parseInt(spanEl_btn.textContent));
  }
  
  if (!userInput) {
    buttonEl_2.className = "card__user-btns custom-btn flex fs-bold blue-mod";
    buttonEl_2.textContent = "Reply";
    
    buttonEl_2.addEventListener('click', e => {
      const commentContainer = e.currentTarget.parentElement;
      const nestedUserBox = commentContainer.parentElement.querySelector('.card--user')
      const repliedUser = commentContainer.querySelector('.fs-bold').textContent;
      const separatorBar = commentContainer.parentElement.querySelector('.separation-bar') || null;

      if (nestedUserBox){
        commentContainer.parentElement.removeChild(nestedUserBox);
        subWrapper ? separatorBar.style.gridRow = "1 / 2" : "";
      } else {
        subWrapper ? separatorBar.style.gridRow = "1 / 3" : "";
        postUserBox(commentContainer, repliedUser);
      }
    });
    
    buttonEl_2.insertAdjacentElement("afterbegin", imgEl_btn2);
  }
  
  if (subWrapper){
    const separatorBar = document.createElement("div");
    const userResponded = document.createElement('span');
    
    separatorBar.classList.add("separation-bar");
    userResponded.classList.add('respondedUser');
    userResponded.textContent = replyTo ? `@${replyTo} ` : `@${commentData.replyingTo} `;
    separatorBar.style.gridRow = "1 / 2";
    divWrapper.appendChild(separatorBar);
    paragraph.insertBefore(userResponded, paragraph.firstChild);
  }
  
  plusButton.addEventListener("click", addScore);
  minusButton.addEventListener("click", addScore);
  
  divEl.append(imgEl, spanEl, postDate);
  plusButton.appendChild(imgEl_btn);
  minusButton.appendChild(imgEl2_btn);
  scoreContainer.append(plusButton, spanEl_btn, minusButton);
  !userInput && articleEl.append(divEl, paragraph, scoreContainer, buttonEl_2);
  divWrapper.appendChild(articleEl);
  theWrapper.appendChild(divWrapper);
  
  if (userInput) {
    const youTag = document.createElement('span');
    const btnContainer = document.createElement("div");
    const deleteBtn = document.createElement("button");
    const deleteIcon = document.createElement("img");
    const editBtn = document.createElement("button");
    const editIcon = document.createElement("img");
    
    youTag.classList.add("user-reply");
    btnContainer.classList.add("card__user-btns", "flex")
    deleteBtn.classList.add("flex", "custom-btn", "fs-bold", "red-sof");
    editBtn.classList.add("flex", "custom-btn", "fs-bold", "blue-mod");
    deleteBtn.textContent = "Delete";
    editBtn.textContent = "Edit";
    deleteIcon.src = "./assets/icon-delete.svg";
    editIcon.src = "./assets/icon-edit.svg";
    deleteIcon.alt = "delete-icon";
    editIcon.alt = "edit-icon";
    youTag.textContent = "you";
    
    deleteBtn.addEventListener('click', e => {
      const scoresList = Array.from(document.querySelectorAll('.score'));
      document.body.querySelector(".overlay").classList.add('open');
      rmScore = scoresList.indexOf(e.currentTarget.parentElement.parentElement.querySelector('.score'));
      rmElement = e.currentTarget.parentElement.parentElement;
    });

    editBtn.addEventListener('click', editCommentTask)

    divEl.insertBefore(youTag, divEl.lastChild)
    deleteBtn.appendChild(deleteIcon);
    editBtn.appendChild(editIcon);
    btnContainer.append(deleteBtn, editBtn);
    articleEl.append(divEl, paragraph, scoreContainer, btnContainer);
  }
  
  userMsg && saveComment(divWrapper, createdAtId, replyTo, userMsg, commentData.image.webp, commentData.username);

  if (!subWrapper) {
    return divWrapper;
  }
}
// User input box markup to post commments
function userInputBox(userData, replyBox, replyTo) {
  const articleEl = document.createElement("article");
  const labelName = document.createElement("label");
  const labelSpan = document.createElement("span");
  const imgEl = document.createElement("img");
  const textInput = document.createElement("textarea");
  const buttonSub = document.createElement("button");
  
  articleEl.className = "container grid pd-full card card--user";
  labelName.for = "input-user";
  labelName.className = "profile-image card__label-image";
  labelSpan.textContent = userData.username;
  imgEl.src = userData.image.webp;
  imgEl.alt = "user-photo";
  textInput.name = "user-input";
  textInput.id = "input-user";
  textInput.className = "card__comment-input edit-text-box";
  textInput.placeholder = "add comment...";
  buttonSub.type = "submit";
  buttonSub.className = "send-update-btn";
  buttonSub.textContent = replyTo ? "REPLY" : "SEND";

  replyTo && articleEl.classList.remove('container');

  buttonSub.addEventListener("click", e => {
    postListener(e, replyTo)
  });

  labelName.append(labelSpan, imgEl);
  articleEl.append(labelName, textInput, buttonSub);
  (replyBox) ? replyBox.insertAdjacentElement('afterend', articleEl) : document.body.insertBefore(articleEl, document.body.lastElementChild);
}
// In/decrement the score of a user's comment
function addScore(e) {
  const scoreElements = Array.from(document.querySelectorAll('.score'));
  const pressedBtn = e.currentTarget.dataset.score;
  const clickedScore = e.currentTarget.parentElement.querySelector(".score");
  const currentScore = scoreList[scoreElements.indexOf(clickedScore)];
  const minusScoreLimit = currentScore - 1;
  const plusScoreLimit = currentScore + 1;
  let myPoint = 0;
  
  if (pressedBtn === "plus") {
    ++myPoint;
  }else if (pressedBtn === "minus") {
    --myPoint;
  }

  if(plusScoreLimit == clickedScore.textContent && pressedBtn === "plus"){
    --myPoint;
  }else if (minusScoreLimit == clickedScore.textContent && pressedBtn === "minus"){
    ++myPoint;
  }

  clickedScore.textContent = parseInt(clickedScore.textContent) + myPoint;

  saveScorContent(e.currentTarget.parentElement.parentElement, clickedScore.textContent);
}
// Edit the user's comment.
function editCommentTask(e){
  const mainParent = e.currentTarget.parentElement.parentElement;
  const paragraphEl = mainParent.querySelector('p');
  const textAreaEl = document.createElement('textarea');
  const updateBtn = document.createElement('button');
  
  if(paragraphEl){
    const respondedTo =  paragraphEl.firstElementChild;
    mainParent.classList.add("card--edit");
    textAreaEl.classList.add(paragraphEl.className, "edit-text-box");
    updateBtn.classList.add("send-update-btn");
    textAreaEl.rows = "3";
    textAreaEl.value = paragraphEl.lastChild.nodeValue;
    updateBtn.textContent = "UPDATE";

    updateBtn.addEventListener('click', e => {
      updateComment(mainParent, textAreaEl, paragraphEl, respondedTo, updateBtn);
    });

    mainParent.replaceChild(textAreaEl, paragraphEl);
    mainParent.appendChild(updateBtn);
  }
}
// Insert the edited user's comment
function updateComment(mainParent, textAreaEl, paragraphEl, respondedTo, updateBtn){
  mainParent.classList.remove('card--edit');
  paragraphEl.innerHTML = `<span class="respondedUser">${respondedTo.textContent}</span> ` + textAreaEl.value;

  saveScorContent(mainParent, textAreaEl.value, true);

  mainParent.replaceChild(paragraphEl, textAreaEl);
  mainParent.removeChild(updateBtn);
}
//Delete comment or not
function deleteComment(){
  const removeElement = rmElement.parentElement;
  const trueOrFalse = this.dataset.remove;
  document.body.querySelector('.overlay').classList.remove('open');

  if (trueOrFalse === "true"){
    saveScorContent(rmElement);
    removeElement.remove();
    scoreList.splice(rmScore, 1);
  }
}
//Event listener func for the send/reply button element
function postListener(e, replyTo){
    const listOfScores = Array.from(document.body.querySelectorAll('.score'));
    const parent = e.currentTarget.parentElement;
    const checkValue = parent.querySelector("textarea").value;
    let commentContainer = parent.closest('.flow') || null;
    const scoreBtns = commentContainer && commentContainer.querySelectorAll('.score');
    const sepratorBar = parent.parentElement.querySelector(".separation-bar") || null;
    const lastScore = commentContainer ? scoreBtns[scoreBtns.length - 1] : listOfScores[listOfScores.length - 1];

    if(checkValue){
      scoreList.splice(listOfScores.indexOf(lastScore) + 1, 0, 0);
      if(commentContainer){
        parent.parentElement.removeChild(parent);
        sepratorBar ? sepratorBar.style.gridRow = "1 / 2" : "";
      }else{
        commentContainer = mainContainer;
      }
      
      postUserComment(checkValue, commentContainer, replyTo);
    }
}
function saveComment(container, id, replyingTo, content, image, username){
  const score = 0;
  const user = {"image": {"webp": image}, "username": username};
  const listOfComments = JSON.parse(localStorage.getItem('comments'));

  if(container.parentElement === mainContainer){
    listOfComments.comments.push({id, content, score, user});
  }else{
    listOfComments.comments[container.parentElement.dataset.id - 1].replies.push({id, content, score, replyingTo, user});
  }

  localStorage.setItem("comments", JSON.stringify(listOfComments));
}
// Update a comment's score/content in local Storage
function saveScorContent(commentScored, scoreContent, update){
  let commentsData = JSON.parse(localStorage.getItem('comments'));
  const commentsTime = JSON.parse(localStorage.getItem('createdAt'));
  const commentIndex = parseInt(commentScored.parentElement.dataset.id);

  if(!commentScored.closest('.nested-inputBox')){
    if(update && scoreContent){
      commentsData.comments.find(comment => comment.id === commentIndex).content = scoreContent;
    }else if (scoreContent){
      commentsData.comments.find(comment => comment.id === commentIndex).score = parseInt(scoreContent);
    }else{
      const removeElement = commentsData.comments.find(comment => comment.id == commentIndex);
      commentsData.comments.splice(commentsData.comments.indexOf(removeElement), 1);
      commentsTime.splice(commentIndex - 1, 1);
      commentsData = updateIdsOnDel(commentIndex, commentsData);
        
    }
  }else{
    const mainCommentId =  commentsData.comments.find(comment => comment.id == commentScored.parentElement.parentElement.dataset.id );
    if(update && scoreContent){
      commentsData.comments[commentsData.comments.indexOf(mainCommentId)].replies.find(comment => comment.id == commentIndex).content = scoreContent;
    }else if (scoreContent){
      commentsData.comments[commentsData.comments.indexOf(mainCommentId)].replies.find(comment => comment.id == commentIndex).score = parseInt(scoreContent);
    }else{
      const mainCommentId =  commentsData.comments.find(comment => comment.id == commentScored.parentElement.parentElement.dataset.id );
      const removeElement = commentsData.comments[commentsData.comments.indexOf(mainCommentId)].replies.find(reply => reply.id == commentIndex);
      const elementIndex = commentsData.comments[commentsData.comments.indexOf(mainCommentId)].replies.indexOf(removeElement);

      commentsTime.splice(commentIndex - 1, 1);
      commentsData.comments[commentsData.comments.indexOf(mainCommentId)].replies.splice(elementIndex, 1);
      commentsData = updateIdsOnDel(commentIndex, commentsData);
    }
  }

  localStorage.setItem("comments", JSON.stringify(commentsData));
  localStorage.setItem("createdAt", JSON.stringify(commentsTime))
}
// Add/save comment posting time for every comment on their first page load 
function createDate(name){
  const dateTerms = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year"  
  ];
  let postTimes = JSON.parse(localStorage.getItem('createdAt')) || [];
  let elapsedTime = postTimes[name - 1];
  let currentTimeTerm;
  let timePassed;
  let convertedTime;

  if(elapsedTime){
    timePassed = Math.floor(Date.now() / 1000) - elapsedTime;

    if(timePassed > 59 && timePassed < 3600){
      convertedTime = Math.floor(timePassed / 60);
      currentTimeTerm = dateTerms[1];

    }else if (timePassed < 60){
      convertedTime = timePassed;
      currentTimeTerm = dateTerms[0];
    }
    
    if(timePassed > 3599 && timePassed < 86400){
      convertedTime = Math.floor(timePassed / 3600);
      currentTimeTerm = dateTerms[2];
    }
    
    if(timePassed > 86399){
      convertedTime = Math.floor(timePassed / 86400);
      currentTimeTerm = dateTerms[3];
    }

  } else{
    postTimes.push(Math.floor(Date.now() / 1000));
    localStorage.setItem("createdAt", JSON.stringify(postTimes));
  }

  if(convertedTime > 1){
    convertedTime = `${convertedTime} ${currentTimeTerm}s ago`;
  }else{
    convertedTime = `${convertedTime} ${currentTimeTerm} ago`;
  }

  return elapsedTime ? convertedTime : `0 ${dateTerms[0]} ago`;
}
//Update comments'ids in local Storage & html elements
function updateIdsOnDel(idDeleted, usersComments){
  const idElements = document.querySelectorAll("[data-id]");

  usersComments.comments.forEach(comment => {
    const replies = comment.replies || null;
    if (comment.id > idDeleted){
      comment.id -= 1;
    };
    if(replies){
      replies.forEach(reply => {
        if(reply.id > idDeleted){
          reply.id -= 1;
        }
      })
    }
  });
  idElements.forEach(element => {
    if (element.dataset.id > idDeleted){
      element.dataset.id = parseInt(element.dataset.id) - 1;
    }
  });
  return usersComments;
}